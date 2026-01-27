"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function FollowButton({ groupId, isFollowing }: { groupId: string, isFollowing: boolean }) {
    const router = useRouter();
    const [following, setFollowing] = useState(isFollowing);
    const [loading, setLoading] = useState(false);

    const handleFollow = async () => {
        setLoading(true);
        try {
            const method = following ? "DELETE" : "POST";
            const res = await fetch(`/api/groups/${groupId}/follow`, { method });
            if (!res.ok) throw new Error("Error updating follow status");

            setFollowing(!following);
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Error al actualizar seguimiento");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleFollow}
            disabled={loading}
            className={`px-4 py-2 rounded-full font-semibold transition-colors ${following
                    ? "bg-white/10 text-gray-300 hover:bg-white/20"
                    : "bg-primary text-white hover:bg-orange-700"
                }`}
        >
            {loading ? "..." : following ? "Siguiendo" : "Seguir"}
        </button>
    );
}
