import { createServerClient } from '@/lib/supabase/server';
import UploadsTable from './table';

export const revalidate = 0;

async function getUploads(searchParams: { status?: string; q?: string }) {
  const supabase = createServerClient();
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  if (!userId) return { authorized: false, uploads: [] };

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).maybeSingle();
  const role = (profile as { role?: string } | null)?.role;
  if (role !== 'admin' && role !== 'superadmin') return { authorized: false, uploads: [] };

  let query = supabase
    .from('uploads')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(400);
  if (searchParams.status) query = query.eq('status', searchParams.status);
  if (searchParams.q) query = query.ilike('path', `%${searchParams.q}%`);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return { authorized: true, uploads: data ?? [] };
}

export default async function AdminUploadsPage({ searchParams }: { searchParams: { status?: string; q?: string } }) {
  const result = await getUploads(searchParams);
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 text-white">
      <h1 className="text-3xl font-bold mb-6">Uploads (Admin)</h1>
      {!result.authorized ? (
        <div className="text-gray-400">Sin permisos.</div>
      ) : (
        <UploadsTable uploads={result.uploads} />
      )}
    </div>
  );
}
