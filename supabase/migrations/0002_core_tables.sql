-- ======================================================
-- 0002 - Core tables for manga/webtoon platform (FIXED)
-- Includes: series, chapters, pages, uploads, comments,
-- bookmarks, history, reports, settings, audit_logs,
-- scanlation_groups, group_members
-- ======================================================

-- SCANLATION GROUPS (moved from 0003)
CREATE TABLE IF NOT EXISTS public.scanlation_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  website text,
  discord text,
  owner_id uuid REFERENCES public.profiles(id),
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE TRIGGER scanlation_groups_updated
BEFORE UPDATE ON public.scanlation_groups
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- GROUP MEMBERS (moved from 0003)
CREATE TABLE IF NOT EXISTS public.group_members (
  group_id uuid REFERENCES public.scanlation_groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id),
  role text DEFAULT 'member',
  created_at timestamp DEFAULT now(),
  PRIMARY KEY (group_id, user_id)
);


-- SERIES
CREATE TABLE IF NOT EXISTS public.series (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE,
  type text,
  status text,
  language text DEFAULT 'en',
  created_by uuid REFERENCES public.profiles(id),
  description text,
  cover_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TRIGGER series_updated_at
BEFORE UPDATE ON public.series
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();


-- CHAPTERS
CREATE TABLE IF NOT EXISTS public.chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id uuid REFERENCES public.series(id) ON DELETE CASCADE,
  chapter_number numeric NOT NULL,
  volume_number numeric,
  title text,
  uploader_id uuid REFERENCES public.profiles(id),
  group_id uuid REFERENCES public.scanlation_groups(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TRIGGER chapters_updated_at
BEFORE UPDATE ON public.chapters
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- PAGES
CREATE TABLE IF NOT EXISTS public.pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id uuid REFERENCES public.chapters(id) ON DELETE CASCADE,
  page_number integer NOT NULL,
  image_url text NOT NULL,
  width integer,
  height integer,
  created_at timestamp DEFAULT now()
);


-- UPLOADS
CREATE TABLE IF NOT EXISTS public.uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uploader_id uuid REFERENCES public.profiles(id),
  bucket text NOT NULL,
  path text NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE TRIGGER uploads_updated_at
BEFORE UPDATE ON public.uploads
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- COMMENTS
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id),
  series_id uuid REFERENCES public.series(id),
  chapter_id uuid REFERENCES public.chapters(id),
  content text NOT NULL,
  parent_id uuid REFERENCES public.comments(id),
  is_deleted boolean DEFAULT false,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE TRIGGER comments_updated_at
BEFORE UPDATE ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- COMMENT LIKES
CREATE TABLE IF NOT EXISTS public.comment_likes (
  user_id uuid REFERENCES public.profiles(id),
  comment_id uuid REFERENCES public.comments(id) ON DELETE CASCADE,
  created_at timestamp DEFAULT now(),
  PRIMARY KEY (user_id, comment_id)
);


-- LIBRARY (BOOKMARKS)
CREATE TABLE IF NOT EXISTS public.bookmarks (
  user_id uuid REFERENCES public.profiles(id),
  series_id uuid REFERENCES public.series(id),
  status text DEFAULT 'reading',
  updated_at timestamp DEFAULT now(),
  PRIMARY KEY (user_id, series_id)
);


-- HISTORY
CREATE TABLE IF NOT EXISTS public.reading_history (
  user_id uuid REFERENCES public.profiles(id),
  series_id uuid REFERENCES public.series(id),
  chapter_id uuid REFERENCES public.chapters(id),
  progress_percent numeric DEFAULT 0,
  updated_at timestamp DEFAULT now(),
  PRIMARY KEY (user_id, chapter_id)
);


-- REPORTS
CREATE TABLE IF NOT EXISTS public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid REFERENCES public.profiles(id),
  target_id uuid,
  reason text NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE TRIGGER reports_updated_at
BEFORE UPDATE ON public.reports
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES public.profiles(id),
  action text,
  target_table text,
  details jsonb,
  created_at timestamp DEFAULT now()
);


-- SYSTEM SETTINGS
CREATE TABLE IF NOT EXISTS public.system_settings (
  key text PRIMARY KEY,
  value jsonb,
  updated_at timestamp DEFAULT now()
);

CREATE TRIGGER system_settings_updated
BEFORE UPDATE ON public.system_settings
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
