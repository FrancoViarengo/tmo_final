import { createServerClient } from '@/lib/supabase/server';

export const listHistory = async (userId: string) => {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('reading_history')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
};
