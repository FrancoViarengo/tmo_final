import { notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';

import FollowButton from './FollowButton';

import JoinButton from './JoinButton';

async function getGroup(id: string) {
  const supabase = createServerClient();
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;

  const { data: group, error } = await supabase
    .from('scanlation_groups')
    .select('id, name, website, discord, created_at, recruitment_status, recruitment_roles, recruitment_description')
    .eq('id', id)
    .single();
  if (error || !group) return null;

  const { data: members } = await supabase
    .from('group_members')
    .select('user_id, role, created_at, profiles:user_id ( username, avatar_url )')
    .eq('group_id', id);

  const isMember = members?.some((m: any) => m.user_id === userId) || false;

  let isFollowing = false;
  if (userId) {
    const { data: follow } = await supabase
      .from('group_followers')
      .select('id')
      .eq('group_id', id)
      .eq('user_id', userId)
      .maybeSingle();
    isFollowing = !!follow;
  }

  return { group, members: members ?? [], isMember, isFollowing };
}

import GroupAdminPanel from './GroupAdminPanel';

// ... (existing imports)

// Check if user is leader of THIS group
function isGroupLeader(members: any[], userId: string | undefined): boolean {
  if (!userId) return false;
  const member = members.find(m => m.user_id === userId);
  return member?.role === 'leader';
}

export default async function GroupDetailPage({ params }: { params: { id: string } }) {
  const data = await getGroup(params.id);
  if (!data) return notFound();

  const supabase = createServerClient();
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;

  const { group, members, isMember, isFollowing } = data as any;
  const isLeader = isGroupLeader(members, userId);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 text-white">
      <div className="glass neon-border rounded-2xl p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-xs uppercase text-blue-200">Grupo</div>
            <h1 className="text-3xl font-bold">{group.name}</h1>
            <div className="text-sm text-gray-300 mt-1">
              {group.website ? <span className="mr-3">🌐 {group.website}</span> : null}
              {group.discord ? <span>💬 {group.discord}</span> : null}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Creado: {group.created_at ? new Date(group.created_at).toLocaleDateString() : ''}
            </div>
          </div>
          <div className="flex gap-3">
            <FollowButton groupId={group.id} isFollowing={isFollowing} />
            <JoinButton groupId={group.id} isMember={isMember} />
            <a
              href="/upload"
              className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-fuchsia-600 text-white font-semibold shadow"
            >
              Subir con este grupo
            </a>
          </div>
        </div>
      </div>

      {isLeader && (
        <GroupAdminPanel group={group} members={members} />
      )}


      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
        <div className="md:col-span-2 space-y-8">
          {group.recruitment_status === 'open' && (
            <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/20 border border-green-500/30 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <h2 className="text-xl font-bold text-white">Reclutamiento Abierto</h2>
              </div>

              <p className="text-gray-300 mb-4 whitespace-pre-wrap">{group.recruitment_description || "Este grupo está buscando nuevos miembros."}</p>

              {group.recruitment_roles && group.recruitment_roles.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {group.recruitment_roles.map((role: string) => (
                    <span key={role} className="px-3 py-1 bg-green-500/20 text-green-300 border border-green-500/30 rounded-full text-sm font-medium">
                      {role}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-6">
                <a href={group.discord || "#"} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 font-medium transition-colors">
                  Contactar por Discord
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </a>
              </div>
            </div>
          )}

          <div>
            <h2 className="text-xl font-semibold mb-3">Miembros</h2>
            <div className="bg-white/5 border border-white/10 rounded-xl divide-y divide-white/5">
              {members.length === 0 && <div className="p-4 text-gray-400">Sin miembros.</div>}
              {members.map((m: any) => (
                <div key={m.user_id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {m.profiles?.avatar_url ? (
                      <img src={m.profiles.avatar_url} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-white/10" />
                    )}
                    <div>
                      <div className="text-sm font-semibold">{m.profiles?.username || m.user_id}</div>
                      <div className="text-xs text-gray-400">Rol: {m.role}</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    Desde {m.created_at ? new Date(m.created_at).toLocaleDateString() : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Sidebar Statistics (Placeholder for now) */}
          <div className="bg-card border border-white/5 rounded-xl p-5">
            <h3 className="font-bold text-gray-400 text-xs uppercase mb-4">Estadísticas</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Miembros</span>
                <span>{members.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Proyectos</span>
                <span>-</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
