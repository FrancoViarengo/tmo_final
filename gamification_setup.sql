-- 1. Create Badges Table
create table if not exists public.badges (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  icon_url text,
  criteria_type text, -- e.g. 'read_count', 'comment_count'
  criteria_value int, -- e.g. 100
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create User Badges Table (Relationship)
create table if not exists public.user_badges (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  badge_id uuid references public.badges(id) on delete cascade not null,
  awarded_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, badge_id)
);

-- 3. Enable RLS
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;

-- 4. Policies
-- Everyone can read badges
create policy "Public badges are viewable by everyone." on public.badges for select using (true);
create policy "User badges are viewable by everyone." on public.user_badges for select using (true);

-- Only service_role (backend) can insert/update badges
-- (Implicitly denied for anon/authenticated unless we add policy, default is deny for writes)

-- 5. Seed Initial Badges
insert into public.badges (name, description, icon_url, criteria_type, criteria_value) values
('Lector Novato', 'Leíste tu primer capítulo.', 'https://img.icons8.com/color/96/book.png', 'read_count', 1),
('Ratón de Biblioteca', 'Leíste 10 capítulos.', 'https://img.icons8.com/color/96/library.png', 'read_count', 10),
('Super Fan', 'Leíste 100 capítulos.', 'https://img.icons8.com/color/96/comics-magazine.png', 'read_count', 100),
('Comentarista', 'Dejaste tu primer comentario.', 'https://img.icons8.com/color/96/comments.png', 'comment_count', 1);
