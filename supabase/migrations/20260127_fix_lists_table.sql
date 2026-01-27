-- Migration: Create User Lists tables (Fixes PGRST205)
-- Date: 2026-01-27

-- 1. LISTS TABLE
create table if not exists public.lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text,
  is_public boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.lists enable row level security;

-- Policies for Lists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public lists are viewable by everyone' AND tablename = 'lists') THEN
        create policy "Public lists are viewable by everyone" on public.lists for select using ( is_public = true );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own lists' AND tablename = 'lists') THEN
        create policy "Users can view their own lists" on public.lists for select using ( auth.uid() = user_id );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own lists' AND tablename = 'lists') THEN
        create policy "Users can insert their own lists" on public.lists for insert with check ( auth.uid() = user_id );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own lists' AND tablename = 'lists') THEN
        create policy "Users can update their own lists" on public.lists for update using ( auth.uid() = user_id );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete their own lists' AND tablename = 'lists') THEN
        create policy "Users can delete their own lists" on public.lists for delete using ( auth.uid() = user_id );
    END IF;
END
$$;

-- 2. LIST_ITEMS TABLE
create table if not exists public.list_items (
  list_id uuid references public.lists(id) on delete cascade not null,
  series_id uuid references public.series(id) on delete cascade not null,
  added_at timestamp with time zone default now(),
  primary key (list_id, series_id)
);

-- Enable RLS
alter table public.list_items enable row level security;

-- Policies for List Items
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Items viewable if list is viewable' AND tablename = 'list_items') THEN
        create policy "Items viewable if list is viewable" on public.list_items for select using (
            exists (select 1 from public.lists where lists.id = list_items.list_id and (lists.is_public = true or lists.user_id = auth.uid()))
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Owners can add items' AND tablename = 'list_items') THEN
        create policy "Owners can add items" on public.list_items for insert with check (
            exists (select 1 from public.lists where lists.id = list_items.list_id and lists.user_id = auth.uid())
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Owners can remove items' AND tablename = 'list_items') THEN
        create policy "Owners can remove items" on public.list_items for delete using (
            exists (select 1 from public.lists where lists.id = list_items.list_id and lists.user_id = auth.uid())
        );
    END IF;
END
$$;
