import { NextResponse } from 'next/server';
import { requireSessionWithProfile, isUploaderRole } from '@/lib/auth/guards';

// POST: crear URL firmada para subida a storage
export async function POST(request: Request) {
  const { supabase, profile } = await requireSessionWithProfile();
  const role = (profile as any)?.role;
  if (!isUploaderRole(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const bucket = body.bucket || 'pages';
  const path = body.path;
  if (!path) {
    return NextResponse.json({ error: 'path requerido' }, { status: 400 });
  }

  // createSignedUploadUrl en @supabase/storage-js no acepta expiresIn en esta versión; usa default TTL
  const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(path);
  if (error || !data) {
    return NextResponse.json({ error: error?.message || 'Signed URL error' }, { status: 500 });
  }

  return NextResponse.json({ signedUrl: data.signedUrl, path: data.path, token: data.token });
}
