import { createServerClient } from '@/lib/supabase/server';

export const revalidate = 0;

async function getReports() {
  const supabase = createServerClient();
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  if (!userId) return [];

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).maybeSingle();
  const role = (profile as { role?: string } | null)?.role;
  if (role !== 'admin' && role !== 'superadmin') return [];

  const { data, error } = await supabase
    .from('reports')
    .select('id, reporter_id, target_id, reason, status, created_at')
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export default async function AdminReportsPage() {
  const reports = await getReports();

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 text-white">
      <h1 className="text-3xl font-bold mb-6">Reportes (Admin)</h1>
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-gray-200">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Reason</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Target</th>
              <th className="px-4 py-3 text-left">Reporter</th>
              <th className="px-4 py-3 text-left">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {reports.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-gray-400" colSpan={6}>
                  Sin reportes o sin permisos.
                </td>
              </tr>
            )}
            {reports.map((r: any) => (
              <tr key={r.id} className="hover:bg-white/5">
                <td className="px-4 py-3 text-xs text-gray-300">{r.id}</td>
                <td className="px-4 py-3 font-semibold text-white">{r.reason}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded-full text-xs bg-white/10 border border-white/10 uppercase">
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-300">{r.target_id}</td>
                <td className="px-4 py-3 text-gray-300">{r.reporter_id}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {r.created_at ? new Date(r.created_at).toLocaleString() : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
