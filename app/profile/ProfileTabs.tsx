"use client";

import { useState } from "react";
import Link from "next/link";
import BadgesTab from "./BadgesTab";

interface ProfileTabsProps {
    lists: any[];
    groups: any[];
    uploads: any[];
    badges: any[];
    username: string;
}

export default function ProfileTabs({ lists, groups, uploads, badges, username }: ProfileTabsProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'lists' | 'groups' | 'uploads' | 'badges'>('overview');

    return (
        <div className="md:col-span-2 space-y-6">
            <div className="flex border-b border-white/10 mb-6">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-white'}`}
                >
                    Resumen
                </button>
                <button
                    onClick={() => setActiveTab('badges')}
                    className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'badges' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-white'}`}
                >
                    Logros
                </button>
                <button
                    onClick={() => setActiveTab('lists')}
                    className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${activeTab === 'lists' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-white'}`}
                >
                    Mis Listas ({lists.length})
                </button>
                <button
                    onClick={() => setActiveTab('groups')}
                    className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${activeTab === 'groups' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-white'}`}
                >
                    Mis Grupos ({groups.length})
                </button>
                {uploads.length > 0 && (
                    <button
                        onClick={() => setActiveTab('uploads')}
                        className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${activeTab === 'uploads' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-white'}`}
                    >
                        Subidas ({uploads.length})
                    </button>
                )}
            </div>

            {activeTab === 'overview' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="bg-card border border-white/5 rounded-xl p-6">
                        <h3 className="font-bold text-white mb-4">Actividad Reciente</h3>
                        <div className="space-y-4">
                            {/* Placeholder for future activity feed */}
                            <div className="text-gray-500 text-sm italic">
                                No hay actividad reciente para mostrar.
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'badges' && (
                <BadgesTab badges={badges} />
            )}

            {activeTab === 'lists' && (
                <div className="grid grid-cols-1 gap-4 animate-in fade-in duration-300">
                    {lists.length === 0 ? (
                        <div className="text-center py-10 bg-white/5 rounded-xl border border-white/5 border-dashed">
                            <p className="text-gray-400">No tienes listas creadas.</p>
                            <Link href="/lists" className="text-primary hover:underline mt-2 inline-block">Crear una lista</Link>
                        </div>
                    ) : (
                        lists.map((list) => (
                            <Link key={list.id} href={`/lists/${list.id}`} className="bg-card border border-white/5 p-4 rounded-xl flex items-center justify-between hover:border-primary/50 transition group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                                        {list.name[0]}
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold group-hover:text-primary transition-colors">{list.name}</h4>
                                        <p className="text-xs text-gray-400">{list.is_public ? 'Pública' : 'Privada'} • {new Date(list.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-500">
                                    Ver detalles &rarr;
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            )}

            {activeTab === 'groups' && (
                <div className="grid grid-cols-1 gap-4 animate-in fade-in duration-300">
                    {groups.length === 0 ? (
                        <div className="text-center py-10 bg-white/5 rounded-xl border border-white/5 border-dashed">
                            <p className="text-gray-400">No perteneces a ningún grupo.</p>
                            <Link href="/groups" className="text-primary hover:underline mt-2 inline-block">Buscar grupos</Link>
                        </div>
                    ) : (
                        groups.map((item) => (
                            <Link key={item.group_id} href={`/groups/${item.group_id}`} className="bg-card border border-white/5 p-4 rounded-xl flex items-center justify-between hover:border-primary/50 transition group">
                                <div>
                                    <h4 className="text-white font-bold group-hover:text-primary transition-colors">{item.group?.name || 'Grupo Desconocido'}</h4>
                                    <span className="text-xs uppercase bg-white/10 px-2 py-0.5 rounded text-gray-300 border border-white/5">{item.role}</span>
                                </div>
                                <div className="text-sm text-gray-500">
                                    Ver grupo &rarr;
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            )}

            {activeTab === 'uploads' && (
                <div className="space-y-2 animate-in fade-in duration-300">
                    {uploads.map((ch) => (
                        <div key={ch.id} className="bg-white/5 p-3 rounded flex justify-between items-center text-sm">
                            <div className="flex flex-col">
                                <span className="font-bold text-white max-w-md truncate">{ch.series?.title || 'Serie desconocida'}</span>
                                <span className="text-gray-400">Capítulo {ch.chapter_number}</span>
                            </div>
                            <span className="text-xs text-gray-500">{new Date(ch.created_at).toLocaleDateString()}</span>
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
}
