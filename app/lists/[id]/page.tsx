import { notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import Link from 'next/link';

async function getList(id: string) {
    const supabase = createServerClient();
    const { data: list, error } = await supabase
        .from('lists')
        .select('*, profiles:user_id(username, avatar_url)')
        .eq('id', id)
        .single();

    if (error || !list) return null;

    const { data: items } = await supabase
        .from('list_items')
        .select('series:series_id(id, title, slug, cover_url, type, score)')
        .eq('list_id', id);

    return { list: list as any, items: items?.map((i: any) => i.series) ?? [] };
}

export default async function ListDetailsPage({ params }: { params: { id: string } }) {
    const data = await getList(params.id);
    if (!data) return notFound();

    const { list, items } = data;

    return (
        <div className="min-h-screen pb-12">
            <div className="max-w-7xl mx-auto px-4 py-10">
                <div className="mb-8 border-b border-white/5 pb-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary to-orange-800 rounded-xl flex items-center justify-center text-white font-bold text-3xl shadow-lg">
                            {list.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">{list.name}</h1>
                            <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                                <span>por <span className="text-primary">{list.profiles?.username || 'Usuario'}</span></span>
                                <span>•</span>
                                <span>{items.length} series</span>
                                <span>•</span>
                                <span className="uppercase text-xs border border-white/10 px-2 py-0.5 rounded">
                                    {list.is_public ? 'Pública' : 'Privada'}
                                </span>
                            </div>
                        </div>
                    </div>
                    {list.description && (
                        <p className="text-gray-300 max-w-2xl">{list.description}</p>
                    )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {items.map((series: any) => (
                        <Link
                            key={series.id}
                            href={`/series/${series.slug || series.id}`}
                            className="group relative aspect-[2/3] bg-card rounded-lg overflow-hidden shadow-lg border border-white/5 hover:border-primary/50 transition"
                        >
                            {series.cover_url ? (
                                <img
                                    src={series.cover_url}
                                    alt={series.title}
                                    className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-white/5 text-gray-500 text-xs">
                                    Sin portada
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-100 transition-opacity" />
                            <div className="absolute bottom-0 left-0 right-0 p-3">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-primary mb-1 block">
                                    {series.type}
                                </span>
                                <h3 className="text-sm font-bold text-white leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                                    {series.title}
                                </h3>
                            </div>
                        </Link>
                    ))}
                    {items.length === 0 && (
                        <div className="col-span-full py-20 text-center text-gray-500">
                            Esta lista está vacía.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
