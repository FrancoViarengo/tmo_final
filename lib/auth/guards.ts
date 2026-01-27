import { createSupabaseRouteClient, requireSession } from '@/lib/supabase/server';
import { Database } from '@/lib/database.types';

type AppRole = Database['public']['Enums']['app_role'];

export const isAdminRole = (role?: AppRole | null) => role === 'admin' || role === 'superadmin';
export const isUploaderRole = (role?: AppRole | null) =>
  role === 'uploader' || role === 'editor' || role === 'admin' || role === 'superadmin';
export const isEditorRole = (role?: AppRole | null) =>
  role === 'editor' || role === 'admin' || role === 'superadmin';

export const ensureAuthenticated = async () => {
  const { session, supabase } = await requireSession();
  return { session, supabase };
};

export const ensureRole = async (roles: AppRole[]) => {
  const { session, supabase, profile } = await requireSessionWithProfile();
  const role = (profile as any)?.role as AppRole | null | undefined;
  if (!role || !roles.includes(role)) {
    throw new Error('Forbidden');
  }
  return { session, supabase, profile };
};

export const requireSessionWithProfile = async (allowedRoles?: AppRole[]) => {
  const { session, supabase } = await requireSession();
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', session.user.id)
    .single();

  if (error || !profile) {
    throw new Error('Profile not found');
  }

  const role = (profile as any)?.role as AppRole | null | undefined;
  if (allowedRoles && (!role || !allowedRoles.includes(role))) {
    throw new Error('Forbidden');
  }

  return { session, supabase, profile };
};

export const getProfileRole = async (userId: string): Promise<AppRole | null> => {
  const supabase = createSupabaseRouteClient();
  const { data } = await supabase.from('profiles').select('role').eq('id', userId).single();
  return (data as any)?.role ?? null;
};
