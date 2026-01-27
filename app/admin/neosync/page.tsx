"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { toast } from "sonner";

export default function NeoSyncDashboard() {
    const [tasks, setTasks] = useState<any[]>([]);
    const [stats, setStats] = useState({ pending: 0, processing: 0, completed: 0, error: 0 });
    const [mangaId, setMangaId] = useState("");
    const [loading, setLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const fetchData = async () => {
        try {
            // Fetch stats
            const { data: queueData } = await supabase.from('sync_queue').select('status');
            const newStats = { pending: 0, processing: 0, completed: 0, error: 0 };
            queueData?.forEach((t: any) => {
                if (t.status in newStats) (newStats as any)[t.status]++;
            });
            setStats(newStats);

            // Fetch recent/active tasks
            const { data: recentTasks } = await supabase
                .from('sync_queue')
                .select('*')
                .order('updated_at', { ascending: false })
                .limit(20);
            setTasks(recentTasks || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000); // Polling every 10s
        return () => clearInterval(interval);
    }, []);

    const handleForceSync = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!mangaId) return;

        setIsSyncing(true);
        try {
            const res = await fetch("/api/admin/force-sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ manga_id: mangaId, priority: 100 }),
            });
            const json = await res.json();
            if (res.ok) {
                toast.success("Manga añadido a la cola de alta prioridad");
                setMangaId("");
                fetchData();
            } else {
                toast.error(json.error || "Error al forzar sync");
            }
        } catch (err) {
            toast.error("Error de conexión");
        } finally {
            setIsSyncing(false);
        }
    };

    const clearCompleted = async () => {
        const { error } = await supabase.from('sync_queue').delete().eq('status', 'completed');
        if (error) toast.error("Error al limpiar");
        else {
            toast.success("Cola limpia");
            fetchData();
        }
    };

    if (loading) return <div className="p-8 text-gray-400">Cargando motor...</div>;

    return (
        <div className="space-y-8 max-w-6xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <span className="text-orange-500">NeoSync</span> Control Center
                    </h1>
                    <p className="text-gray-400 mt-1">Monitoreo autónomo de contenido y cola de sincronización.</p>
                </div>
                <button
                    onClick={fetchData}
                    className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-card p-4 rounded-xl border border-white/5 bg-white/2">
                    <div className="text-xs font-bold text-gray-500 uppercase">Pendientes</div>
                    <div className="text-2xl font-black text-blue-400">{stats.pending}</div>
                </div>
                <div className="glass-card p-4 rounded-xl border border-orange-500/20 bg-orange-500/5">
                    <div className="text-xs font-bold text-orange-500 uppercase">Procesando</div>
                    <div className="text-2xl font-black text-orange-400">{stats.processing}</div>
                </div>
                <div className="glass-card p-4 rounded-xl border border-green-500/20 bg-green-500/5">
                    <div className="text-xs font-bold text-green-500 uppercase">Completados</div>
                    <div className="text-2xl font-black text-green-400">{stats.completed}</div>
                </div>
                <div className="glass-card p-4 rounded-xl border border-red-500/20 bg-red-500/5">
                    <div className="text-xs font-bold text-red-500 uppercase">Errores</div>
                    <div className="text-2xl font-black text-red-500">{stats.error}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Manual Trigger Form */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-card p-6 rounded-2xl border border-white/10 bg-[#1f1f1f]">
                        <h2 className="text-sm font-bold text-white mb-4 uppercase tracking-widest">Forzar Sincronización</h2>
                        <form onSubmit={handleForceSync} className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">ID MangaDex</label>
                                <input
                                    type="text"
                                    value={mangaId}
                                    onChange={(e) => setMangaId(e.target.value)}
                                    placeholder="UUID de la serie..."
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-orange-500 outline-none"
                                />
                            </div>
                            <button
                                disabled={isSyncing}
                                className="w-full py-2 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg font-bold text-white text-sm hover:from-orange-500 hover:to-red-500 transition-all disabled:opacity-50"
                            >
                                {isSyncing ? "Enviando..." : "Inyectar en Cola"}
                            </button>
                        </form>
                    </div>

                    <div className="glass-card p-6 rounded-2xl border border-white/10 bg-[#1f1f1f]">
                        <h2 className="text-sm font-bold text-white mb-4 uppercase tracking-widest">Acciones Rápidas</h2>
                        <button
                            onClick={clearCompleted}
                            className="w-full py-2 border border-white/10 rounded-lg text-sm font-medium text-gray-400 hover:bg-white/5 transition-colors"
                        >
                            Limpiar Completados
                        </button>
                    </div>
                </div>

                {/* Queue Table */}
                <div className="lg:col-span-2">
                    <div className="glass-card rounded-2xl border border-white/10 bg-[#1f1f1f] overflow-hidden">
                        <div className="p-4 border-b border-white/10 flex justify-between items-center">
                            <h2 className="text-sm font-bold text-white uppercase tracking-widest">Tareas Recientes</h2>
                            <span className="text-[10px] text-gray-500">Actualización cada 10s</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-black/20 text-[10px] uppercase font-bold text-gray-500">
                                    <tr>
                                        <th className="px-4 py-3">Serie/Task</th>
                                        <th className="px-4 py-3">Tipo</th>
                                        <th className="px-4 py-3">Estado</th>
                                        <th className="px-4 py-3 text-right">Intentos</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-sm">
                                    {tasks.map((task) => (
                                        <tr key={task.id} className="hover:bg-white/2 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col">
                                                    <span className="text-gray-200 font-medium truncate max-w-[200px]">
                                                        {task.metadata?.title || task.external_id}
                                                    </span>
                                                    <span className="text-[10px] text-gray-500 truncate">{task.external_id}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 capitalize">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${task.type === 'series' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                                    {task.type}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`flex items-center gap-1.5 ${task.status === 'completed' ? 'text-green-400' :
                                                        task.status === 'processing' ? 'text-orange-400 animate-pulse' :
                                                            task.status === 'error' ? 'text-red-400' : 'text-gray-400'
                                                    }`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${task.status === 'completed' ? 'bg-green-400' :
                                                            task.status === 'processing' ? 'bg-orange-400' :
                                                                task.status === 'error' ? 'bg-red-400' : 'bg-gray-400'
                                                        }`} />
                                                    {task.status}
                                                </span>
                                                {task.last_error && <p className="text-[10px] text-red-500/70 truncate max-w-[150px]">{task.last_error}</p>}
                                            </td>
                                            <td className="px-4 py-3 text-right text-gray-500 font-mono">
                                                {task.attempts}
                                            </td>
                                        </tr>
                                    ))}
                                    {tasks.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="p-8 text-center text-gray-500 italic">No hay tareas en el radar.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
