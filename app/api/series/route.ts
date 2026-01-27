import { NextResponse } from 'next/server';
import { createSupabaseRouteClient, requireSession } from '@/lib/supabase/server';

const isNotDeleted = 'is_deleted.eq.false';

// GET: listar series con filtros básicos
export async function GET(request: Request) {
  const supabase = createSupabaseRouteClient();
  const { searchParams } = new URL(request.url);

  const limit = Number(searchParams.get('limit') || 20);
  const offset = Number(searchParams.get('offset') || 0);
  const status = searchParams.get('status');
  const type = searchParams.get('type');
  const q = searchParams.get('q');

  let query = supabase.from('series').select('*').order('created_at', { ascending: false }).range(offset, offset + limit - 1);

  query = query.eq('is_deleted', false);
  if (status) query = query.eq('status', status);
  if (type) query = query.eq('type', type);
  if (q) query = query.ilike('title', `%${q}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data, count: data?.length ?? 0 });
}

// POST: crear serie (staff)
export async function POST(request: Request) {
  const { session, supabase } = await requireSession();
  const body = await request.json();

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .maybeSingle();

  const role = (profile as { role?: string } | null)?.role;
  if (!role || !['uploader', 'editor', 'admin', 'superadmin'].includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const payload = {
    title: body.title,
    slug: body.slug,
    type: body.type,
    status: body.status,
    language: body.language || 'en',
    created_by: session.user.id,
    description: body.description,
    cover_url: body.cover_url,
    group_id: body.group_id,
  };

  if (!payload.title || !payload.slug) {
    return NextResponse.json({ error: 'Missing title or slug' }, { status: 400 });
  }

  const { data, error } = await (supabase.from('series') as any).insert(payload).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 201 });
}
