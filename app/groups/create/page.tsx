"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { toast } from "sonner";
import Link from "next/link";

export default function CreateGroupPage() {
    const [name, setName] = useState("");
    const [website, setWebsite] = useState("");
    const [discord, setDiscord] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                toast.error("Debes iniciar sesión");
                router.push("/login");
                return;
            }

            const res = await fetch("/api/groups", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, website, discord, description }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Error al crear grupo");
            }

            const group = await res.json();
            toast.success("Grupo creado correctamente");
            router.push(`/groups/${group.id}`);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto bg-card border border-white/5 rounded-xl p-8 shadow-2xl">
                <div className="mb-8">
                    <Link href="/groups" className="text-gray-400 hover:text-white text-sm mb-4 block">
                        &larr; Volver a Grupos
                    </Link>
                    <h1 className="text-3xl font-bold text-white">Crear Nuevo Grupo</h1>
                    <p className="text-gray-400 mt-2">Fundar tu propio Scanlation nunca ha sido tan fácil.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Nombre del Grupo *</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ej: Solo Leveling Scans"
                            className="w-full bg-[#141414] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Sitio Web (Opcional)</label>
                        <input
                            type="url"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            placeholder="https://misitio.com"
                            className="w-full bg-[#141414] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Discord (Opcional)</label>
                        <input
                            type="url"
                            value={discord}
                            onChange={(e) => setDiscord(e.target.value)}
                            placeholder="https://discord.gg/..."
                            className="w-full bg-[#141414] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Descripción</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Cuéntanos sobre tu grupo..."
                            rows={4}
                            className="w-full bg-[#141414] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors resize-none"
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-primary to-orange-600 hover:from-orange-600 hover:to-primary text-white font-bold rounded-lg shadow-lg shadow-orange-900/20 transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Creando..." : "FUNDAR GRUPO"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
