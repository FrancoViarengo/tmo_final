import { cookies } from 'next/headers';
import {
  createRouteHandlerClient,
  createServerComponentClient,
  type SupabaseClient,
} from '@supabase/auth-helpers-nextjs';
import { Database } from '@/lib/database.types';

/**
 * Creates a Supabase client wired to Next.js cookies for API route handlers.
 */
export const createSupabaseRouteClient = () => createRouteHandlerClient<Database>({ cookies });

/**
 * Creates a Supabase client for server components.
 */
export const createServerClient = () => {
  const cookieStore = cookies();
  return createServerComponentClient<Database>({ cookies: () => cookieStore });
};

/**
 * Fetches the current session or throws if unauthenticated.
 * Returns the session together with the Supabase client for convenience.
 */
export const requireSession = async () => {
  const supabase = createSupabaseRouteClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw new Error(`Session fetch failed: ${error.message}`);
  }

  if (!session) {
    throw new Error('Unauthorized');
  }

  return { session, supabase };
};

/**
 * Ensures the logged-in user has 'admin' or 'superadmin' role.
 */
export const requireAdmin = async () => {
  const { session, supabase } = await requireSession();

  // Check metadata first (faster, no RLS issues)
  let role = session.user.user_metadata?.role;

  // If not in metadata, check DB profile
  if (!role) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();
    role = (profile as any)?.role;
  }

  if (role !== 'admin' && role !== 'superadmin') {
    throw new Error('Forbidden: Admins only');
  }

  return { session, supabase, role };
};
