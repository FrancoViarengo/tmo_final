import { createServerClient } from '@/lib/supabase/server';
import CommentsTable from './table';

export const revalidate = 0;

async function getComments() {
  const supabase = createServerClient();
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  if (!userId) return { authorized: false, comments: [] };

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).maybeSingle();
  const role = (profile as { role?: string } | null)?.role;
  if (role !== 'admin' && role !== 'superadmin') {
    return { authorized: false, comments: [] };
  }

  const { data, error } = await supabase
    .from('comments')
    .select('id, user_id, series_id, chapter_id, content, is_deleted, created_at, updated_at')
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) throw new Error(error.message);
  return { authorized: true, comments: data ?? [] };
}

export default async function AdminCommentsPage() {
  const { authorized, comments } = await getComments();
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 text-white">
      <h1 className="text-3xl font-bold mb-6">Comentarios (Admin)</h1>
      {!authorized ? (
        <div className="text-gray-400">Sin permisos.</div>
      ) : (
        <CommentsTable comments={comments} />
      )}
    </div>
  );
}
