import { createServerClient } from '@/lib/supabase/server';
import { Database } from '@/lib/database.types';

export const getSessionProfile = async () => {
  const supabase = createServerClient();
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !sessionData.session) {
    throw new Error('Unauthorized');
  }
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', sessionData.session.user.id)
    .single();
  return { session: sessionData.session, profile };
};

export type AppRole = Database['public']['Enums']['app_role'];
