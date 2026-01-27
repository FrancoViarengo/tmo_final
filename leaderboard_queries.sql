-- Leaderboard Views

-- 1. Top Readers
create or replace view public.view_top_readers as
select 
  rh.user_id,
  p.username,
  p.reputation,
  au.raw_user_meta_data->>'avatar_url' as avatar_url,
  count(distinct rh.chapter_id) as read_count
from public.reading_history rh
join public.profiles p on rh.user_id = p.id
join auth.users au on rh.user_id = au.id
group by rh.user_id, p.username, p.reputation, au.raw_user_meta_data
order by read_count desc, p.reputation desc;

-- 2. Top Uploaders
create or replace view public.view_top_uploaders as
select 
  c.uploader_id as user_id,
  p.username,
  p.reputation,
  au.raw_user_meta_data->>'avatar_url' as avatar_url,
  count(c.id) as upload_count
from public.chapters c
join public.profiles p on c.uploader_id = p.id
join auth.users au on c.uploader_id = au.id
group by c.uploader_id, p.username, p.reputation, au.raw_user_meta_data
order by upload_count desc, p.reputation desc;

-- 3. Top Commenters
create or replace view public.view_top_commenters as
select 
  cm.user_id,
  p.username,
  p.reputation,
  au.raw_user_meta_data->>'avatar_url' as avatar_url,
  count(cm.id) as comment_count
from public.comments cm
join public.profiles p on cm.user_id = p.id
join auth.users au on cm.user_id = au.id
where cm.is_deleted = false
group by cm.user_id, p.username, p.reputation, au.raw_user_meta_data
order by comment_count desc, p.reputation desc;
