import { createServerClient } from '@/lib/supabase/server';

export const revalidate = 0;

async function getStats() {
    const supabase = createServerClient();

    // Mock stats for now, replace with real counts if available via RPC or separate queries
    // Supabase count can be expensive if not optimized, using simple queries for demo
    const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { count: seriesCount } = await supabase.from('series').select('*', { count: 'exact', head: true });
    const { count: chaptersCount } = await supabase.from('chapters').select('*', { count: 'exact', head: true });
    const { count: groupsCount } = await supabase.from('scanlation_groups').select('*', { count: 'exact', head: true });

    return {
        users: usersCount || 0,
        series: seriesCount || 0,
        chapters: chaptersCount || 0,
        groups: groupsCount || 0,
    };
}

export default async function AdminDashboard() {
    const stats = await getStats();

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-card border border-white/5 p-6 rounded-xl shadow-sm">
                    <div className="text-sm text-gray-400 font-medium uppercase tracking-wider">Usuarios Totales</div>
                    <div className="mt-2 text-3xl font-black text-white">{stats.users}</div>
                </div>
                <div className="bg-card border border-white/5 p-6 rounded-xl shadow-sm">
                    <div className="text-sm text-gray-400 font-medium uppercase tracking-wider">Series</div>
                    <div className="mt-2 text-3xl font-black text-primary">{stats.series}</div>
                </div>
                <div className="bg-card border border-white/5 p-6 rounded-xl shadow-sm">
                    <div className="text-sm text-gray-400 font-medium uppercase tracking-wider">Capítulos</div>
                    <div className="mt-2 text-3xl font-black text-white">{stats.chapters}</div>
                </div>
                <div className="bg-card border border-white/5 p-6 rounded-xl shadow-sm">
                    <div className="text-sm text-gray-400 font-medium uppercase tracking-wider">Grupos</div>
                    <div className="mt-2 text-3xl font-black text-white">{stats.groups}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-card border border-white/5 rounded-xl p-6">
                    <h2 className="text-lg font-bold text-white mb-4">Actividad Reciente</h2>
                    <div className="text-gray-500 text-sm text-center py-10">
                        Gráfico de actividad (Próximamente)
                    </div>
                </div>
                <div className="bg-card border border-white/5 rounded-xl p-6">
                    <h2 className="text-lg font-bold text-white mb-4">Reportes Pendientes</h2>
                    <div className="text-gray-500 text-sm text-center py-10">
                        No hay reportes pendientes.
                    </div>
                </div>
            </div>
        </div>
    );
}
