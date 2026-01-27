import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import CreateListButton from "./CreateListButton";

// Force dynamic since we're fetching data that might change
export const dynamic = 'force-dynamic';

async function getLists() {
    const supabase = createServerClient();
    const { data: lists, error } = await supabase
        .from('lists')
        .select(`
            *,
            profiles:user_id ( username, avatar_url ),
            items:list_items(count)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(50);

    if (error) {
        console.error("Error fetching lists:", error);
        return [];
    }
    return lists ?? [];
}

export default async function ListsPage() {
    const lists = await getLists();

    return (
        <div className="min-h-screen pb-12">
            <div className="max-w-7xl mx-auto px-4 py-10">
                <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                    <h1 className="text-3xl font-bold text-white">Listas de Usuarios</h1>
                    {/* Client component for Modal interaction */}
                    <CreateListButton />
                </div>

                {lists.length === 0 ? (
                    <div className="text-center py-20 bg-card border border-white/5 rounded-lg">
                        <p className="text-gray-400 text-lg">No hay listas públicas aún.</p>
                        <p className="text-gray-500 text-sm mt-2">¡Sé el primero en crear una!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {lists.map((list: any) => (
                            <Link href={`/lists/${list.id}`} key={list.id} className="bg-card border border-white/5 rounded-xl p-6 hover:border-primary/50 transition group cursor-pointer block">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-orange-800 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                        {list.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors line-clamp-1">{list.name}</h3>
                                        <p className="text-xs text-gray-400">por <span className="text-primary">{list.profiles?.username || 'Anónimo'}</span></p>
                                    </div>
                                </div>
                                <p className="text-gray-400 text-sm mb-4 line-clamp-2 h-10">
                                    {list.description || "Sin descripción"}
                                </p>
                                <div className="flex items-center justify-between text-xs text-gray-500 border-t border-white/5 pt-3">
                                    <span>{list.items?.[0]?.count || 0} series</span>
                                    <span>{new Date(list.created_at).toLocaleDateString()}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
