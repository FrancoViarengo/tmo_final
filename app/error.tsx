"use client";

import { useEffect } from "react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-[60vh] flex items-center justify-center p-4">
            <div className="text-center space-y-4 max-w-md w-full bg-[#1f1f1f] p-8 rounded-xl border border-white/5 shadow-2xl">
                <div className="w-12 h-12 bg-orange-500/10 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h2 className="text-xl font-bold text-white">¡Ups! Algo falló</h2>
                <p className="text-sm text-gray-400 break-words">
                    {error.message || "No pudimos cargar esta sección. Por favor intenta nuevamente."}
                </p>
                <button
                    onClick={() => reset()}
                    className="w-full px-4 py-2 bg-primary hover:bg-orange-600 text-white rounded-lg transition-colors font-medium shadow-lg shadow-orange-900/20"
                >
                    Reintentar
                </button>
            </div>
        </div>
    );
}
