"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import NotifBadge from "./NotifBadge";

export default function Navbar() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [search, setSearch] = useState("");
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    // Initialize supabase client
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setUser(session.user);
                // Check admin role
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', session.user.id)
                    .single();
                if (profile && ['admin', 'superadmin', 'editor', 'uploader'].includes(profile.role)) {
                    setIsAdmin(true);
                }
            }
        };
        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (search.trim()) {
            router.push(`/series?search=${encodeURIComponent(search)}`);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.refresh();
        router.push("/login"); // or refresh to update state
    };

    return (
        <>


            {/* Main Navbar */}
            <header className="sticky top-0 z-50 bg-[#1f1f1f] border-b border-orange-500/50 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

                    {/* Logo & Desktop Nav */}
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-red-600 rounded flex items-center justify-center text-white font-black text-xl shadow-lg group-hover:scale-110 transition-transform">
                                T
                            </div>
                            <span className="font-bold text-2xl tracking-tighter text-white group-hover:text-orange-500 transition-colors">
                                TMO<span className="text-orange-500">Clone</span>
                            </span>
                        </Link>

                        <nav className="hidden md:flex items-center gap-6 text-sm font-medium uppercase tracking-wide text-gray-300">
                            <Link href="/" className="hover:text-orange-400 transition-colors">Inicio</Link>
                            <Link href="/series" className="hover:text-orange-400 transition-colors">Biblioteca</Link>
                            <Link href="/lists" className="hover:text-orange-400 transition-colors">Listas</Link>
                            <Link href="/groups" className="hover:text-orange-400 transition-colors">Grupos</Link>
                            {user && <Link href="/history" className="hover:text-orange-400 transition-colors">Historial</Link>}
                        </nav>
                    </div>

                    {/* Search & Actions */}
                    <div className="flex items-center gap-4">

                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="relative hidden md:block group">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Buscar series..."
                                className="bg-[#141414] border border-white/10 rounded-full pl-4 pr-10 py-1.5 text-sm text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 w-48 focus:w-64 transition-all"
                            />
                            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </button>
                        </form>

                        <div className="flex items-center gap-2">
                            <NotifBadge />

                            {/* User Dropdown / Menu */}
                            {user ? (
                                <div className="relative group">
                                    <button className="flex items-center gap-2 hover:bg-white/5 px-2 py-1 rounded-lg transition-colors">
                                        {user.user_metadata?.avatar_url ? (
                                            <img
                                                src={user.user_metadata.avatar_url}
                                                alt="Avatar"
                                                className="w-8 h-8 rounded-full object-cover ring-2 ring-transparent group-hover:ring-orange-500 transition-all"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold ring-2 ring-transparent group-hover:ring-orange-500 transition-all">
                                                {user.email?.[0].toUpperCase()}
                                            </div>
                                        )}
                                    </button>

                                    {/* Dropdown Menu */}
                                    <div className="absolute right-0 top-full mt-2 w-56 bg-[#1f1f1f] border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right z-50 overflow-hidden divide-y divide-white/5">
                                        <div className="p-4 bg-[#141414]">
                                            <p className="text-sm font-semibold text-white truncate">{user.email}</p>
                                            <p className="text-xs text-blue-400 capitalize">{isAdmin ? 'Admin / Uploader' : 'Usuario'}</p>
                                        </div>

                                        <div className="py-2">
                                            <Link href="/profile" className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white">Mi Perfil</Link>
                                            <Link href="/lists" className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white">Mis Listas</Link>
                                            <Link href="/groups" className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white">Mis Grupos</Link>
                                        </div>

                                        {isAdmin && (
                                            <div className="py-2 bg-orange-500/5">
                                                <div className="px-4 py-1 text-xs font-bold text-orange-500 uppercase tracking-wider">Panel</div>
                                                <Link href="/upload" className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white">Subir Capítulo</Link>
                                                <Link href="/admin/neosync" className="block px-4 py-2 text-sm text-orange-400 hover:bg-white/5 hover:text-orange-300 font-bold">NeoSync Dashboard</Link>
                                                <Link href="/admin/uploads" className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white">Moderación</Link>
                                                <Link href="/admin/users" className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white">Usuarios</Link>
                                            </div>
                                        )}

                                        <div className="py-2">
                                            <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300">
                                                Cerrar Sesión
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <Link href="/login" className="hidden md:inline-flex items-center justify-center px-4 py-1.5 text-sm font-medium text-white bg-primary hover:bg-orange-700 rounded-full transition-colors shadow-lg shadow-orange-900/20">
                                    Acceder
                                </Link>
                            )}

                            {/* Mobile Menu Button */}
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-white hover:text-primary p-2">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Nav */}
                {isMenuOpen && (
                    <div className="md:hidden bg-[#1f1f1f] border-t border-white/10 px-4 py-4 space-y-4 shadow-inner">
                        <form onSubmit={handleSearch} className="relative">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Buscar series..."
                                className="w-full bg-[#141414] border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                            />
                        </form>
                        <nav className="flex flex-col gap-2">
                            <Link href="/" className="px-4 py-2 rounded-lg hover:bg-white/5 text-gray-300">Inicio</Link>
                            <Link href="/series" className="px-4 py-2 rounded-lg hover:bg-white/5 text-gray-300">Biblioteca</Link>
                            <Link href="/lists" className="px-4 py-2 rounded-lg hover:bg-white/5 text-gray-300">Listas</Link>
                            <Link href="/groups" className="px-4 py-2 rounded-lg hover:bg-white/5 text-gray-300">Grupos</Link>
                            {user && <Link href="/history" className="px-4 py-2 rounded-lg hover:bg-white/5 text-gray-300">Historial</Link>}
                            <hr className="border-white/10 my-2" />
                            {isAdmin && (
                                <>
                                    <div className="px-4 text-xs font-bold text-orange-500 uppercase">Panel</div>
                                    <Link href="/upload" className="px-4 py-2 rounded-lg hover:bg-white/5 text-gray-300 ml-2">Uploads</Link>
                                    <Link href="/admin/uploads" className="px-4 py-2 rounded-lg hover:bg-white/5 text-gray-300 ml-2">Moderación</Link>
                                </>
                            )}
                        </nav>
                    </div>
                )}
            </header>
        </>
    );
}
