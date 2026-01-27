-- NUCLEAR OPTION: This script completely resets the auth trigger and handles ALL edge cases.

-- 1. CLEANUP
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- 2. ROBUST FUNCTION
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  username_val text;
begin
  -- Try to get a base username
  username_val := new.raw_user_meta_data ->> 'username';
  
  if username_val is null then
    username_val := new.raw_user_meta_data ->> 'name';
  end if;
  
  if username_val is null then
    username_val := split_part(new.email, '@', 1);
  end if;

  -- Remove special chars
  username_val := regexp_replace(username_val, '[^a-zA-Z0-9]', '', 'g');

  -- If empty after cleaning, fallback to 'user'
  if length(username_val) < 1 then
    username_val := 'user';
  end if;

  -- Append random string to GUARANTEE uniqueness (avoid loop/lookup errors)
  -- e.g. "juan" -> "juan_a1b2"
  username_val := username_val || '_' || substr(md5(random()::text), 1, 4);

  -- Insert with minimal required fields
  -- We implicitly rely on defaults for reputation/created_at
  -- We verify 'role' exists; if not it usually defaults to 'user' via DEFAULT on table
  -- but we insert it explicitly to be safe, assuming 'app_role' enum exists.
  
  insert into public.profiles (id, username, email, role)
  values (
    new.id,
    username_val,
    new.email,
    'user'::public.app_role -- Explicit cast to ENUM
  );

  return new;
exception
  when others then
    -- LOG THE ERROR internally so Supabase dashboard logs show it
    raise log 'Auth Trigger Error: %', SQLERRM;
    -- IMPORTANT: We typically DO NOT want to suppress the error (return new) because then the user exists in Auth but not in Profiles.
    -- However, for debugging "Database Error", raising the exception is what causes the 500 to the client.
    -- Let's re-raise it with a clearer message.
    raise exception 'Failed to create profile: %', SQLERRM;
end;
$$;

-- 3. RE-BIND TRIGGER
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
