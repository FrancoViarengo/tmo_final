"use client";

import { useMemo, useState } from 'react';

type Upload = {
  id: string;
  uploader_id?: string | null;
  series_id?: string | null;
  chapter_id?: string | null;
  status?: string | null;
  bucket?: string | null;
  path?: string | null;
  file_type?: string | null;
  file_size?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export default function UploadsTable({ uploads }: { uploads: Upload[] }) {
  const [status, setStatus] = useState<string>('all');
  const [q, setQ] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return uploads.filter((u) => {
      const matchesStatus = status === 'all' || u.status === status;
      const text = `${u.path || ''} ${u.series_id || ''} ${u.chapter_id || ''} ${u.uploader_id || ''}`.toLowerCase();
      const matchesText = text.includes(q.toLowerCase());
      return matchesStatus && matchesText;
    });
  }, [uploads, status, q]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    if (!confirm(`¿Cambiar estado a ${newStatus}?`)) return;
    setUpdating(id);
    try {
      const res = await fetch(`/api/admin/uploads/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Error updating status');
      // Refresh page to show new status
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert('Error al actualizar estado');
    } finally {
      setUpdating(null);
    }
  };

  const getStatusColor = (s: string | null | undefined) => {
    switch (s) {
      case 'approved': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      default: return 'bg-white/10 text-gray-400 border-white/10';
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      <div className="flex flex-wrap gap-2 p-4 text-sm text-white bg-white/5">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 rounded bg-white/10 border border-white/10 text-white"
        >
          <option value="all">Todos</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="processing">Processing</option>
          <option value="processed">Processed</option>
          <option value="error">Error</option>
        </select>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar path/uploader/serie"
          className="px-3 py-2 rounded bg-white/10 border border-white/10 text-white placeholder:text-gray-300"
        />
      </div>
      <table className="w-full text-sm">
        <thead className="bg-white/5 text-gray-200">
          <tr>
            <th className="px-4 py-3 text-left">Path</th>
            <th className="px-4 py-3 text-left">Uploader</th>
            <th className="px-4 py-3 text-left">Serie/Cap</th>
            <th className="px-4 py-3 text-left">Estado</th>
            <th className="px-4 py-3 text-left">Acciones</th>
            <th className="px-4 py-3 text-left">Creado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {filtered.length === 0 && (
            <tr>
              <td className="px-4 py-4 text-gray-400" colSpan={6}>
                Sin uploads.
              </td>
            </tr>
          )}
          {filtered.map((u) => (
            <tr key={u.id} className="hover:bg-white/5">
              <td className="px-4 py-3 text-xs text-gray-300 max-w-[200px] truncate" title={u.path || ''}>{u.path}</td>
              <td className="px-4 py-3 text-gray-200">{u.uploader_id}</td>
              <td className="px-4 py-3 text-gray-200">
                {u.series_id} {u.chapter_id ? `• ${u.chapter_id}` : ''}
              </td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded-full text-xs border uppercase ${getStatusColor(u.status)}`}>
                  {u.status}
                </span>
              </td>
              <td className="px-4 py-3 flex gap-2">
                {u.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate(u.id, 'approved')}
                      disabled={updating === u.id}
                      className="px-2 py-1 bg-green-600/20 hover:bg-green-600/40 text-green-400 rounded text-xs transition-colors"
                    >
                      Aprobar
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(u.id, 'rejected')}
                      disabled={updating === u.id}
                      className="px-2 py-1 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded text-xs transition-colors"
                    >
                      Rechazar
                    </button>
                  </>
                )}
              </td>
              <td className="px-4 py-3 text-gray-400 text-xs">
                {u.created_at ? new Date(u.created_at).toLocaleString() : ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
