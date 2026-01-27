-- =============================================================================
-- MIGRACIÓN 0004: CONSTRAINTS, ÍNDICES, SOFT DELETE, TRIGGERS updated_at
-- =============================================================================

-- 1) UNIQUE constraints
-- Ensure helper function exists (compatibility with prior migrations)
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'series_slug_key'
  ) then
    alter table public.series add constraint series_slug_key unique (slug);
  end if;
end$$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'chapters_series_id_chapter_number_key'
  ) then
    alter table public.chapters add constraint chapters_series_id_chapter_number_key unique (series_id, chapter_number);
  end if;
end$$;

-- 2) Índices
create index if not exists idx_series_slug on public.series (slug);
create index if not exists idx_series_created_at on public.series (created_at);

create index if not exists idx_chapters_series_id on public.chapters (series_id);
create index if not exists idx_chapters_created_at on public.chapters (created_at);

create index if not exists idx_pages_chapter_id on public.pages (chapter_id);

create index if not exists idx_bookmarks_user_series on public.bookmarks (user_id, series_id);
create index if not exists idx_reading_history_user_series on public.reading_history (user_id, series_id);

create index if not exists idx_comments_series on public.comments (series_id);
create index if not exists idx_comments_chapter on public.comments (chapter_id);

-- 3) Soft delete columns
alter table public.series
  add column if not exists is_deleted boolean default false,
  add column if not exists deleted_at timestamptz;

alter table public.chapters
  add column if not exists is_deleted boolean default false,
  add column if not exists deleted_at timestamptz,
  add column if not exists updated_at timestamptz default now();

alter table public.comments
  add column if not exists is_deleted boolean default false,
  add column if not exists deleted_at timestamptz;

-- 4) Columnas y CHECKS
-- Language en series (si no existe, se agrega con check)
do $$
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'series' and column_name = 'language'
  ) then
    alter table public.series add column language text default 'es';
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'series_language_check'
  ) then
    alter table public.series add constraint series_language_check
      check (language in ('es','en','jp','kr'));
  end if;
end$$;

-- chapters.chapter_number > 0
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'chapters_chapter_number_positive'
  ) then
    alter table public.chapters add constraint chapters_chapter_number_positive
      check (chapter_number > 0);
  end if;
end$$;

-- pages.page_number > 0
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'pages_page_number_positive'
  ) then
    alter table public.pages add constraint pages_page_number_positive
      check (page_number > 0);
  end if;
end$$;

-- 5) updated_at columns where missing
alter table public.pages
  add column if not exists updated_at timestamptz default now();

alter table public.uploads
  alter column updated_at set default now();

alter table public.comments
  alter column updated_at set default now();

alter table public.reports
  alter column updated_at set default now();

-- 6) Triggers updated_at (using existing update_updated_at_column)
do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'update_chapters_modtime'
  ) then
    create trigger update_chapters_modtime
      before update on public.chapters
      for each row execute procedure public.update_updated_at_column();
  end if;

  if not exists (
    select 1 from pg_trigger where tgname = 'update_pages_modtime'
  ) then
    create trigger update_pages_modtime
      before update on public.pages
      for each row execute procedure public.update_updated_at_column();
  end if;

  if not exists (
    select 1 from pg_trigger where tgname = 'update_uploads_modtime'
  ) then
    create trigger update_uploads_modtime
      before update on public.uploads
      for each row execute procedure public.update_updated_at_column();
  end if;

  if not exists (
    select 1 from pg_trigger where tgname = 'update_comments_modtime'
  ) then
    create trigger update_comments_modtime
      before update on public.comments
      for each row execute procedure public.update_updated_at_column();
  end if;

  if not exists (
    select 1 from pg_trigger where tgname = 'update_reports_modtime'
  ) then
    create trigger update_reports_modtime
      before update on public.reports
      for each row execute procedure public.update_updated_at_column();
  end if;
end$$;
