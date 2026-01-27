"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface Report {
    id: string;
    content_type: string;
    content_id: string;
    reason: string;
    status: string;
    created_at: string;
    user_id: string;
}

export default function AdminDMCAPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const supabase = createClient();

    const fetchReports = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from("dmca_reports")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            toast.error("Error cargando reportes");
        } else {
            setReports(data || []);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        const { error } = await (supabase.from("dmca_reports") as any)
            .update({ status: newStatus })
            .eq("id", id);

        if (error) {
            toast.error("Error actualizando estado");
        } else {
            toast.success("Estado actualizado");
            fetchReports();
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-white mb-6">Gestión de DMCA</h1>

            {isLoading ? (
                <div className="text-white">Cargando...</div>
            ) : (
                <div className="bg-card border border-white/5 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-sm text-gray-300">
                        <thead className="bg-white/5 uppercase text-xs font-bold text-white">
                            <tr>
                                <th className="px-6 py-3">Fecha</th>
                                <th className="px-6 py-3">Tipo</th>
                                <th className="px-6 py-3">Razón</th>
                                <th className="px-6 py-3">Estado</th>
                                <th className="px-6 py-3">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {reports.map((report) => (
                                <tr key={report.id} className="hover:bg-white/5 transition">
                                    <td className="px-6 py-4">
                                        {new Date(report.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 capitalize">{report.content_type}</td>
                                    <td className="px-6 py-4 truncate max-w-xs" title={report.reason}>
                                        {report.reason}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`px-2 py-1 rounded text-xs font-bold uppercase ${report.status === "pending"
                                                ? "bg-yellow-500/20 text-yellow-500"
                                                : report.status === "resolved"
                                                    ? "bg-green-500/20 text-green-500"
                                                    : "bg-gray-500/20 text-gray-500"
                                                }`}
                                        >
                                            {report.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 flex gap-2">
                                        {report.status === "pending" && (
                                            <>
                                                <button
                                                    onClick={() => handleUpdateStatus(report.id, "resolved")}
                                                    className="text-green-400 hover:text-green-300 font-medium"
                                                >
                                                    Resolver
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStatus(report.id, "dismissed")}
                                                    className="text-red-400 hover:text-red-300 font-medium"
                                                >
                                                    Descartar
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {reports.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        No hay reportes DMCA pendientes.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
