import { createServerClient } from '@/lib/supabase/server';

export const listUploadsForUser = async (userId: string) => {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('uploads')
    .select('*')
    .eq('uploader_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
};
