import { createServerClient } from '@/lib/supabase/server';

export const listChaptersBySeries = async (seriesId: string, limit = 50) => {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('chapters')
    .select('*')
    .eq('series_id', seriesId)
    .eq('is_deleted', false)
    .order('chapter_number', { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return data;
};
