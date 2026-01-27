-- =============================================================================
-- MIGRACIÓN 0008: FUNCIONES HELPER DE ROLES Y OWNERSHIP
-- =============================================================================

-- Devuelve el perfil del usuario autenticado
create or replace function public.get_profile_for_auth_user()
returns public.profiles
language sql
security definer
stable
as $$
  select *
  from public.profiles
  where id = auth.uid();
$$;

-- Verifica rol requerido
create or replace function public.has_role(required_role text)
returns boolean
language plpgsql
security definer
stable
as $$
declare
  user_role public.app_role;
begin
  select role into user_role from public.profiles where id = auth.uid();
  if required_role = 'admin' then
    return user_role in ('admin','superadmin');
  elsif required_role = 'superadmin' then
    return user_role = 'superadmin';
  elsif required_role = 'uploader' then
    return user_role in ('uploader','editor','admin','superadmin');
  elsif required_role = 'editor' then
    return user_role in ('editor','admin','superadmin');
  end if;
  return false;
end;
$$;

-- Admin helper
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select role in ('admin','superadmin') from public.profiles where id = auth.uid();
$$;

-- Es dueño del grupo
create or replace function public.is_group_owner(profile_id uuid, group_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.scanlation_groups sg
    where sg.id = group_id and sg.owner_id = profile_id
  );
$$;

-- Es miembro del grupo
create or replace function public.is_group_member(profile_id uuid, group_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.group_members gm
    where gm.group_id = group_id and gm.user_id = profile_id
  );
$$;
