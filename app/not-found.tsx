import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center">
            <div className="space-y-6">
                <h1 className="text-9xl font-black text-gray-800 select-none animate-pulse">404</h1>

                <div className="relative z-10 -mt-12">
                    <h2 className="text-3xl font-bold text-white mb-2">Página no encontrada</h2>
                    <p className="text-gray-400 max-w-md mx-auto">
                        Lo sentimos, la página que buscas no existe o ha sido movida a otro universo.
                    </p>
                </div>

                <div className="flex gap-4 justify-center mt-8 relative z-10">
                    <Link
                        href="/"
                        className="px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-orange-700 transition shadow-lg shadow-orange-900/20"
                    >
                        Volver al Inicio
                    </Link>
                    <Link
                        href="/series"
                        className="px-6 py-3 bg-white/10 text-white font-bold rounded-lg hover:bg-white/20 transition"
                    >
                        Explorar Biblioteca
                    </Link>
                </div>
            </div>
        </div>
    );
}
