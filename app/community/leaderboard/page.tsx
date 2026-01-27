import { createServerClient } from '@/lib/supabase/server';
import Link from 'next/link';

export const revalidate = 3600; // Revalidate every hour

async function getLeaderboards() {
    const supabase = createServerClient();

    const [readers, uploaders, commenters] = await Promise.all([
        supabase.from('view_top_readers').select('*').limit(10),
        supabase.from('view_top_uploaders').select('*').limit(10),
        supabase.from('view_top_commenters').select('*').limit(10)
    ]);

    return {
        readers: (readers.data || []) as any[],
        uploaders: (uploaders.data || []) as any[],
        commenters: (commenters.data || []) as any[]
    };
}

export default async function LeaderboardPage() {
    const { readers, uploaders, commenters } = await getLeaderboards();

    return (
        <div className="min-h-screen bg-background py-12 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-orange-400 mb-4">
                        Tablas de Clasificación
                    </h1>
                    <p className="text-gray-400">
                        Los usuarios más destacados de nuestra comunidad
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Top Readers */}
                    <div className="bg-card border border-white/5 rounded-xl overflow-hidden shadow-lg">
                        <div className="p-4 bg-gradient-to-b from-blue-900/20 to-transparent border-b border-white/5">
                            <h2 className="text-xl font-bold text-blue-400 flex items-center gap-2">
                                📖 Top Lectores
                            </h2>
                        </div>
                        <div className="divide-y divide-white/5">
                            {readers.map((user, index) => (
                                <div key={user.user_id} className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
                                    <span className={`text-2xl font-bold w-8 text-center ${index < 3 ? 'text-yellow-500' : 'text-gray-600'}`}>
                                        {index + 1}
                                    </span>
                                    <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden shrink-0">
                                        {user.avatar_url ? (
                                            <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-lg font-bold text-white">
                                                {user.username?.[0]?.toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-white truncate">{user.username}</p>
                                        <p className="text-xs text-blue-400 font-medium">{user.read_count} Capítulos</p>
                                    </div>
                                </div>
                            ))}
                            {readers.length === 0 && <div className="p-8 text-center text-gray-500">No hay datos aún</div>}
                        </div>
                    </div>

                    {/* Top Uploaders */}
                    <div className="bg-card border border-white/5 rounded-xl overflow-hidden shadow-lg">
                        <div className="p-4 bg-gradient-to-b from-green-900/20 to-transparent border-b border-white/5">
                            <h2 className="text-xl font-bold text-green-400 flex items-center gap-2">
                                📤 Top Uploaders
                            </h2>
                        </div>
                        <div className="divide-y divide-white/5">
                            {uploaders.map((user, index) => (
                                <div key={user.user_id} className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
                                    <span className={`text-2xl font-bold w-8 text-center ${index < 3 ? 'text-yellow-500' : 'text-gray-600'}`}>
                                        {index + 1}
                                    </span>
                                    <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden shrink-0">
                                        {user.avatar_url ? (
                                            <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-lg font-bold text-white">
                                                {user.username?.[0]?.toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-white truncate">{user.username}</p>
                                        <p className="text-xs text-green-400 font-medium">{user.upload_count} Subidas</p>
                                    </div>
                                </div>
                            ))}
                            {uploaders.length === 0 && <div className="p-8 text-center text-gray-500">No hay datos aún</div>}
                        </div>
                    </div>

                    {/* Top Commenters */}
                    <div className="bg-card border border-white/5 rounded-xl overflow-hidden shadow-lg">
                        <div className="p-4 bg-gradient-to-b from-purple-900/20 to-transparent border-b border-white/5">
                            <h2 className="text-xl font-bold text-purple-400 flex items-center gap-2">
                                💬 Top Comentaristas
                            </h2>
                        </div>
                        <div className="divide-y divide-white/5">
                            {commenters.map((user, index) => (
                                <div key={user.user_id} className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
                                    <span className={`text-2xl font-bold w-8 text-center ${index < 3 ? 'text-yellow-500' : 'text-gray-600'}`}>
                                        {index + 1}
                                    </span>
                                    <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden shrink-0">
                                        {user.avatar_url ? (
                                            <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-lg font-bold text-white">
                                                {user.username?.[0]?.toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-white truncate">{user.username}</p>
                                        <p className="text-xs text-purple-400 font-medium">{user.comment_count} Comentarios</p>
                                    </div>
                                </div>
                            ))}
                            {commenters.length === 0 && <div className="p-8 text-center text-gray-500">No hay datos aún</div>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
