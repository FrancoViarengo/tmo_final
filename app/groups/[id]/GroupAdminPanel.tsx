"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

interface Member {
    user_id: string;
    role: string;
    profiles: {
        username: string;
        avatar_url: string | null;
    };
    created_at: string;
}

interface Group {
    id: string;
    name: string;
    website: string | null;
    discord: string | null;
    description: string | null;
    recruitment_status: string; // 'open', 'closed'
    recruitment_description: string | null;
}

export default function GroupAdminPanel({ group, members }: { group: Group, members: Member[] }) {
    const [activeTab, setActiveTab] = useState<'details' | 'members' | 'recruitment'>('details');
    const [loading, setLoading] = useState(false);

    // Form States
    const [name, setName] = useState(group.name);
    const [website, setWebsite] = useState(group.website || "");
    const [discord, setDiscord] = useState(group.discord || "");
    const [description, setDescription] = useState(group.description || "");
    const [recStatus, setRecStatus] = useState(group.recruitment_status || 'closed');
    const [recDesc, setRecDesc] = useState(group.recruitment_description || "");

    const router = useRouter();

    const handleUpdate = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/groups/${group.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    website,
                    discord,
                    description,
                    recruitment_status: recStatus,
                    recruitment_description: recDesc
                }),
            });

            if (!res.ok) throw new Error("Error al actualizar");

            toast.success("Grupo actualizado correctamente");
            router.refresh();
        } catch (error) {
            toast.error("Error al actualizar el grupo");
        } finally {
            setLoading(false);
        }
    };

    const handleKick = async (userId: string) => {
        if (!confirm("¿Estás seguro de expulsar a este miembro?")) return;

        try {
            const res = await fetch(`/api/groups/${group.id}/kick`, {
                method: "POST", // The existing route uses POST
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: userId }),
            });

            if (!res.ok) throw new Error("Error al expulsar");

            toast.success("Miembro expulsado");
            router.refresh();
        } catch (error) {
            toast.error("Error al expulsar miembro");
        }
    };

    return (
        <div className="bg-card border border-white/5 rounded-xl p-6 mt-8 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Administración del Grupo
            </h2>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-white/10 mb-6">
                <button
                    onClick={() => setActiveTab('details')}
                    className={`pb-2 text-sm font-medium transition-colors ${activeTab === 'details' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-white'}`}
                >
                    Detalles
                </button>
                <button
                    onClick={() => setActiveTab('members')}
                    className={`pb-2 text-sm font-medium transition-colors ${activeTab === 'members' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-white'}`}
                >
                    Miembros ({members.length})
                </button>
                <button
                    onClick={() => setActiveTab('recruitment')}
                    className={`pb-2 text-sm font-medium transition-colors ${activeTab === 'recruitment' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-white'}`}
                >
                    Reclutamiento
                </button>
            </div>

            {/* Content */}
            <div className="space-y-4">
                {activeTab === 'details' && (
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="text-xs text-gray-500 uppercase font-bold">Nombre</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-[#141414] border border-white/10 rounded p-2 text-white" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 uppercase font-bold">Descripción</label>
                            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full bg-[#141414] border border-white/10 rounded p-2 text-white" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-gray-500 uppercase font-bold">Website</label>
                                <input type="text" value={website} onChange={(e) => setWebsite(e.target.value)} className="w-full bg-[#141414] border border-white/10 rounded p-2 text-white" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase font-bold">Discord</label>
                                <input type="text" value={discord} onChange={(e) => setDiscord(e.target.value)} className="w-full bg-[#141414] border border-white/10 rounded p-2 text-white" />
                            </div>
                        </div>
                        <button onClick={handleUpdate} disabled={loading} className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-2 rounded mt-2">
                            {loading ? "Guardando..." : "Guardar Cambios"}
                        </button>
                    </div>
                )}

                {activeTab === 'members' && (
                    <div className="space-y-2">
                        {members.map(member => (
                            <div key={member.user_id} className="flex items-center justify-between bg-white/5 p-3 rounded">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                                        {member.profiles?.avatar_url ? <img src={member.profiles.avatar_url} className="w-8 h-8 rounded-full" /> : member.profiles?.username?.[0]}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white">{member.profiles?.username || 'Usuario'}</div>
                                        <div className="text-xs text-gray-400 capitalize">{member.role}</div>
                                    </div>
                                </div>
                                {member.role !== 'leader' && (
                                    <button
                                        onClick={() => handleKick(member.user_id)}
                                        className="text-xs text-red-400 hover:text-red-300 border border-red-500/30 px-2 py-1 rounded hover:bg-red-500/10"
                                    >
                                        Expulsar
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'recruitment' && (
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs text-gray-500 uppercase font-bold text-white">Estado</label>
                            <select value={recStatus} onChange={(e) => setRecStatus(e.target.value)} className="w-full bg-[#141414] border border-white/10 rounded p-2 text-white mt-1">
                                <option value="closed">Cerrado</option>
                                <option value="open">Abierto (Buscando Staff)</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 uppercase font-bold">Mensaje de Reclutamiento</label>
                            <textarea
                                value={recDesc}
                                onChange={(e) => setRecDesc(e.target.value)}
                                rows={4}
                                placeholder="Ej: Buscamos limpiadores y traductores de Coreano..."
                                className="w-full bg-[#141414] border border-white/10 rounded p-2 text-white mt-1"
                            />
                        </div>
                        <button onClick={handleUpdate} disabled={loading} className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-2 rounded mt-2">
                            {loading ? "Guardando..." : "Actualizar Estado"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
