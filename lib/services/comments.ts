import { createServerClient } from '@/lib/supabase/server';

export const listComments = async (params: { seriesId?: string; chapterId?: string; limit?: number }) => {
  const supabase = createServerClient();
  let query = supabase.from('comments').select('*').eq('is_deleted', false).order('created_at', { ascending: false });
  if (params.seriesId) query = query.eq('series_id', params.seriesId);
  if (params.chapterId) query = query.eq('chapter_id', params.chapterId);
  if (params.limit) query = query.limit(params.limit);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};
