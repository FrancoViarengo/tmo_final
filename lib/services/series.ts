import { createServerClient } from '@/lib/supabase/server';

export const listSeries = async (params: { q?: string; status?: string; type?: string; limit?: number }) => {
  const supabase = createServerClient();
  let query = supabase.from('series').select('*').eq('is_deleted', false).order('created_at', { ascending: false });
  if (params.q) query = query.ilike('title', `%${params.q}%`);
  if (params.status) query = query.eq('status', params.status);
  if (params.type) query = query.eq('type', params.type);
  if (params.limit) query = query.limit(params.limit);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};
