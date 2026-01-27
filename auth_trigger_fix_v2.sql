-- Enhanced Trigger: Handles missing metadata AND duplicate usernames cleanly

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  username_val text;
  base_username text;
  new_username text;
  counter int := 0;
begin
  -- 1. Determine base username from metadata or email
  username_val := new.raw_user_meta_data ->> 'username';
  
  if username_val is null then
    username_val := new.raw_user_meta_data ->> 'name';
  end if;
  
  if username_val is null then
    username_val := split_part(new.email, '@', 1);
  end if;

  -- Remove spaces and sanitize (optional but good practice)
  base_username := lower(regexp_replace(username_val, '\s+', '', 'g'));
  new_username := base_username;

  -- 2. Check for uniqueness loops
  -- If usage of simple loop is risky, we can just append random number immediately if conflict.
  -- Simpler approach: Try basic. If exists, append random string.
  
  if exists (select 1 from public.profiles where username = new_username) then
    -- Append 4 random digits
    new_username := base_username || cast(floor(random() * 9000 + 1000) as text);
  end if;

  -- 3. Insert
  insert into public.profiles (id, username, email, role, reputation, created_at)
  values (
    new.id,
    new_username,
    new.email,
    'user',
    0,
    now()
  );

  return new;
end;
$$;
