"use server";

import { createServerClient } from '@/lib/supabase/server';
import { Database } from '@/lib/database.types';

type CommentUpdate = Database['public']['Tables']['comments']['Update'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];

const isAdmin = (role?: ProfileRow['role'] | null) => role === 'admin' || role === 'superadmin';

const ensureAdmin = async (): Promise<ReturnType<typeof createServerClient>> => {
  const supabase = createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const userId = session?.user.id;
  if (!userId) throw new Error('Unauthorized');
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();
  const role = (profile as ProfileRow | null)?.role;
  if (!isAdmin(role)) throw new Error('Forbidden');
  return supabase;
};

export async function deleteComment(id: string) {
  const supabase = await ensureAdmin();
  const payload: CommentUpdate = {
    is_deleted: true,
    deleted_at: new Date().toISOString(),
  };
  const { error } = await (supabase.from('comments') as any).update(payload).eq('id', id);
  if (error) throw new Error(error.message);
  return true;
}

export async function restoreComment(id: string) {
  const supabase = await ensureAdmin();
  const payload: CommentUpdate = {
    is_deleted: false,
    deleted_at: null,
  };
  const { error } = await (supabase.from('comments') as any).update(payload).eq('id', id);
  if (error) throw new Error(error.message);
  return true;
}
