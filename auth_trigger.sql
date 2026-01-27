-- Trigger to automatically create a public.profiles entry when a new user signs up via Supabase Auth

-- 1. Create the Function
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, email, role, reputation, created_at)
  values (
    new.id,
    new.raw_user_meta_data ->> 'username', -- Extract username from metadata (sent by Register page)
    new.email,
    'user', -- Default role
    0,      -- Default reputation
    now()
  );
  return new;
end;
$$;

-- 2. Create the Trigger
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. Backfill (Optional: Run this if you have existing users without profiles)
-- insert into public.profiles (id, email, role, reputation)
-- select id, email, 'user', 0 from auth.users
-- where id not in (select id from public.profiles);
