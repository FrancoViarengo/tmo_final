import { createServerClient } from '@/lib/supabase/server';

export const listLibrary = async (userId: string) => {
  const supabase = createServerClient();
  const { data, error } = await supabase.from('bookmarks').select('*').eq('user_id', userId);
  if (error) throw new Error(error.message);
  return data;
};
