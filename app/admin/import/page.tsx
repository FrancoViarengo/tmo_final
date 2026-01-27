"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export default function ImportPage() {
    const [url, setUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (msg: string) => setLogs((prev) => [...prev, msg]);

    const handleImport = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setLogs([]);
        addLog("Iniciando importación...");

        try {
            const response = await fetch("/api/admin/import/mangadex", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Error en la importación");
            }

            addLog(`✅ Serie importada: ${data.series.title}`);
            addLog(`📄 Capítulos procesados: ${data.chaptersCount}`);
            toast.success("Importación completada con éxito");
        } catch (error: any) {
            addLog(`❌ Error: ${error.message}`);
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-white mb-6">Importar desde MangaDex</h1>

            <div className="bg-card border border-white/5 rounded-lg p-6 mb-8">
                <form onSubmit={handleImport} className="space-y-4">
                    <div>
                        <label className="block text-gray-400 text-sm font-bold mb-2">
                            URL de MangaDex o ID
                        </label>
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://mangadex.org/title/..."
                            className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white focus:border-primary focus:outline-none"
                            disabled={isLoading}
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            Ejemplo: https://mangadex.org/title/a1c7c817-4e59-43b7-9365-096758918370/one-piece
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !url}
                        className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? "Importando (esto puede tardar)..." : "Comenzar Importación"}
                    </button>
                </form>
            </div>

            {logs.length > 0 && (
                <div className="bg-black/40 border border-white/10 rounded-lg p-4 font-mono text-xs text-gray-300 max-h-60 overflow-y-auto">
                    {logs.map((log, i) => (
                        <div key={i} className="mb-1">
                            {log}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
