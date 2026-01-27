import { createServerClient } from '@/lib/supabase/server';
import Link from 'next/link';
import ProfileTabs from './ProfileTabs';

export const revalidate = 0;

interface Profile {
    id: string;
    username: string | null;
    role: string;
    reputation: number;
    created_at: string;
}

async function getUserProfile() {
    const supabase = createServerClient();
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;

    if (!userId || !sessionData.session) return null;

    // 1. Fetch Profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    // 2. Fetch Lists
    const { data: lists } = await supabase
        .from('lists')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    // 3. Fetch Groups
    const { data: groups } = await supabase
        .from('group_members')
        .select('group_id, role, group:scanlation_groups(name)')
        .eq('user_id', userId);

    // 4. Fetch Uploads (Chapters uploaded by user)
    // Assuming 'chapters' table has 'uploader_id' or we verify by linking series.
    // For now, let's assume specific logic or skip if not implemented.
    // Let's check if 'chapters' has 'owner_id' or similar in schema. 
    // Usually handled via RLS or specific column. Let's try 'uploader_id' if it exists or just skip for MVP.
    // Based on previous files, we haven't seen specific uploader column ref, but let's try.
    // If it fails, we return empty array.
    const { data: uploads } = await (supabase.from('chapters') as any)
        .select('id, title, chapter_number, created_at, series:series_id(title)')
        .eq('uploader_id', userId) // Hypothetical column
        .limit(20);

    // 5. Fetch Badges
    const { data: allBadges } = await supabase.from('badges').select('*');
    const { data: userBadges } = await supabase.from('user_badges').select('badge_id, awarded_at').eq('user_id', userId);

    const badges = (allBadges as any[])?.map((b: any) => ({
        ...b,
        earned_at: (userBadges as any[])?.find((ub: any) => ub.badge_id === b.id)?.awarded_at
    })) || [];

    const stats = {
        readChapters: 0,
        comments: 0,
        lists: lists?.length || 0,
        reputation: (profile as unknown as Profile)?.reputation || 0,
        groups: groups?.length || 0,
        badges: userBadges?.length || 0
    };

    return {
        profile: profile as unknown as Profile,
        stats,
        user: sessionData.session.user,
        lists: lists || [],
        groups: groups || [],
        uploads: uploads || [],
        badges: badges || []
    };
}

export default async function ProfilePage() {
    const data = await getUserProfile();

    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-white mb-4">Inicia sesión para ver tu perfil</h1>
                    <Link href="/login" className="px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-orange-700 transition">
                        Iniciar Sesión
                    </Link>
                </div>
            </div>
        );
    }

    const { profile, stats, user, lists, groups, uploads, badges } = data;

    return (
        <div className="min-h-screen pb-12">
            {/* Header Banner */}
            <div className="h-48 bg-gradient-to-r from-gray-900 to-gray-800 relative">
                <div className="absolute inset-0 bg-black/20"></div>
            </div>

            <div className="max-w-5xl mx-auto px-4 -mt-20 relative z-10">
                <div className="flex flex-col md:flex-row gap-6 items-end md:items-center mb-8">
                    <div className="w-32 h-32 rounded-full border-4 border-[#141414] bg-gray-700 flex items-center justify-center text-4xl font-bold text-white shadow-xl overflow-hidden">
                        {user.user_metadata?.avatar_url ? (
                            <img src={user.user_metadata.avatar_url} alt={profile?.username || "Avatar"} className="w-full h-full object-cover" />
                        ) : (
                            (profile?.username || user.email || '?').charAt(0).toUpperCase()
                        )}
                    </div>
                    <div className="flex-1 mb-2">
                        <h1 className="text-3xl font-bold text-white">{profile?.username || 'Usuario'}</h1>
                        <p className="text-gray-400">{user.email}</p>
                        <div className="flex gap-2 mt-2">
                            <span className="bg-primary/20 text-primary border border-primary/30 text-xs px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                                {profile?.role || 'User'}
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-3 mb-2">
                        <Link href="/profile/edit" className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-md font-medium transition-colors">
                            Editar Perfil
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Stats Column */}
                    <div className="space-y-6">
                        <div className="bg-card border border-white/5 rounded-xl p-6">
                            <h3 className="font-bold text-white mb-4 border-b border-white/5 pb-2">Estadísticas</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Reputación</span>
                                    <span className="text-primary font-bold">{stats.reputation}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Grupos</span>
                                    <span className="text-white font-bold">{stats.groups}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Listas</span>
                                    <span className="text-white font-bold">{stats.lists}</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Settings */}
                        <div className="bg-card border border-white/5 rounded-xl p-6">
                            <h3 className="font-bold text-white mb-4 border-b border-white/5 pb-2">Configuración</h3>
                            <div className="flex flex-col gap-2">
                                <button className="text-left text-sm text-gray-300 hover:text-white transition-colors py-1">
                                    Cambiar Contraseña
                                </button>
                                <button className="text-left text-sm text-gray-300 hover:text-white transition-colors py-1">
                                    Notificaciones
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Column (Tabs) */}
                    <ProfileTabs lists={lists} groups={groups} uploads={uploads} badges={badges} username={profile?.username || 'User'} />
                </div>
            </div>
        </div>
    );
}
