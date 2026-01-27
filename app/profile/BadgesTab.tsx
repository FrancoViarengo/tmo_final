"use client";

interface Badge {
    id: string;
    name: string;
    description: string;
    icon_url: string;
    earned_at?: string; // If present, user has earned it
}

interface BadgesTabProps {
    badges: Badge[];
}

export default function BadgesTab({ badges }: BadgesTabProps) {
    const earnedCount = badges.filter(b => b.earned_at).length;
    const progress = Math.round((earnedCount / badges.length) * 100) || 0;

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Progress Header */}
            <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="text-2xl">🏆</span> Tus Logros
                    </h3>
                    <p className="text-gray-300 text-sm">Has desbloqueado {earnedCount} de {badges.length} medallas disponibles.</p>
                </div>
                <div className="flex items-center gap-3 bg-black/20 px-4 py-2 rounded-lg">
                    <span className="text-2xl font-black text-yellow-500">{progress}%</span>
                    <div className="flex flex-col text-xs text-gray-400">
                        <span>COMPLETADO</span>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {badges.map((badge) => {
                    const isEarned = !!badge.earned_at;
                    return (
                        <div
                            key={badge.id}
                            className={`relative p-4 rounded-xl border flex flex-col items-center text-center gap-3 transition-all ${isEarned
                                    ? 'bg-card border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.1)]'
                                    : 'bg-white/5 border-white/5 opacity-60 grayscale'
                                }`}
                        >
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-1 ${isEarned ? 'bg-gradient-to-br from-yellow-500 to-orange-600 text-white shadow-lg' : 'bg-gray-800 text-gray-600'}`}>
                                {badge.icon_url?.startsWith('http') ? (
                                    <img src={badge.icon_url} alt={badge.name} className="w-10 h-10 object-contain" />
                                ) : (
                                    <span>🏅</span>
                                )}
                            </div>

                            <div>
                                <h4 className={`font-bold text-sm ${isEarned ? 'text-white' : 'text-gray-400'}`}>{badge.name}</h4>
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{badge.description}</p>
                            </div>

                            {isEarned && (
                                <div className="absolute top-2 right-2 text-yellow-500 text-xs" title={`Conseguido el ${new Date(badge.earned_at!).toLocaleDateString()}`}>
                                    ✨
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
