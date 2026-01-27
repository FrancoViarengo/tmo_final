import { createServerClient } from '@/lib/supabase/server';
import { isAdminRole } from '@/lib/auth/guards';

export const listUsersAdmin = async () => {
  const supabase = createServerClient();
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  if (!userId) throw new Error('Unauthorized');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).single();
  if (!isAdminRole((profile as any)?.role)) throw new Error('Forbidden');

  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
};
