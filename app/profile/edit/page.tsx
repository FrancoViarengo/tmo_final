"use client";

import { createBrowserClient } from "@supabase/ssr";
import { toast } from "sonner";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EditProfilePage() {
    const [username, setUsername] = useState("");
    const [userId, setUserId] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
                return;
            }
            setUserId(session.user.id);
            // Fetch current profile
            const { data } = await supabase.from('profiles').select('username').eq('id', session.user.id).single();
            if (data?.username) setUsername(data.username);
        };
        fetchUser();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ username })
                .eq('id', userId);

            if (error) throw error;
            toast.success("Perfil actualizado");
            router.push('/profile');
        } catch (error: any) {
            toast.error(error.message || "Error al actualizar perfil");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 px-4 bg-background">
            <div className="max-w-2xl mx-auto bg-card border border-white/5 rounded-xl p-8 shadow-xl">
                <h1 className="text-3xl font-bold text-white mb-6">Editar Perfil</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Nombre de Usuario</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 bg-[#141414] border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <Link href="/profile" className="px-4 py-2 text-gray-400 hover:text-white transition">
                            Cancelar
                        </Link>
                        <button
                            disabled={loading}
                            className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-orange-700 transition shadow-lg disabled:opacity-50"
                        >
                            {loading ? "Guardando..." : "Guardar Cambios"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
