"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface Props {
    contentId: string;
    contentType: "series" | "chapter" | "comment";
    trigger?: React.ReactNode;
}

export default function ReportModal({ contentId, contentType, trigger }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [reason, setReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reason.trim()) return;

        setIsSubmitting(true);
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            toast.error("Debes iniciar sesión para reportar contenido");
            setIsSubmitting(false);
            return;
        }

        const { error } = await (supabase.from("dmca_reports") as any).insert({
            user_id: session.user.id,
            content_id: contentId,
            content_type: contentType,
            reason: reason,
        });

        if (error) {
            toast.error("Error al enviar reporte");
        } else {
            toast.success("Reporte enviado correctamente");
            setIsOpen(false);
            setReason("");
        }
        setIsSubmitting(false);
    };

    return (
        <>
            <div onClick={() => setIsOpen(true)} className="cursor-pointer">
                {trigger || (
                    <button className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        Reportar
                    </button>
                )}
            </div>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#1f1f1f] border border-white/10 rounded-lg p-6 w-full max-w-md shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-2">Reportar Contenido</h3>
                        <p className="text-sm text-gray-400 mb-4">
                            Describe la razón del reporte (ej. derechos de autor, contenido inapropiado).
                        </p>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full h-32 bg-black/20 border border-white/10 rounded p-3 text-white focus:border-red-500 focus:outline-none resize-none"
                                placeholder="Explica el motivo..."
                                required
                            />
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold transition-colors disabled:opacity-50"
                                >
                                    {isSubmitting ? "Enviando..." : "Enviar Reporte"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
