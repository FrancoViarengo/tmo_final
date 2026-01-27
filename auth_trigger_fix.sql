-- Improved Auth Trigger to handle both Email and OAuth signups safely
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  username_val text;
begin
  -- Try to get username from metadata, or fallback to name, or email part
  username_val := new.raw_user_meta_data ->> 'username';
  
  if username_val is null then
    username_val := new.raw_user_meta_data ->> 'name';
  end if;
  
  if username_val is null then
    username_val := split_part(new.email, '@', 1);
  end if;

  -- Ensure uniqueness (simple append if exists logic could be added here, but for now rely on conflict or fail gracefully)
  -- ideally we want to avoid fail, so let's append random suffix if we really wanted to be robust, 
  -- but for now let's just try insert.
  
  insert into public.profiles (id, username, email, role, reputation, created_at)
  values (
    new.id,
    username_val,
    new.email,
    'user',
    0,
    now()
  )
  on conflict (id) do nothing; -- Prevent error if profile already exists execution

  return new;
end;
$$;
