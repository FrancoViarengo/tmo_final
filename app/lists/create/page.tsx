"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateListPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isPublic, setIsPublic] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) {
            setMessage("El nombre es obligatorio");
            return;
        }

        setIsSubmitting(true);
        setMessage(null);

        try {
            const res = await fetch("/api/lists", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, description, is_public: isPublic }),
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Error al crear lista");

            setMessage("Lista creada exitosamente. Redirigiendo...");
            setTimeout(() => {
                router.push(`/lists/${json.id}`);
            }, 1500);
        } catch (err: any) {
            setMessage(err.message || "Error al crear lista");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-card p-8 rounded-xl border border-white/10 shadow-2xl">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
                        Crear Nueva Lista
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-400">
                        Organiza tus series favoritas en listas personalizadas
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label htmlFor="name" className="sr-only">Nombre de la Lista</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-white/10 placeholder-gray-500 text-white bg-white/5 rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                placeholder="Nombre de la Lista"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="description" className="sr-only">Descripción</label>
                            <textarea
                                id="description"
                                name="description"
                                rows={3}
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-white/10 placeholder-gray-500 text-white bg-white/5 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                placeholder="Descripción (opcional)..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isPublic"
                                checked={isPublic}
                                onChange={(e) => setIsPublic(e.target.checked)}
                                className="rounded border-white/10 bg-white/5 text-primary focus:ring-primary"
                            />
                            <label htmlFor="isPublic" className="text-sm text-gray-300">Hacer pública esta lista</label>
                        </div>
                    </div>

                    {message && (
                        <div className={`text-sm text-center ${message.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>
                            {message}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
                        >
                            {isSubmitting ? "Creando..." : "Crear Lista"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
