-- Migration: Security & Performance Bulk Fix
-- Date: 2026-01-27
-- Description: Enables RLS on public tables, refactors views to hide auth.users, and adds missing indexes for FKs.

-- 1. ENABLE RLS ON PUBLIC TABLES
ALTER TABLE public.series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- 2. POLICIES FOR SECURED TABLES
-- Series: Everyone can view, but only admins/uploaders can modify
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public series are viewable by everyone' AND tablename = 'series') THEN
        CREATE POLICY "Public series are viewable by everyone" ON public.series FOR SELECT USING (is_deleted = false);
    END IF;
END $$;

-- Reports: Only owner or admin can see/manage
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own reports' AND tablename = 'reports') THEN
        CREATE POLICY "Users can view their own reports" ON public.reports FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can create reports' AND tablename = 'reports') THEN
        CREATE POLICY "Users can create reports" ON public.reports FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- Audit Logs: Only admins can see
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view audit logs' AND tablename = 'audit_logs') THEN
        CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT USING (
            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin'))
        );
    END IF;
END $$;

-- 3. REFACTOR VIEWS (Privacy Fix: Remove auth.users dependency)
-- First, ensure avatar_url in profiles is populated from metadata if empty
UPDATE public.profiles p
SET avatar_url = au.raw_user_meta_data ->> 'avatar_url'
FROM auth.users au
WHERE p.id = au.id AND (p.avatar_url IS NULL OR p.avatar_url = '');

-- Refactor Top Commenters View
CREATE OR REPLACE VIEW public.view_top_commenters AS
 SELECT cm.user_id,
    p.username,
    p.reputation,
    p.avatar_url,
    count(cm.id) AS comment_count
   FROM (public.comments cm
     JOIN public.profiles p ON ((cm.user_id = p.id)))
  WHERE (cm.is_deleted = false)
  GROUP BY cm.user_id, p.username, p.reputation, p.avatar_url
  ORDER BY (count(cm.id)) DESC, p.reputation DESC;

-- Refactor Top Readers View
CREATE OR REPLACE VIEW public.view_top_readers AS
 SELECT rh.user_id,
    p.username,
    p.reputation,
    p.avatar_url,
    count(DISTINCT rh.chapter_id) AS read_count
   FROM (public.reading_history rh
     JOIN public.profiles p ON ((rh.user_id = p.id)))
  GROUP BY rh.user_id, p.username, p.reputation, p.avatar_url
  ORDER BY (count(DISTINCT rh.chapter_id)) DESC, p.reputation DESC;

-- Refactor Top Uploaders View
CREATE OR REPLACE VIEW public.view_top_uploaders AS
 SELECT c.uploader_id AS user_id,
    p.username,
    p.reputation,
    p.avatar_url,
    count(c.id) AS upload_count
   FROM (public.chapters c
     JOIN public.profiles p ON ((c.uploader_id = p.id)))
  GROUP BY c.uploader_id, p.username, p.reputation, p.avatar_url
  ORDER BY (count(c.id)) DESC, p.reputation DESC;


-- 4. PERFORMANCE INDEXES (Missing FK coverage)
-- Create indexes concurrently is safer but cannot be done in a transaction/function block comfortably here.
-- Standard CREATE INDEX is fine for the setup phase.

CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON public.audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_series_id ON public.bookmarks(series_id);
CREATE INDEX IF NOT EXISTS idx_chapters_group_id ON public.chapters(group_id);
CREATE INDEX IF NOT EXISTS idx_group_followers_group_id ON public.group_followers(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON public.group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_list_items_series_id ON public.list_items(series_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_history_series_id ON public.reading_history(series_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_cache_user_id ON public.recommendation_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_series_id ON public.reports(series_id);
CREATE INDEX IF NOT EXISTS idx_scanlation_groups_owner_id ON public.scanlation_groups(owner_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON public.user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_chapters_uploader_id ON public.chapters(uploader_id);
CREATE INDEX IF NOT EXISTS idx_series_created_by ON public.series(created_by);
