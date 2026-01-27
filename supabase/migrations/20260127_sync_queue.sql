-- Migration: NeoSync Infrastructure
-- Date: 2026-01-27
-- Description: Creates a persistent queue for autonomous content discovery and synchronization.

-- 1. EXTEND SERIES TABLE
ALTER TABLE public.series 
ADD COLUMN IF NOT EXISTS last_sync_at timestamptz,
ADD COLUMN IF NOT EXISTS sync_priority integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS sync_status text DEFAULT 'idle'; -- idle, queued, syncing, error

-- 2. CREATE SYNC QUEUE
CREATE TABLE IF NOT EXISTS public.sync_queue (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id text NOT NULL, -- MangaDex ID
    type text NOT NULL, -- 'series' (for discovery/meta) or 'chapters' (for backfilling)
    status text DEFAULT 'pending', -- pending, processing, completed, error
    priority integer DEFAULT 0,
    attempts integer DEFAULT 0,
    last_error text,
    metadata jsonb DEFAULT '{}'::jsonb, -- Store pagination offset etc.
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sync_queue_status_priority ON public.sync_queue(status, priority DESC, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_series_last_sync ON public.series(last_sync_at);

-- RLS for sync_queue (Admin only)
ALTER TABLE public.sync_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage sync queue" ON public.sync_queue
FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin'))
);

-- Trigger for updated_at
CREATE TRIGGER sync_queue_updated BEFORE UPDATE ON public.sync_queue FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
