-- Add uploader_id to chapters table if it doesn't exist
do $$
begin
    if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'chapters' and column_name = 'uploader_id') then
        alter table public.chapters add column uploader_id uuid references auth.users(id);
    end if;
end $$;

-- Update RLS policy to allow users to insert their own ID as uploader_id
-- (Assuming existing policies might need adjustment, or we rely on backend/trigger)
-- Ideally, set default to auth.uid() or use a trigger to force it.

create or replace function public.set_uploader_id()
returns trigger as $$
begin
  if new.uploader_id is null then
    new.uploader_id := auth.uid();
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_chapter_insert_set_uploader on public.chapters;
create trigger on_chapter_insert_set_uploader
  before insert on public.chapters
  for each row execute procedure public.set_uploader_id();
