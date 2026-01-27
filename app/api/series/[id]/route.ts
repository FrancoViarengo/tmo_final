import { NextResponse } from 'next/server';
import { requireSession, createSupabaseRouteClient } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { supabase } = await requireSession(); // Or createSupabaseRouteClient if public
  // Actually, for editing we might want authenticated access, but GET usually is public.
  // Let's use createSupabaseRouteClient for GET to allow public read if needed, or requireSession if we want to be strict.
  // Given this is for the edit page which is protected, requireSession is fine, but let's make it consistent.
  // I'll use createSupabaseRouteClient to avoid session error if not logged in (though edit page requires it).
  // Wait, requireSession throws if no session.
  // Let's just use the existing helper or create a new client.
  // I'll stick to requireSession for consistency with other methods in this file, assuming only authorized users call this specific endpoint for editing?
  // No, GET /api/series/[id] might be useful generally.
  // Let's import createSupabaseRouteClient.

  const client = await createSupabaseRouteClient();
  const { data, error } = await (client.from('series') as any)
    .select('*')
    .eq('id', params.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { session, supabase } = await requireSession();
  const body = await request.json();
  const seriesId = params.id;

  // Check permissions (uploader, editor, admin)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  const role = (profile as any)?.role;
  if (!['uploader', 'editor', 'admin', 'superadmin'].includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Update series
  const { data, error } = await (supabase.from('series') as any)
    .update({
      title: body.title,
      slug: body.slug,
      description: body.description,
      status: body.status,
      type: body.type,
      cover_url: body.cover_url,
      updated_at: new Date().toISOString(),
    })
    .eq('id', seriesId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { session, supabase } = await requireSession();
  const seriesId = params.id;

  // Check permissions (admin only for delete, or maybe uploader too? let's restrict to admin/editor for now)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  const role = (profile as any)?.role;
  if (!['admin', 'superadmin', 'editor'].includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Soft delete
  const { error } = await (supabase.from('series') as any)
    .update({ is_deleted: true })
    .eq('id', seriesId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
