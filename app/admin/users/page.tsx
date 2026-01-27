import { createServerClient } from '@/lib/supabase/server';

export const revalidate = 0;

async function getUsers() {
  const supabase = createServerClient();
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  if (!userId) return [];
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).maybeSingle();
  const role = (profile as { role?: string } | null)?.role;
  if (role !== 'admin' && role !== 'superadmin') return [];

  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(200);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export default async function AdminUsersPage() {
  const users = await getUsers();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Administrar Usuarios</h1>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Buscar usuario..."
            className="px-3 py-2 bg-[#141414] border border-white/10 rounded-md text-sm text-white focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="bg-card border border-white/5 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-white/5 text-gray-400 uppercase font-medium">
              <tr>
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Rol</th>
                <th className="px-6 py-4">Reputación</th>
                <th className="px-6 py-4">Registrado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((u: any) => (
                <tr key={u.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-semibold text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        {(u.username || u.id).charAt(0).toUpperCase()}
                      </div>
                      {u.username || u.id}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${u.role === 'admin' || u.role === 'superadmin' ? 'bg-red-500/20 text-red-500' :
                        u.role === 'uploader' ? 'bg-blue-500/20 text-blue-500' : 'bg-gray-500/20 text-gray-400'
                      }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-300 font-mono">{u.reputation ?? 0}</td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-gray-400 hover:text-white transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td className="px-6 py-8 text-center text-gray-500" colSpan={5}>
                    No se encontraron usuarios.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
