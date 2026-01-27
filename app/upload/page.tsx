"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

type SeriesOption = { id: string; title: string };

const Input = (props: any) => (
  <input
    {...props}
    className="w-full border border-white/10 bg-white/5 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
  />
);

const Select = (props: any) => (
  <select
    {...props}
    className="w-full border border-white/10 bg-white/5 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
);

export default function UploadPage() {
  const [activeTab, setActiveTab] = useState<'upload' | 'create'>('upload');

  // Upload Chapter State
  const [series, setSeries] = useState<SeriesOption[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<string>("");
  const [chapterNumber, setChapterNumber] = useState("");
  const [chapterTitle, setChapterTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const [myUploads, setMyUploads] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Create Series State
  const [newSeriesTitle, setNewSeriesTitle] = useState("");
  const [newSeriesSlug, setNewSeriesSlug] = useState("");
  const [newSeriesType, setNewSeriesType] = useState("Manga");
  const [newSeriesStatus, setNewSeriesStatus] = useState("ongoing");
  const [newSeriesDescription, setNewSeriesDescription] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  // Group State
  const [myGroups, setMyGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("");

  const fetchSeries = async () => {
    const res = await fetch("/api/series?limit=100");
    const json = await res.json();
    setSeries(json.data || []);
    if (json.data?.[0] && !selectedSeries) setSelectedSeries(json.data[0].id);
  };

  const fetchUploads = async () => {
    try {
      const res = await fetch("/api/uploads");
      const json = await res.json();
      if (res.ok) setMyUploads(json.data || []);
    } catch {
      // ignore
    }
  };

  const fetchMyGroups = async () => {
    try {
      // We need an endpoint to get groups I'm a member of.
      // For now, let's assume we can filter /api/groups or use a new endpoint.
      // Let's use /api/groups?member=me if we implemented it, or just fetch all and filter client side (not ideal but works for small scale).
      // Better: Create /api/groups/me or similar.
      // I'll implement fetching from /api/groups/me in the next step, so I'll assume it exists.
      const res = await fetch("/api/groups/me");
      const json = await res.json();
      if (res.ok) {
        setMyGroups(json || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchSeries();
    fetchUploads();
    fetchMyGroups();
  }, []);

  // Auto-generate slug from title
  useEffect(() => {
    const slug = newSeriesTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    setNewSeriesSlug(slug);
  }, [newSeriesTitle]);

  const handleUpload = async () => {
    try {
      if (!selectedSeries || !chapterNumber || !fileInputRef.current?.files?.length) {
        toast.error("Completa los campos y selecciona archivos");
        return;
      }
      setIsUploading(true);

      // 1) crear signed URL para cada archivo
      const uploads = Array.from(fileInputRef.current.files || []);
      const signedUrls = await Promise.all(
        uploads.map(async (file, idx) => {
          const path = `series/${selectedSeries}/chapters/${chapterNumber}/page-${idx + 1}.jpg`;
          const res = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ bucket: "pages", path }),
          });
          const json = await res.json();
          if (!res.ok) throw new Error(json.error || "No se pudo obtener signed URL");
          return { ...json, file, path };
        })
      );

      // 2) subir archivos a storage
      await Promise.all(
        signedUrls.map(async ({ signedUrl, token, file }) => {
          const resp = await fetch(signedUrl, {
            method: "PUT",
            headers: { "Content-Type": file.type },
            body: file,
          });
          if (!resp.ok) throw new Error("Falló upload en storage");
        })
      );

      // 3) registrar capítulo + páginas en DB
      const pagesPayload = signedUrls.map((s, idx) => ({
        page_number: idx + 1,
        image_url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/pages/${s.path}`,
      }));

      const resChapter = await fetch("/api/chapters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          series_id: selectedSeries,
          chapter_number: Number(chapterNumber),
          title: chapterTitle || null,
          pages: pagesPayload,
          group_id: selectedGroup || null,
        }),
      });
      const jsonChapter = await resChapter.json();
      if (!resChapter.ok) throw new Error(jsonChapter.error || "Error al registrar capítulo");

      toast.success(`Capítulo creado con ID: ${jsonChapter.chapterId}`);
      setChapterNumber("");
      setChapterTitle("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchUploads();
    } catch (err: any) {
      toast.error(err.message || "Error en la subida");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateSeries = async () => {
    try {
      if (!newSeriesTitle || !newSeriesSlug) {
        toast.error("Título y Slug son obligatorios");
        return;
      }
      setIsCreating(true);

      let coverUrl = null;

      // 1. Upload Cover if exists
      if (coverFile) {
        const ext = coverFile.name.split('.').pop();
        const path = `covers/${newSeriesSlug}-${Date.now()}.${ext}`;

        // Get signed URL
        const resSign = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bucket: "pages", path }), // Using 'pages' bucket for now as it's confirmed to work
        });
        const jsonSign = await resSign.json();
        if (!resSign.ok) throw new Error(jsonSign.error || "Error al preparar subida de portada");

        // Upload to storage
        const resUpload = await fetch(jsonSign.signedUrl, {
          method: "PUT",
          headers: { "Content-Type": coverFile.type },
          body: coverFile,
        });
        if (!resUpload.ok) throw new Error("Falló subida de portada");

        coverUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/pages/${path}`;
      }

      // 2. Create Series in DB
      const resSeries = await fetch("/api/series", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newSeriesTitle,
          slug: newSeriesSlug,
          type: newSeriesType,
          status: newSeriesStatus,
          description: newSeriesDescription,
          cover_url: coverUrl,
          group_id: selectedGroup || null,
        }),
      });
      const jsonSeries = await resSeries.json();
      if (!resSeries.ok) throw new Error(jsonSeries.error || "Error al crear serie");

      toast.success(`Serie "${jsonSeries.title}" creada exitosamente!`);

      // Reset form
      setNewSeriesTitle("");
      setNewSeriesDescription("");
      setCoverFile(null);
      if (coverInputRef.current) coverInputRef.current.value = "";

      // Refresh list
      fetchSeries();
      setActiveTab('upload'); // Switch back to upload tab
      setSelectedSeries(jsonSeries.id); // Select the new series

    } catch (err: any) {
      toast.error(err.message || "Error al crear serie");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 text-white">
      <div className="glass neon-border rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Panel de Gestión</h1>
          <span className="text-xs pill text-blue-100">uploader/editor/admin</span>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-white/10">
          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-2 px-4 font-medium transition-colors ${activeTab === 'upload'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-400 hover:text-white'
              }`}
          >
            Subir Capítulo
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`pb-2 px-4 font-medium transition-colors ${activeTab === 'create'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-400 hover:text-white'
              }`}
          >
            Crear Nueva Serie
          </button>
        </div>

        {/* Group Selector */}
        {myGroups.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm text-gray-200 mb-2">Subir como Grupo (Opcional)</label>
            <Select value={selectedGroup} onChange={(e: any) => setSelectedGroup(e.target.value)}>
              <option value="">-- Individual (Usuario) --</option>
              {myGroups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </Select>
          </div>
        )}

        {activeTab === 'upload' ? (
          <>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-200 mb-2">Serie</label>
                <Select value={selectedSeries} onChange={(e: any) => setSelectedSeries(e.target.value)}>
                  {series.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-sm text-gray-200 mb-2">Capítulo #</label>
                <Input value={chapterNumber} onChange={(e: any) => setChapterNumber(e.target.value)} placeholder="Ej: 10" />
              </div>
              <div>
                <label className="block text-sm text-gray-200 mb-2">Título (opcional)</label>
                <Input value={chapterTitle} onChange={(e: any) => setChapterTitle(e.target.value)} placeholder="Título" />
              </div>
              <div>
                <label className="block text-sm text-gray-200 mb-2">Archivos (imágenes)</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="w-full text-sm text-gray-200 file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => handleUpload()}
                disabled={isUploading}
                className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-fuchsia-600 text-white font-semibold shadow disabled:opacity-60"
              >
                {isUploading ? "Subiendo..." : "Subir capítulo"}
              </button>
            </div>
          </>
        ) : (
          /* Create Series Form */
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-200 mb-2">Título</label>
                <Input value={newSeriesTitle} onChange={(e: any) => setNewSeriesTitle(e.target.value)} placeholder="Ej: Solo Leveling" />
              </div>
              <div>
                <label className="block text-sm text-gray-200 mb-2">Slug (URL)</label>
                <Input value={newSeriesSlug} onChange={(e: any) => setNewSeriesSlug(e.target.value)} placeholder="solo-leveling" />
              </div>
              <div>
                <label className="block text-sm text-gray-200 mb-2">Tipo</label>
                <Select value={newSeriesType} onChange={(e: any) => setNewSeriesType(e.target.value)}>
                  <option value="Manga">Manga</option>
                  <option value="Manhwa">Manhwa</option>
                  <option value="Manhua">Manhua</option>
                  <option value="Novel">Novela</option>
                  <option value="One Shot">One Shot</option>
                  <option value="Doujinshi">Doujinshi</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm text-gray-200 mb-2">Estado</label>
                <Select value={newSeriesStatus} onChange={(e: any) => setNewSeriesStatus(e.target.value)}>
                  <option value="ongoing">En Emisión</option>
                  <option value="completed">Completado</option>
                  <option value="hiatus">Hiatus</option>
                  <option value="dropped">Cancelado</option>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-200 mb-2">Descripción</label>
              <textarea
                value={newSeriesDescription}
                onChange={(e) => setNewSeriesDescription(e.target.value)}
                className="w-full border border-white/10 bg-white/5 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400 h-24"
                placeholder="Sinopsis de la serie..."
              />
            </div>

            <div>
              <label className="block text-sm text-gray-200 mb-2">Portada</label>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-gray-200 file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-500"
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleCreateSeries}
                disabled={isCreating}
                className="px-6 py-2 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold shadow disabled:opacity-60"
              >
                {isCreating ? "Creando..." : "Crear Serie"}
              </button>
            </div>
          </div>
        )}



        <div className="mt-6 text-xs text-gray-400 leading-relaxed border-t border-white/10 pt-4">
          {activeTab === 'upload'
            ? "Flujo: firmado → upload storage → POST /api/chapters. Las policies RLS ya permiten a uploader/editor/admin crear capítulos."
            : "Flujo: upload portada → POST /api/series. Requiere rol uploader/editor/admin."
          }
        </div>

        {activeTab === 'upload' && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-white mb-3">Mis uploads recientes</h2>
            <div className="bg-white/5 border border-white/10 rounded-xl divide-y divide-white/10">
              {myUploads.length === 0 && <div className="p-4 text-gray-400">Sin registros.</div>}
              {myUploads.map((u) => (
                <div key={u.id} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-100">Serie: {u.series_id || '-'}</div>
                    <div className="text-xs text-gray-400">Capítulo: {u.chapter_id || '-'}</div>
                    <div className="text-xs text-gray-500">{u.path}</div>
                  </div>
                  <div className="text-xs uppercase px-2 py-1 rounded-full bg-white/10 border border-white/10">
                    {u.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
