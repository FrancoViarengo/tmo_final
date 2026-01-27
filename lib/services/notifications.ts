import { createServerClient } from '@/lib/supabase/server';

export const listNotifications = async (userId: string) => {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
};
