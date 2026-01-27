import { NextResponse } from 'next/server';
import { createSupabaseRouteClient, requireSession } from '@/lib/supabase/server';

// GET: listar capítulos por serie
export async function GET(request: Request) {
  const supabase = createSupabaseRouteClient();
  const { searchParams } = new URL(request.url);
  const seriesId = searchParams.get('series_id');
  const limit = Number(searchParams.get('limit') || 50);
  const offset = Number(searchParams.get('offset') || 0);

  if (!seriesId) {
    return NextResponse.json({ error: 'series_id requerido' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('chapters')
    .select('*')
    .eq('series_id', seriesId)
    .eq('is_deleted', false)
    .order('chapter_number', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data, count: data?.length ?? 0 });
}

// POST: subir nuevo capítulo con inserción masiva de páginas
export async function POST(request: Request) {
  const { session, supabase } = await requireSession();
  const body = await request.json();
  const {
    series_id,
    group_id,
    volume_number,
    chapter_number,
    title,
    pages, // Array de objetos { page_number, image_url, width, height, size_kb }
  } = body;

  if (!series_id || !chapter_number || !pages || pages.length === 0) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // 1. Crear el capítulo
  const { data: chapter, error: chapterError } = await (supabase.from('chapters') as any)
    .insert({
      series_id,
      group_id: group_id || null,
      uploader_id: session.user.id,
      volume_number,
      chapter_number,
      title,
    })
    .select()
    .single();

  if (chapterError || !chapter) {
    return NextResponse.json({ error: chapterError?.message || 'Insert failed' }, { status: 500 });
  }

  // 2. Insertar las páginas (bulk)
  interface Page {
    page_number: number;
    image_url: string;
    width?: number;
    height?: number;
    size_kb?: number;
  }

  const pagesToInsert = pages.map((page: Page, index: number) => ({
    chapter_id: chapter.id,
    page_number: index + 1,
    image_url: page.image_url,
    width: page.width || 0,
    height: page.height || 0,
    size_kb: page.size_kb || 0,
  }));

  const { error: pagesError } = await (supabase.from('pages') as any).insert(pagesToInsert);

  if (pagesError) {
    // Limpieza best-effort si fallan las páginas
    await supabase.from('chapters').delete().eq('id', chapter.id);
    return NextResponse.json({ error: `Pages upload failed: ${pagesError.message}` }, { status: 500 });
  }

  // 3. Actualizar "updated_at" de la serie
  await (supabase.from('series') as any)
    .update({ updated_at: new Date().toISOString() })
    .eq('id', series_id);

  return NextResponse.json(
    {
      message: 'Chapter uploaded successfully',
      chapterId: chapter.id,
      pagesCount: pages.length,
    },
    { status: 201 },
  );
}
