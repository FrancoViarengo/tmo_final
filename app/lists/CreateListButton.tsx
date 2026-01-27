"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export default function CreateListButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isPublic, setIsPublic] = useState(true);
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
                toast.error("Debes iniciar sesión para crear listas");
                router.push("/login");
                return;
            }

            const res = await fetch("/api/lists", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, description, is_public: isPublic }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Error al crear lista");
            }

            toast.success("Lista creada correctamente");
            setIsOpen(false);
            setName("");
            setDescription("");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="px-4 py-2 bg-primary hover:bg-orange-700 text-white font-bold rounded-md transition-colors shadow-lg shadow-orange-900/20 text-sm"
            >
                CREAR LISTA
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#1f1f1f] border border-white/10 rounded-xl w-full max-w-md p-6 shadow-2xl relative">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>

                        <h2 className="text-2xl font-bold text-white mb-6">Nueva Lista</h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Nombre</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Ej: Mis Isekais Favoritos"
                                    className="w-full bg-[#141414] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Descripción (Opcional)</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="¿De qué trata esta lista?"
                                    rows={3}
                                    className="w-full bg-[#141414] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary resize-none"
                                />
                            </div>

                            <div className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/5">
                                <input
                                    type="checkbox"
                                    id="isPublic"
                                    checked={isPublic}
                                    onChange={(e) => setIsPublic(e.target.checked)}
                                    className="w-5 h-5 text-primary bg-[#141414] border-gray-600 rounded focus:ring-primary"
                                />
                                <label htmlFor="isPublic" className="text-sm text-gray-300 cursor-pointer select-none">
                                    Hacer pública esta lista
                                    <span className="block text-xs text-gray-500">Cualquiera podrá verla en la sección de listas</span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-primary hover:bg-orange-700 text-white font-bold rounded-md transition-colors disabled:opacity-50"
                            >
                                {loading ? "Creando..." : "CREAR LISTA"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
