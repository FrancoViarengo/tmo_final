-- 1. Add Premium Status to Profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_premium boolean DEFAULT false;

-- 2. Create DMCA Reports Table
CREATE TABLE IF NOT EXISTS public.dmca_reports (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL, -- Reporter
  content_type text NOT NULL CHECK (content_type IN ('series', 'chapter', 'comment')),
  content_id uuid NOT NULL, -- ID of the reported item
  reason text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'dismissed', 'resolved')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dmca_reports ENABLE ROW LEVEL SECURITY;

-- Policies
-- Admins can view/update
-- Users can insert (report)

CREATE POLICY "Admins can view all dmca reports"
  ON public.dmca_reports
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update dmca reports"
  ON public.dmca_reports
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Authenticated users can create reports"
  ON public.dmca_reports
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
