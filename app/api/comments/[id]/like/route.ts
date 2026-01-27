import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/supabase/server';

// POST: toggle like en comentario
export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const { session, supabase } = await requireSession();
  const commentId = params.id;

  // verificar si existe like
  const { data: existing } = await (supabase.from('comment_likes') as any)
    .select('comment_id')
    .eq('comment_id', commentId)
    .eq('user_id', session.user.id)
    .single();

  if (existing) {
    const { error } = await (supabase.from('comment_likes') as any)
      .delete()
      .eq('comment_id', commentId)
      .eq('user_id', session.user.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ liked: false });
  }

  const { error } = await (supabase.from('comment_likes') as any)
    .insert({ comment_id: commentId, user_id: session.user.id });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ liked: true });
}
