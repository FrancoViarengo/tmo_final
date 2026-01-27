import { createServerClient } from '@/lib/supabase/server';

export const listUserReports = async (userId: string) => {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('reporter_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
};
