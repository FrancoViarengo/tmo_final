"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function JoinButton({ groupId, isMember }: { groupId: string, isMember: boolean }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleJoin = async () => {
        if (isMember) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/groups/${groupId}/join`, { method: "POST" });
            if (!res.ok) throw new Error("Error al unirse");
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Error al unirse al grupo");
        } finally {
            setLoading(false);
        }
    };

    if (isMember) {
        return (
            <button disabled className="px-4 py-2 rounded-full bg-green-600/20 text-green-500 font-semibold border border-green-600/50 cursor-default">
                Ya eres miembro
            </button>
        );
    }

    return (
        <button
            onClick={handleJoin}
            disabled={loading}
            className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors disabled:opacity-50"
        >
            {loading ? "Uniéndose..." : "Unirse al Grupo"}
        </button>
    );
}
