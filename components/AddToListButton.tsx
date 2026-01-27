"use client";

import { useState, useEffect } from "react";

interface List {
    id: string;
    name: string;
}

export default function AddToListButton({ seriesId }: { seriesId: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [lists, setLists] = useState<List[]>([]);
    const [loading, setLoading] = useState(false);
    const [adding, setAdding] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && lists.length === 0) {
            setLoading(true);
            // Fetch current user's lists
            // We need an endpoint that returns MY lists. 
            // The current GET /api/lists filters by user_id if provided, but we need the session user ID.
            // Let's assume we can fetch /api/lists/me or similar. 
            // Or we can just fetch /api/lists?user_id=ME (and handle ME in backend) or just fetch all and client filter (bad).
            // Let's create a specific endpoint for "my lists" or just use the existing one if we can get the ID.
            // Actually, let's just fetch /api/lists/my (we need to create this route or handle it in the main route).
            // For now, let's try to fetch /api/users/me/lists if that exists? No.
            // Let's use a client component approach where we might not have the user ID easily without context.
            // I'll create a new route /api/lists/me for this purpose.
            fetch("/api/lists/me")
                .then((res) => res.json())
                .then((data) => {
                    if (Array.isArray(data)) setLists(data);
                })
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [isOpen]);

    const handleAdd = async (listId: string) => {
        setAdding(listId);
        try {
            const res = await fetch(`/api/lists/${listId}/items`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ series_id: seriesId }),
            });
            if (!res.ok) throw new Error("Error al añadir");
            alert("Añadido a la lista correctamente");
            setIsOpen(false);
        } catch (error) {
            console.error(error);
            alert("Error al añadir a la lista");
        } finally {
            setAdding(null);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors flex items-center gap-2"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Añadir a Lista
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-card border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
                    <div className="p-3 border-b border-white/5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Mis Listas
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                        {loading ? (
                            <div className="p-4 text-center text-xs text-gray-500">Cargando...</div>
                        ) : lists.length === 0 ? (
                            <div className="p-4 text-center text-xs text-gray-500">
                                No tienes listas. <a href="/lists/create" className="text-primary hover:underline">Crear una</a>
                            </div>
                        ) : (
                            lists.map((list) => (
                                <button
                                    key={list.id}
                                    onClick={() => handleAdd(list.id)}
                                    disabled={adding === list.id}
                                    className="w-full text-left px-4 py-3 text-sm text-gray-200 hover:bg-white/5 transition-colors flex justify-between items-center"
                                >
                                    <span className="truncate">{list.name}</span>
                                    {adding === list.id && <span className="text-xs text-gray-500">...</span>}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
