"use client";

import { useEffect } from "react";

export default function GlobalError({
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
        <html>
            <body className="bg-background text-foreground min-h-screen flex items-center justify-center p-4">
                <div className="text-center space-y-4 max-w-md w-full">
                    <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold">Algo salió mal críticamente</h2>
                    <p className="text-gray-400">
                        Un error inesperado ha ocurrido y la aplicación no puede recuperarse.
                    </p>
                    <div className="pt-4 flex justify-center gap-4">
                        <button
                            onClick={() => reset()}
                            className="px-6 py-2 bg-primary hover:bg-orange-600 text-white rounded-lg transition-colors font-medium"
                        >
                            Intentar de nuevo
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2 border border-white/10 hover:bg-white/5 text-white rounded-lg transition-colors"
                        >
                            Recargar página
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
