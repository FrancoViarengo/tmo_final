-- =============================================================================
-- MIGRACIÓN 0007: RLS REFINADO
-- =============================================================================

-- Helper: asegurar RLS en nuevas tablas
alter table if exists public.notifications enable row level security;
alter table if exists public.recommendation_cache enable row level security;
alter table if exists public.reactions enable row level security;

-- 1) SERIES / CHAPTERS / PAGES
-- Drop políticas previas de visibilidad amplia para reemplazarlas con is_deleted
drop policy if exists "Series visibles para todos" on public.series;
drop policy if exists "Capítulos visibles para todos" on public.chapters;
drop policy if exists "Páginas visibles para todos" on public.pages;

-- SERIES
create policy "series_select_public_active"
  on public.series
  for select
  using (not coalesce(is_deleted, false));

-- Insert: staff (uploader/editor/admin/superadmin)
drop policy if exists "Solo staff crea series" on public.series;
create policy "series_insert_staff"
  on public.series
  for insert
  with check (public.authorize('uploader_access'));

-- Update: creador o admin
create policy "series_update_owner_or_admin"
  on public.series
  for update
  using (
    (created_by = auth.uid() and public.authorize('uploader_access'))
    or public.authorize('admin_access')
  );

-- Delete: admin / superadmin (soft delete recomendado vía UPDATE)
create policy "series_delete_admin"
  on public.series
  for delete
  using (public.authorize('admin_access'));

-- CHAPTERS
create policy "chapters_select_public_active"
  on public.chapters
  for select
  using (not coalesce(is_deleted, false));

drop policy if exists "Solo staff sube capítulos" on public.chapters;
create policy "chapters_insert_staff"
  on public.chapters
  for insert
  with check (public.authorize('uploader_access'));

create policy "chapters_update_owner_group_or_admin"
  on public.chapters
  for update
  using (
    public.authorize('admin_access')
    or uploader_id = auth.uid()
    or exists (
      select 1
      from public.group_members gm
      where gm.group_id = chapters.group_id and gm.user_id = auth.uid()
    )
    or exists (
      select 1
      from public.scanlation_groups sg
      where sg.id = chapters.group_id and sg.owner_id = auth.uid()
    )
  );

create policy "chapters_delete_admin"
  on public.chapters
  for delete
  using (public.authorize('admin_access'));

-- PAGES
drop policy if exists "Solo staff gestiona páginas" on public.pages;

create policy "pages_select_public"
  on public.pages
  for select
  using (true);

create policy "pages_insert_staff_owner_group"
  on public.pages
  for insert
  with check (
    public.authorize('uploader_access')
    and exists (
      select 1
      from public.chapters c
      where c.id = pages.chapter_id
        and (
          c.uploader_id = auth.uid()
          or exists (
            select 1 from public.group_members gm
            where gm.group_id = c.group_id and gm.user_id = auth.uid()
          )
          or exists (
            select 1 from public.scanlation_groups sg
            where sg.id = c.group_id and sg.owner_id = auth.uid()
          )
          or public.authorize('admin_access')
        )
    )
  );

create policy "pages_update_staff_owner_group"
  on public.pages
  for update
  using (
    public.authorize('admin_access')
    or exists (
      select 1
      from public.chapters c
      where c.id = pages.chapter_id
        and (
          c.uploader_id = auth.uid()
          or exists (
            select 1 from public.group_members gm
            where gm.group_id = c.group_id and gm.user_id = auth.uid()
          )
          or exists (
            select 1 from public.scanlation_groups sg
            where sg.id = c.group_id and sg.owner_id = auth.uid()
          )
        )
    )
  );

create policy "pages_delete_admin"
  on public.pages
  for delete
  using (public.authorize('admin_access'));

-- 2) GROUPS / MEMBERS
-- Mantener visibilidad de grupos para todos
-- Policies existentes siguen válidas; agregamos select members for admins
create policy "group_members_select_admin"
  on public.group_members
  for select
  using (public.authorize('admin_access'));

-- 3) LIBRARY / HISTORY / LIKES
drop policy if exists "Usuario ve su historial" on public.reading_history;
drop policy if exists "Usuario gestiona su historial" on public.reading_history;
create policy "reading_history_owner_all"
  on public.reading_history
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Usuario gestiona sus likes" on public.comment_likes;
create policy "comment_likes_owner_all"
  on public.comment_likes
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Usuario gestiona sus likes" on public.bookmarks;
create policy "bookmarks_owner_all"
  on public.bookmarks
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 4) COMMENTS
create policy "comments_select_public_active"
  on public.comments
  for select
  using (not coalesce(is_deleted, false));

create policy "comments_owner_all"
  on public.comments
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "comments_admin_all"
  on public.comments
  for all
  using (public.authorize('admin_access'));

-- 5) REPORTS
drop policy if exists "Reporter ve sus reportes" on public.reports;
drop policy if exists "Usuario crea reportes" on public.reports;
drop policy if exists "Admin ve y gestiona reportes" on public.reports;

create policy "reports_owner_select"
  on public.reports
  for select
  using (auth.uid() = reporter_id);

create policy "reports_owner_insert"
  on public.reports
  for insert
  with check (auth.uid() = reporter_id);

create policy "reports_admin_all"
  on public.reports
  for all
  using (public.authorize('admin_access'));

-- 6) AUDIT LOGS / SYSTEM SETTINGS
drop policy if exists "Admin lee logs" on public.audit_logs;
create policy "audit_logs_admin_read"
  on public.audit_logs
  for select
  using (public.authorize('admin_access'));

drop policy if exists "Configuración pública" on public.system_settings;
drop policy if exists "Superadmin modifica configuración" on public.system_settings;

create policy "system_settings_admin_read"
  on public.system_settings
  for select
  using (public.authorize('admin_access'));

create policy "system_settings_admin_write"
  on public.system_settings
  for all
  using (public.authorize('admin_access'));

-- 7) UPLOADS
drop policy if exists "Uploader ve sus uploads" on public.uploads;
drop policy if exists "Admin ve todos los uploads" on public.uploads;
drop policy if exists "Uploader registra upload" on public.uploads;
drop policy if exists "Admin actualiza uploads" on public.uploads;

create policy "uploads_owner_select"
  on public.uploads
  for select
  using (auth.uid() = uploader_id);

create policy "uploads_owner_insert"
  on public.uploads
  for insert
  with check (auth.uid() = uploader_id and public.authorize('uploader_access'));

create policy "uploads_admin_all"
  on public.uploads
  for all
  using (public.authorize('admin_access'));

-- 8) NOTIFICATIONS
create policy "notifications_owner_all"
  on public.notifications
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 9) RECOMMENDATION CACHE
create policy "recommendation_cache_owner_select"
  on public.recommendation_cache
  for select
  using (auth.uid() = user_id);

create policy "recommendation_cache_admin_all"
  on public.recommendation_cache
  for all
  using (public.authorize('admin_access'));

-- 10) REACTIONS
create policy "reactions_owner_all"
  on public.reactions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 11) PROFILES
drop policy if exists "Perfiles públicos" on public.profiles;
drop policy if exists "Usuario edita su perfil" on public.profiles;
drop policy if exists "profiles_select_public" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

create policy "profiles_select_public"
  on public.profiles
  for select
  using (true);

create policy "profiles_update_self_no_role_change"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select role from public.profiles p where p.id = auth.uid())
  );

-- Admin override on profiles
create policy "profiles_admin_all"
  on public.profiles
  for all
  using (public.authorize('admin_access'));
