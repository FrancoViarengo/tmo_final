-- =============================================================================
-- MIGRACIÓN 0006: NOTIFICATIONS, RECOMMENDATION CACHE, REACTIONS
-- =============================================================================

-- 1) Notifications
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  type text not null,
  payload jsonb,
  read_at timestamptz,
  created_at timestamptz default now()
);

alter table public.notifications enable row level security;

create index if not exists idx_notifications_user on public.notifications (user_id);
create index if not exists idx_notifications_created_at on public.notifications (created_at);

-- 2) Recommendation cache
create table if not exists public.recommendation_cache (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  series_id uuid references public.series(id) on delete cascade,
  score numeric,
  reason text,
  created_at timestamptz default now()
);

alter table public.recommendation_cache enable row level security;

create index if not exists idx_reco_user on public.recommendation_cache (user_id);
create index if not exists idx_reco_series on public.recommendation_cache (series_id);
create index if not exists idx_reco_score on public.recommendation_cache (score);

-- 3) Reactions (opcional)
create table if not exists public.reactions (
  user_id uuid references public.profiles(id) on delete cascade,
  series_id uuid references public.series(id) on delete cascade,
  chapter_id uuid references public.chapters(id) on delete cascade,
  reaction text check (reaction in ('like','love','laugh','wow','sad','angry','star')),
  created_at timestamptz default now(),
  primary key (user_id, series_id, chapter_id, reaction)
);

alter table public.reactions enable row level security;

create index if not exists idx_reactions_user on public.reactions (user_id);
create index if not exists idx_reactions_series on public.reactions (series_id);
create index if not exists idx_reactions_chapter on public.reactions (chapter_id);
