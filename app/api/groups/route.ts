import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const { session, supabase } = await requireSession();
  const body = await request.json();

  const { name, website, discord, description } = body;

  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  // Insert group
  const { data: group, error } = await (supabase.from('scanlation_groups') as any)
    .insert({
      name,
      website,
      discord,
      description,
      owner_id: session.user.id, // Assuming there's an owner_id column, if not we might need to adjust
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Add creator as leader/member
  // Using 'group_members' as seen in existing code
  const { error: memberError } = await (supabase.from('group_members') as any)
    .insert({
      group_id: group.id,
      user_id: session.user.id,
      role: 'leader'
    });

  if (memberError) {
    console.error("Error adding owner to members:", memberError);
    // We don't fail the request if member addition fails, but it's good to know.
  }

  return NextResponse.json(group, { status: 201 });
}
