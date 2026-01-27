import { createServerClient } from '@/lib/supabase/server';

export const listPagesByChapter = async (chapterId: string) => {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('chapter_id', chapterId)
    .order('page_number', { ascending: true });
  if (error) throw new Error(error.message);
  return data;
};
