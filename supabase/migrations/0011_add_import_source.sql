-- Add source and external_id to series
ALTER TABLE public.series
ADD COLUMN IF NOT EXISTS source text DEFAULT 'local' CHECK (source IN ('local', 'mangadex')),
ADD COLUMN IF NOT EXISTS external_id text,
ADD COLUMN IF NOT EXISTS external_thumbnail text;

-- Add index for looking up by external_id (crucial for "Already Imported" checks)
CREATE INDEX IF NOT EXISTS idx_series_external_id ON public.series(external_id);

-- Add source and external_id to chapters
ALTER TABLE public.chapters
ADD COLUMN IF NOT EXISTS source text DEFAULT 'local' CHECK (source IN ('local', 'mangadex')),
ADD COLUMN IF NOT EXISTS external_id text;

-- Add index for chapters
CREATE INDEX IF NOT EXISTS idx_chapters_external_id ON public.chapters(external_id);
