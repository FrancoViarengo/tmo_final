-- =============================================================================
-- MIGRACIÓN 0005: BUCKETS DE STORAGE Y POLICIES
-- =============================================================================

-- Helper de autorización (se requiere en policies de storage)
create or replace function public.authorize(requested_permission text)
returns boolean
language plpgsql
security definer
stable
as $$
declare
  user_role public.app_role;
begin
  select role into user_role from public.profiles where id = auth.uid();

  if requested_permission = 'admin_access' then
    return user_role in ('admin', 'superadmin');
  elsif requested_permission = 'superadmin_access' then
    return user_role = 'superadmin';
  elsif requested_permission = 'uploader_access' then
    return user_role in ('uploader', 'editor', 'admin', 'superadmin');
  end if;

  return false;
end;
$$;

-- Asegurar RLS en storage.objects (solo si el rol actual es dueño, para evitar errores)
do $$
begin
  if exists (
    select 1 from pg_tables
    where schemaname = 'storage'
      and tablename = 'objects'
      and tableowner = current_user
  ) then
    execute 'alter table storage.objects enable row level security';
  end if;
end$$;

-- 1) Buckets (insert id = name)
insert into storage.buckets (id, name, public)
values 
  ('pages', 'pages', true),
  ('covers', 'covers', true),
  ('avatars', 'avatars', true),
  ('banners', 'banners', true)
on conflict (id) do nothing;

-- 2) Policies por bucket

-- PAGES
do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'pages_objects_public_read') then
    create policy "pages_objects_public_read"
      on storage.objects
      for select
      using (bucket_id = 'pages');
  end if;

  if not exists (select 1 from pg_policies where policyname = 'pages_objects_write_staff') then
    create policy "pages_objects_write_staff"
      on storage.objects
      for insert
      with check (bucket_id = 'pages' and public.authorize('uploader_access'));
  end if;

  if not exists (select 1 from pg_policies where policyname = 'pages_objects_update_staff') then
    create policy "pages_objects_update_staff"
      on storage.objects
      for update
      using (bucket_id = 'pages' and public.authorize('uploader_access'));
  end if;
end$$;

-- COVERS
do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'covers_objects_public_read') then
    create policy "covers_objects_public_read"
      on storage.objects
      for select
      using (bucket_id = 'covers');
  end if;

  if not exists (select 1 from pg_policies where policyname = 'covers_objects_write_editor_admin') then
    create policy "covers_objects_write_editor_admin"
      on storage.objects
      for insert
      with check (bucket_id = 'covers' and public.authorize('uploader_access'));
  end if;

  if not exists (select 1 from pg_policies where policyname = 'covers_objects_update_editor_admin') then
    create policy "covers_objects_update_editor_admin"
      on storage.objects
      for update
      using (bucket_id = 'covers' and public.authorize('uploader_access'));
  end if;
end$$;

-- AVATARS
do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'avatars_objects_public_read') then
    create policy "avatars_objects_public_read"
      on storage.objects
      for select
      using (bucket_id = 'avatars');
  end if;

  if not exists (select 1 from pg_policies where policyname = 'avatars_objects_write_owner') then
    create policy "avatars_objects_write_owner"
      on storage.objects
      for insert
      with check (bucket_id = 'avatars' and owner = auth.uid());
  end if;

  if not exists (select 1 from pg_policies where policyname = 'avatars_objects_update_owner') then
    create policy "avatars_objects_update_owner"
      on storage.objects
      for update
      using (bucket_id = 'avatars' and owner = auth.uid());
  end if;
end$$;

-- BANNERS
do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'banners_objects_public_read') then
    create policy "banners_objects_public_read"
      on storage.objects
      for select
      using (bucket_id = 'banners');
  end if;

  if not exists (select 1 from pg_policies where policyname = 'banners_objects_write_admin') then
    create policy "banners_objects_write_admin"
      on storage.objects
      for insert
      with check (bucket_id = 'banners' and public.authorize('admin_access'));
  end if;

  if not exists (select 1 from pg_policies where policyname = 'banners_objects_update_admin') then
    create policy "banners_objects_update_admin"
      on storage.objects
      for update
      using (bucket_id = 'banners' and public.authorize('admin_access'));
  end if;
end$$;
