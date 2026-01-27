import Link from "next/link";

export default function NewsPage() {
    return (
        <div className="min-h-screen pb-12">
            <div className="max-w-7xl mx-auto px-4 py-10">
                <h1 className="text-3xl font-bold text-white mb-8 border-b border-white/5 pb-4">Noticias</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main News */}
                    <div className="lg:col-span-2 space-y-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-card border border-white/5 rounded-xl overflow-hidden hover:border-primary/30 transition group">
                                <div className="aspect-video w-full bg-gray-800 relative">
                                    <div className="absolute inset-0 flex items-center justify-center text-gray-600">
                                        Imagen de Noticia
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="px-2 py-1 bg-primary/20 text-primary text-xs font-bold rounded uppercase">Anuncio</span>
                                        <span className="text-gray-500 text-xs">Hace 5 horas</span>
                                    </div>
                                    <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-primary transition-colors cursor-pointer">
                                        Mantenimiento programado para el servidor de imágenes
                                    </h2>
                                    <p className="text-gray-400 leading-relaxed">
                                        Estaremos realizando tareas de mantenimiento en nuestros servidores de imágenes para mejorar la velocidad de carga. El servicio podría verse interrumpido brevemente.
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-card border border-white/5 rounded-xl p-6">
                            <h3 className="font-bold text-white mb-4 border-b border-white/5 pb-2">Categorías</h3>
                            <div className="space-y-2">
                                {['Anuncios', 'Estrenos', 'Eventos', 'Tutoriales'].map((cat) => (
                                    <div key={cat} className="flex items-center justify-between text-sm text-gray-400 hover:text-primary cursor-pointer transition-colors p-2 hover:bg-white/5 rounded">
                                        <span>{cat}</span>
                                        <span className="bg-white/5 px-2 py-0.5 rounded text-xs">12</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
