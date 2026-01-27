"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Props {
    slot: "header" | "sidebar" | "content";
    className?: string;
}

export default function AdUnit({ slot, className = "" }: Props) {
    const [isPremium, setIsPremium] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkPremium = async () => {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();

            if (session?.user) {
                const { data } = await supabase
                    .from("profiles")
                    .select("is_premium")
                    .eq("id", session.user.id)
                    .single();

                if ((data as any)?.is_premium) {
                    setIsPremium(true);
                }
            }
            setIsLoading(false);
        };

        checkPremium();
    }, []);

    if (isLoading) return null; // Or return a skeleton if you want strict layout stability
    if (isPremium) return null;

    return (
        <div className={`w-full bg-[#1f1f1f] border border-white/5 flex flex-col items-center justify-center text-center p-4 ${className} overflow-hidden`}>
            <span className="text-[10px] uppercase text-gray-500 mb-2 tracking-widest">Publicidad</span>
            <div className="w-full h-full min-h-[100px] bg-white/5 rounded flex items-center justify-center text-gray-400 text-sm">
                {slot === "header" && "Banner Publicitario (728x90)"}
                {slot === "sidebar" && "Anuncio Lateral (300x250)"}
                {slot === "content" && "Anuncio de Contenido (Native)"}
            </div>
            <button className="mt-2 text-[10px] text-primary hover:underline">
                Eliminar anuncios con Premium
            </button>
        </div>
    );
}
