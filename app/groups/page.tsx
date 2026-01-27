import { createServerClient } from '@/lib/supabase/server';
import Link from 'next/link';

export const revalidate = 30;

async function getGroups() {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('scanlation_groups')
    .select('id, name, website, discord, created_at')
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export default async function GroupsPage() {
  const groups = await getGroups();

  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
          <h1 className="text-3xl font-bold text-white">Grupos de Scanlation</h1>
          <div className="flex gap-4">
            <Link href="/groups/create" className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-md transition-colors text-sm">
              CREAR GRUPO
            </Link>
            <Link href="/upload" className="px-4 py-2 bg-primary hover:bg-orange-700 text-white font-bold rounded-md transition-colors shadow-lg shadow-orange-900/20 text-sm">
              SOY UPLOADER
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(groups as any[]).map((g) => (
            <Link
              key={g.id}
              href={`/groups/${g.id}`}
              className="bg-card border border-white/5 rounded-xl p-6 hover:border-primary/50 hover:shadow-lg transition group"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-xl font-bold text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  {g.name.charAt(0).toUpperCase()}
                </div>
                {g.created_at && (
                  <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded">
                    {new Date(g.created_at).getFullYear()}
                  </span>
                )}
              </div>

              <div className="mt-4">
                <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">{g.name}</h3>
                <div className="flex gap-4 mt-3 text-sm text-gray-400">
                  {g.website && (
                    <span className="flex items-center gap-1 hover:text-white transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                      Sitio Web
                    </span>
                  )}
                  {g.discord && (
                    <span className="flex items-center gap-1 hover:text-[#5865F2] transition-colors">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" /></svg>
                      Discord
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
          {groups.length === 0 && (
            <div className="col-span-full text-center py-20 bg-card border border-white/5 rounded-lg">
              <p className="text-gray-400">No hay grupos registrados.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
