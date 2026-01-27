-- Add 'score' and 'tags' to 'series' table
ALTER TABLE public.series
ADD COLUMN IF NOT EXISTS score numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- Create index for score to help with "Popular" sorting
CREATE INDEX IF NOT EXISTS idx_series_score ON public.series (score DESC);

-- Create index for tags to help with Search filtering
CREATE INDEX IF NOT EXISTS idx_series_tags ON public.series USING GIN (tags);
