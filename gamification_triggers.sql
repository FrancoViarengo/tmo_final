-- Gamification Triggers

-- 1. Helper function to award badge safely
create or replace function public.award_badge(target_user_id uuid, badge_name_check text)
returns void as $$
declare
  badge_record record;
begin
  -- Find badge by partial name match or exact name
  select * into badge_record from public.badges where name ilike '%' || badge_name_check || '%' limit 1;
  
  if found then
    insert into public.user_badges (user_id, badge_id)
    values (target_user_id, badge_record.id)
    on conflict (user_id, badge_id) do nothing;
  end if;
end;
$$ language plpgsql security definer;

-- 2. Reading History Trigger
create or replace function public.check_reading_milestones()
returns trigger as $$
declare
  chapter_count int;
begin
  select count(distinct chapter_id) into chapter_count
  from public.reading_history
  where user_id = new.user_id;

  if chapter_count >= 10 then
    perform public.award_badge(new.user_id, 'Novato'); -- Adjust name to match seed
  end if;
  
  if chapter_count >= 100 then
    perform public.award_badge(new.user_id, 'Avanzado'); -- Adjust name to match seed
  end if;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_reading_history_change on public.reading_history;
create trigger on_reading_history_change
  after insert or update on public.reading_history
  for each row execute procedure public.check_reading_milestones();

-- 3. Upload Trigger
create or replace function public.check_upload_milestones()
returns trigger as $$
declare
  upload_count int;
begin
  select count(*) into upload_count
  from public.chapters
  where uploader_id = new.uploader_id;

  if upload_count >= 1 then
    perform public.award_badge(new.uploader_id, 'Uploader');
  end if;

  if upload_count >= 10 then
    perform public.award_badge(new.uploader_id, 'Scanlator');
  end if;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_chapter_upload on public.chapters;
create trigger on_chapter_upload
  after insert on public.chapters
  for each row execute procedure public.check_upload_milestones();

-- 4. Comment Trigger
create or replace function public.check_comment_milestones()
returns trigger as $$
declare
  comment_count int;
begin
  select count(*) into comment_count
  from public.comments
  where user_id = new.user_id;

  if comment_count >= 5 then
    perform public.award_badge(new.user_id, 'Comentarista');
  end if;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_comment_created on public.comments;
create trigger on_comment_created
  after insert on public.comments
  for each row execute procedure public.check_comment_milestones();
