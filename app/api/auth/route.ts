import { NextResponse } from 'next/server';
import { createSupabaseRouteClient } from '@/lib/supabase/server';

// OAuth callback: exchanges the provider code for a Supabase session and redirects back.
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const redirectTo = requestUrl.searchParams.get('redirect') || requestUrl.origin;

  if (!code) {
    return NextResponse.redirect(`${requestUrl.origin}/auth/error?reason=missing_code`);
  }

  const supabase = createSupabaseRouteClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      `${requestUrl.origin}/auth/error?message=${encodeURIComponent(error.message)}`
    );
  }

  return NextResponse.redirect(redirectTo);
}
