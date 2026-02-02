import { cookies } from 'next/headers';
import { createServerClient as createSSRClient, type CookieOptions } from '@supabase/ssr';
import { Database } from '@/lib/database.types';

const createClient = (cookieStore: ReturnType<typeof cookies>) => {
  return createSSRClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
};

export const createSupabaseRouteClient = () => createClient(cookies());
export const createServerClient = () => createClient(cookies());

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
