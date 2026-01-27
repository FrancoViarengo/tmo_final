import { NextResponse } from 'next/server';
import { requireSessionWithProfile, isAdminRole, isUploaderRole } from '@/lib/auth/guards';

// GET: lista uploads (propios o todos si admin)
export async function GET(request: Request) {
  const { session, supabase, profile } = await requireSessionWithProfile();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  let query = supabase.from('uploads').select('*').order('created_at', { ascending: false });
  const role = (profile as any)?.role;
  if (!isAdminRole(role)) {
    query = query.eq('uploader_id', session.user.id);
  }
  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// POST: registrar upload (metadata)
export async function POST(request: Request) {
  const { session, supabase, profile } = await requireSessionWithProfile();
  const role = (profile as any)?.role;
  if (!isUploaderRole(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { series_id, chapter_id, bucket = 'pages', path, status = 'pending', file_type, file_size } = body;

  if (!path) return NextResponse.json({ error: 'path requerido' }, { status: 400 });

  const { data, error } = await (supabase.from('uploads') as any)
    .insert({
      uploader_id: session.user.id,
      series_id: series_id || null,
      chapter_id: chapter_id || null,
      bucket,
      path,
      status,
      file_type: file_type || null,
      file_size: file_size || null,
      created_at: new Date().toISOString(),
      group_id: body.group_id || null
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
