"use client";

import { useEffect, useMemo, useRef, useState } from 'react';

type Page = {
  id: string;
  image_url: string;
  page_number: number;
  width: number | null;
  height: number | null;
};

type Props = {
  chapterId: string;
  seriesId: string;
  chapterTitle: string;
  chapterNumber: number;
  pages: Page[];
  externalUrl?: string | null;
};

type ReadingMode = 'cascade' | 'paged';

export default function ReaderClient({ chapterId, seriesId, chapterTitle, chapterNumber, pages, externalUrl }: Props) {
  const [fitWidth, setFitWidth] = useState(true);
  const [readingMode, setReadingMode] = useState<ReadingMode>('cascade');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [counts, setCounts] = useState<Record<string, number>>({});

  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const totalPages = pages.length;

  const scrollToIndex = (idx: number) => {
    if (readingMode === 'cascade') {
      const node = pageRefs.current[idx];
      if (node) {
        node.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setCurrentIndex(idx);
      }
    } else {
      setCurrentIndex(idx);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  const goNext = () => {
    if (currentIndex < totalPages - 1) scrollToIndex(currentIndex + 1);
  };

  const goPrev = () => {
    if (currentIndex > 0) scrollToIndex(currentIndex - 1);
  };

  // Helper for Supabase Image Optimization
  const getOptimizedUrl = (url: string) => {
    if (!url || !url.includes('supabase.co')) return url;
    const separator = url.includes('?') ? '&' : '?';
    // Reader images: limit width to 1200px (good for desktop) and 80% quality
    return `${url}${separator}width=1200&quality=80`;
  };

  // Preload next 3 pages
  useEffect(() => {
    const preloadImages = () => {
      for (let i = 1; i <= 3; i++) {
        if (pages[currentIndex + i]) {
          const img = new Image();
          img.src = getOptimizedUrl(pages[currentIndex + i].image_url);
        }
      }
    };
    preloadImages();
  }, [currentIndex, pages]);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await fetch(`/api/reactions?chapter_id=${chapterId}`);
        const json = await res.json();
        if (res.ok) setCounts(json.counts || {});
      } catch {
        setCounts({});
      }
    };
    fetchCounts();
  }, [chapterId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (['ArrowRight', 'PageDown', ' ', 'd', 'D'].includes(e.key)) {
        e.preventDefault();
        goNext();
      }
      if (['ArrowLeft', 'PageUp', 'a', 'A'].includes(e.key)) {
        e.preventDefault();
        goPrev();
      }
      if (e.key === 'f') setFitWidth((prev) => !prev);
      if (e.key === 'm') setReadingMode((prev) => prev === 'cascade' ? 'paged' : 'cascade');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [currentIndex, readingMode]);

  const containerClasses = useMemo(
    () => 'bg-[#141414] text-white',
    []
  );

  return (
    <div className={`${containerClasses} min-h-screen flex flex-col`}>
      {/* Header */}
      <div className="sticky top-0 z-30 backdrop-blur border-b border-primary/30 px-4 py-3 flex items-center justify-between bg-[#1f1f1f]/90 shadow-lg">
        <div>
          <div className="text-xs text-gray-400 uppercase tracking-wider">Capítulo {chapterNumber}</div>
          <div className="text-lg font-bold text-white line-clamp-1">{chapterTitle}</div>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <button
            onClick={() => setReadingMode((p) => p === 'cascade' ? 'paged' : 'cascade')}
            className="hidden sm:block px-3 py-1.5 rounded border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
            title="Alternar modo de lectura (tecla M)"
          >
            {readingMode === 'cascade' ? 'Cascada' : 'Paginado'}
          </button>
          <button
            onClick={() => setFitWidth((p) => !p)}
            className="px-3 py-1.5 rounded border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
            title="Alternar ancho (tecla F)"
          >
            {fitWidth ? 'Ajuste ancho' : 'Ajuste normal'}
          </button>
          <div className="flex items-center gap-2 text-gray-400">
            {counts.like ? <span>👍 {counts.like}</span> : null}
            {counts.love ? <span>❤️ {counts.love}</span> : null}
            {counts.star ? <span>⭐ {counts.star}</span> : null}
          </div>
          <a
            href={`/series/${seriesId}`}
            className="px-4 py-1.5 rounded bg-primary text-white font-bold hover:bg-orange-700 transition-colors shadow-sm"
          >
            Volver
          </a>
        </div>
      </div>

      {/* Reader Content */}
      <div className="flex-1 max-w-5xl mx-auto w-full pb-24 px-2 sm:px-4 pt-8 relative">
        {readingMode === 'cascade' ? (
          // Cascade Mode
          pages.map((p, idx) => (
            <div
              key={p.id}
              ref={(el) => {
                pageRefs.current[idx] = el;
              }}
              className="flex justify-center mb-1"
            >
              <img
                src={getOptimizedUrl(p.image_url)}
                alt={`Página ${p.page_number}`}
                className={`w-full ${fitWidth ? '' : 'max-w-4xl'} h-auto shadow-2xl`}
                loading="lazy"
              />
            </div>
          ))
        ) : (
          // Paged Mode
          <div className="flex justify-center min-h-[80vh] items-center">
            {pages[currentIndex] ? (
              <img
                src={getOptimizedUrl(pages[currentIndex].image_url)}
                alt={`Página ${pages[currentIndex].page_number}`}
                className={`w-full ${fitWidth ? '' : 'max-w-4xl'} h-auto shadow-2xl max-h-screen object-contain`}
              />
            ) : (
              <div className="text-center text-gray-500 py-20">Cargando...</div>
            )}
          </div>
        )}

        {pages.length === 0 && (
          <div className="text-center py-20 flex flex-col items-center justify-center space-y-6">
            {externalUrl ? (
              <>
                <p className="text-xl text-gray-300">Este capítulo se lee en el sitio oficial.</p>
                <a
                  href={externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 bg-primary hover:bg-orange-600 text-white font-bold rounded-full transition-transform hover:scale-105 shadow-xl flex items-center gap-2"
                >
                  <span>Leer en fuente oficial</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
                <p className="text-sm text-gray-500 max-w-md">
                  Estás siendo redirigido fuera de TMO Clone para apoyar a los creadores en la plataforma licenciada.
                </p>
              </>
            ) : (
              <p className="text-gray-500">Este capítulo no tiene páginas disponibles.</p>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="fixed bottom-6 right-6 bg-[#1f1f1f] border border-white/10 text-white rounded-full px-6 py-3 text-sm flex items-center gap-4 shadow-2xl z-40">
        <button onClick={goPrev} className="hover:text-primary transition-colors font-medium disabled:opacity-50" disabled={currentIndex === 0}>
          Anterior
        </button>
        <div className="text-gray-400 font-mono">
          {currentIndex + 1} / {totalPages || 1}
        </div>
        <button onClick={goNext} className="hover:text-primary transition-colors font-medium disabled:opacity-50" disabled={currentIndex === totalPages - 1}>
          Siguiente
        </button>
      </div>
    </div>
  );
}
