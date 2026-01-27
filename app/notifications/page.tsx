"use client";

import { useEffect, useState } from 'react';

type Notification = {
  id: string;
  type: string;
  payload: any;
  read_at: string | null;
  created_at: string | null;
};

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifs = async () => {
    try {
      const res = await fetch('/api/notifications');
      const json = await res.json();
      if (res.ok) setItems(json.data || []);
    } catch {
      setItems([]);
    }
  };

  const markAllRead = async () => {
    setLoading(true);
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read_all: true }),
      });
      fetchNotifs();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  return (
    <div className="container mx-auto px-4 py-10 text-white">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Notificaciones</h1>
        <button
          onClick={markAllRead}
          disabled={loading}
          className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-fuchsia-600 text-white text-sm font-semibold disabled:opacity-60"
        >
          {loading ? 'Marcando...' : 'Marcar todas como leídas'}
        </button>
      </div>
      <div className="bg-white/5 border border-white/10 rounded-lg shadow-sm divide-y divide-white/10">
        {items.length === 0 && <div className="p-4 text-gray-400">Sin notificaciones.</div>}
        {items.map((n) => (
          <div key={n.id} className="p-4 flex items-start gap-3">
            <div className="w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-white">{n.type}</div>
              {n.payload ? (
                <pre className="text-xs text-gray-300 mt-1 bg-white/5 p-2 rounded border border-white/10">
                  {JSON.stringify(n.payload, null, 2)}
                </pre>
              ) : null}
              <div className="text-xs text-gray-400 mt-1">
                {n.created_at ? new Date(n.created_at).toLocaleString() : ''}
              </div>
            </div>
            {!n.read_at && <span className="text-[10px] uppercase text-blue-200">Nuevo</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
