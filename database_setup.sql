-- =============================================================================
-- NEOMANGA DATABASE SETUP SCRIPT
-- =============================================================================
-- Run this script in the Supabase SQL Editor to set up the entire database.
-- It includes:
-- 1. Core Tables (Profiles, Series, Chapters, etc.)
-- 2. Storage Buckets & Policies
-- 3. Group Integration
-- 4. User Lists
-- 5. Helper Functions & Triggers
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (Managed by Supabase Auth usually, but ensuring table exists)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users on delete cascade PRIMARY KEY,
  username text UNIQUE,
  avatar_url text,
  role text DEFAULT 'user', -- user, uploader, editor, admin, superadmin
  level integer DEFAULT 1,
  xp integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- 2. SCANLATION GROUPS
CREATE TABLE IF NOT EXISTS public.scanlation_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  website text,
  discord text,
  owner_id uuid REFERENCES public.profiles(id),
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- 3. SERIES
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
  group_id uuid REFERENCES public.scanlation_groups(id), -- Added for Group Integration
  is_deleted boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 4. CHAPTERS
CREATE TABLE IF NOT EXISTS public.chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id uuid REFERENCES public.series(id) ON DELETE CASCADE,
  chapter_number numeric NOT NULL,
  volume_number numeric,
  title text,
  uploader_id uuid REFERENCES public.profiles(id),
  group_id uuid REFERENCES public.scanlation_groups(id),
  is_deleted boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 5. PAGES
CREATE TABLE IF NOT EXISTS public.pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id uuid REFERENCES public.chapters(id) ON DELETE CASCADE,
  page_number integer NOT NULL,
  image_url text NOT NULL,
  width integer,
  height integer,
  created_at timestamp DEFAULT now()
);

-- 6. UPLOADS (For tracking file uploads)
CREATE TABLE IF NOT EXISTS public.uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uploader_id uuid REFERENCES public.profiles(id),
  series_id uuid REFERENCES public.series(id),
  chapter_id uuid REFERENCES public.chapters(id),
  bucket text NOT NULL,
  path text NOT NULL,
  status text DEFAULT 'pending', -- pending, approved, rejected
  file_type text,
  file_size integer,
  group_id uuid REFERENCES public.scanlation_groups(id),
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- 7. GROUP MEMBERS & FOLLOWERS
CREATE TABLE IF NOT EXISTS public.group_members (
  group_id uuid REFERENCES public.scanlation_groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id),
  role text DEFAULT 'member',
  created_at timestamp DEFAULT now(),
  PRIMARY KEY (group_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.group_followers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  group_id uuid REFERENCES public.scanlation_groups(id) NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, group_id)
);

-- 8. USER LISTS
CREATE TABLE IF NOT EXISTS public.lists (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) NOT NULL,
  name text NOT NULL,
  description text,
  is_public boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.list_items (
  list_id uuid REFERENCES public.lists(id) ON DELETE CASCADE,
  series_id uuid REFERENCES public.series(id) ON DELETE CASCADE,
  added_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (list_id, series_id)
);

-- 9. USER LIBRARY & HISTORY
CREATE TABLE IF NOT EXISTS public.bookmarks (
  user_id uuid REFERENCES public.profiles(id),
  series_id uuid REFERENCES public.series(id),
  status text DEFAULT 'reading',
  updated_at timestamp DEFAULT now(),
  PRIMARY KEY (user_id, series_id)
);

CREATE TABLE IF NOT EXISTS public.reading_history (
  user_id uuid REFERENCES public.profiles(id),
  series_id uuid REFERENCES public.series(id),
  chapter_id uuid REFERENCES public.chapters(id),
  progress_percent numeric DEFAULT 0,
  updated_at timestamp DEFAULT now(),
  PRIMARY KEY (user_id, chapter_id)
);

-- 10. STORAGE BUCKETS
-- Note: You might need to create these manually in the dashboard if this fails, 
-- but this script attempts to insert them.
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('pages', 'pages', true),
  ('covers', 'covers', true),
  ('avatars', 'avatars', true),
  ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

-- 11. ROW LEVEL SECURITY (RLS) - SIMPLIFIED FOR SETUP
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE series ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE scanlation_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_history ENABLE ROW LEVEL SECURITY;

-- Create basic policies (Adjust as needed for stricter security)

-- Public Read Access
CREATE POLICY "Public Read Series" ON series FOR SELECT USING (is_deleted = false);
CREATE POLICY "Public Read Chapters" ON chapters FOR SELECT USING (is_deleted = false);
CREATE POLICY "Public Read Pages" ON pages FOR SELECT USING (true);
CREATE POLICY "Public Read Groups" ON scanlation_groups FOR SELECT USING (true);
CREATE POLICY "Public Read Profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Public Read Lists" ON lists FOR SELECT USING (is_public = true);
CREATE POLICY "Public Read List Items" ON list_items FOR SELECT USING (EXISTS (SELECT 1 FROM lists WHERE id = list_items.list_id AND is_public = true));

-- Authenticated User Access
CREATE POLICY "Users manage own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users manage own lists" ON lists FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own list items" ON list_items FOR ALL USING (EXISTS (SELECT 1 FROM lists WHERE id = list_items.list_id AND user_id = auth.uid()));
CREATE POLICY "Users manage own bookmarks" ON bookmarks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own history" ON reading_history FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own follows" ON group_followers FOR ALL USING (auth.uid() = user_id);

-- Staff/Group Access (Simplified)
-- Ideally use the helper function 'authorize' defined in migration 0005 for robust RBAC.
-- For this setup script, we assume basic checks or that you run the detailed migrations.

-- Helper function for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER series_updated BEFORE UPDATE ON series FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER chapters_updated BEFORE UPDATE ON chapters FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
