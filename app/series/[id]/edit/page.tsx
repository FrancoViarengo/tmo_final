"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EditSeriesPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        description: "",
        status: "ongoing",
        type: "Manga",
        cover_url: "",
    });

    useEffect(() => {
        fetch(`/api/series?q=${params.id}`) // Reusing list API might be tricky if it filters. Better to fetch specific.
            // Actually, let's use the public page data fetching logic or a new GET endpoint.
            // For now, let's try to fetch from the public API if available, or just use the client supabase if we had it exposed.
            // Since we don't have a direct GET /api/series/[id], we might need to rely on the list endpoint filtering by ID if supported, or add GET to the route we just made.
            // Wait, I didn't add GET to app/api/series/[id]/route.ts. Let's fix that or fetch via client component logic if possible.
            // I'll assume I can fetch via the list endpoint for now or I should add GET to the [id] route.
            // Let's add GET to the [id] route in a separate step if needed. For now, I'll try to fetch from the list endpoint filtering by ID if possible, or just add GET.
            // Actually, the list endpoint filters by 'q' (title).
            // Let's just add GET to the [id] route. It's cleaner.
            // I will proceed with creating this file, and then I will update the route.ts to include GET.
            .then(() => { });

        // Placeholder fetch
        const fetchSeries = async () => {
            try {
                // We need a way to get single series data JSON.
                // I'll add GET to the route I just created.
                const res = await fetch(`/api/series/${params.id}`);
                if (!res.ok) throw new Error("Error fetching series");
                const json = await res.json();
                setFormData({
                    title: json.title,
                    slug: json.slug,
                    description: json.description || "",
                    status: json.status,
                    type: json.type,
                    cover_url: json.cover_url || "",
                });
            } catch (err) {
                console.error(err);
                setMessage("Error al cargar la serie");
            } finally {
                setLoading(false);
            }
        };
        fetchSeries();
    }, [params.id]);

    const handleChange = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const res = await fetch(`/api/series/${params.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error("Error al actualizar");

            setMessage("Serie actualizada correctamente");
            router.refresh();
            setTimeout(() => router.push(`/series/${params.id}`), 1000);
        } catch (err: any) {
            setMessage(err.message || "Error al actualizar");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("¿Estás seguro de que quieres eliminar esta serie? Esta acción no se puede deshacer fácilmente.")) return;

        setDeleting(true);
        try {
            const res = await fetch(`/api/series/${params.id}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Error al eliminar");

            router.push("/series");
            router.refresh();
        } catch (err: any) {
            setMessage(err.message || "Error al eliminar");
            setDeleting(false);
        }
    };

    if (loading) return <div className="p-10 text-white text-center">Cargando...</div>;

    return (
        <div className="max-w-2xl mx-auto px-4 py-10 text-white">
            <h1 className="text-3xl font-bold mb-8">Editar Serie</h1>

            <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 rounded-xl border border-white/10">
                <div>
                    <label className="block text-sm text-gray-300 mb-2">Título</label>
                    <input
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 focus:outline-none focus:border-primary"
                    />
                </div>

                <div>
                    <label className="block text-sm text-gray-300 mb-2">Slug</label>
                    <input
                        name="slug"
                        value={formData.slug}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 focus:outline-none focus:border-primary"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-gray-300 mb-2">Tipo</label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 focus:outline-none focus:border-primary"
                        >
                            <option value="Manga">Manga</option>
                            <option value="Manhwa">Manhwa</option>
                            <option value="Manhua">Manhua</option>
                            <option value="Novel">Novela</option>
                            <option value="One Shot">One Shot</option>
                            <option value="Doujinshi">Doujinshi</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-300 mb-2">Estado</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 focus:outline-none focus:border-primary"
                        >
                            <option value="ongoing">En Emisión</option>
                            <option value="completed">Completado</option>
                            <option value="hiatus">Hiatus</option>
                            <option value="dropped">Cancelado</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm text-gray-300 mb-2">Descripción</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={5}
                        className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 focus:outline-none focus:border-primary"
                    />
                </div>

                <div>
                    <label className="block text-sm text-gray-300 mb-2">URL Portada</label>
                    <input
                        name="cover_url"
                        value={formData.cover_url}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 focus:outline-none focus:border-primary"
                    />
                </div>

                {message && (
                    <div className={`p-3 rounded ${message.includes('Error') ? 'bg-red-500/20 text-red-200' : 'bg-green-500/20 text-green-200'}`}>
                        {message}
                    </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={deleting}
                        className="px-4 py-2 text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                    >
                        {deleting ? "Eliminando..." : "Eliminar Serie"}
                    </button>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2 bg-primary hover:bg-orange-700 text-white rounded font-medium transition-colors shadow disabled:opacity-50"
                        >
                            {saving ? "Guardando..." : "Guardar Cambios"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
