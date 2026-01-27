import { createServerClient } from '@/lib/supabase/server';

export const listGroups = async (q?: string) => {
  const supabase = createServerClient();
  let query = supabase.from('scanlation_groups').select('*').order('created_at', { ascending: false });
  if (q) query = query.ilike('name', `%${q}%`);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};
