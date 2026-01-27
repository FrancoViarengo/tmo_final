"use client";

import { deleteComment, restoreComment } from './actions';
import { useMemo, useState, useTransition } from 'react';

type Comment = {
  id: string;
  user_id: string | null;
  series_id: string | null;
  chapter_id: string | null;
  content: string;
  is_deleted: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

export default function CommentsTable({ comments }: { comments: Comment[] }) {
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'deleted'>('all');

  const filtered = useMemo(() => {
    return comments.filter((c) => {
      const matchesText =
        c.content.toLowerCase().includes(query.toLowerCase()) ||
        (c.user_id || '').toLowerCase().includes(query.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && !c.is_deleted) ||
        (statusFilter === 'deleted' && !!c.is_deleted);
      return matchesText && matchesStatus;
    });
  }, [comments, query, statusFilter]);

  const handleToggle = (id: string, deleted: boolean) => {
    startTransition(async () => {
      if (deleted) {
        await restoreComment(id);
      } else {
        await deleteComment(id);
      }
    });
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      <div className="flex flex-wrap gap-2 p-4 text-sm text-white bg-white/5">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por texto o user_id"
          className="px-3 py-2 rounded bg-white/10 border border-white/10 text-white placeholder:text-gray-300"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-3 py-2 rounded bg-white/10 border border-white/10 text-white"
        >
          <option value="all">Todos</option>
          <option value="active">Activos</option>
          <option value="deleted">Eliminados</option>
        </select>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-white/5 text-gray-200">
          <tr>
            <th className="px-4 py-3 text-left">Contenido</th>
            <th className="px-4 py-3 text-left">Usuario</th>
            <th className="px-4 py-3 text-left">Serie/Cap</th>
            <th className="px-4 py-3 text-left">Estado</th>
            <th className="px-4 py-3 text-left">Creado</th>
            <th className="px-4 py-3 text-left">Acción</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {filtered.length === 0 && (
            <tr>
              <td className="px-4 py-4 text-gray-400" colSpan={6}>
                Sin comentarios.
              </td>
            </tr>
          )}
          {filtered.map((c) => (
            <tr key={c.id} className="hover:bg-white/5">
              <td className="px-4 py-3 text-gray-100 max-w-xs">{c.content}</td>
              <td className="px-4 py-3 text-gray-200">{c.user_id}</td>
              <td className="px-4 py-3 text-gray-200">
                {c.series_id} {c.chapter_id ? `• ${c.chapter_id}` : ''}
              </td>
              <td className="px-4 py-3">
                <span className="px-2 py-1 rounded-full text-xs bg-white/10 border border-white/10 uppercase">
                  {c.is_deleted ? 'DELETED' : 'ACTIVE'}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-400 text-xs">
                {c.created_at ? new Date(c.created_at).toLocaleString() : ''}
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={() => handleToggle(c.id, !!c.is_deleted)}
                  disabled={pending}
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    c.is_deleted
                      ? 'bg-green-600 text-white hover:bg-green-500'
                      : 'bg-red-600 text-white hover:bg-red-500'
                  } disabled:opacity-60`}
                >
                  {c.is_deleted ? 'Restaurar' : 'Eliminar'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
