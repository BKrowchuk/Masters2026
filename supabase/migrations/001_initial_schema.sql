-- Masters Pool 2026 — initial schema
-- Run this in your Supabase SQL editor

-- ============================================================
-- 1. Profiles — one row per auth user, stores the nickname
-- ============================================================
create table if not exists profiles (
  id         uuid references auth.users on delete cascade primary key,
  nickname   text unique not null,
  is_admin   boolean not null default false,
  created_at timestamptz not null default now()
);

-- Row-level security
alter table profiles enable row level security;

-- Anyone authenticated can read all profiles (needed for leaderboard nicknames)
create policy "profiles_select_authenticated"
  on profiles for select
  using (auth.role() = 'authenticated');

-- Users can only update their own profile
create policy "profiles_update_own"
  on profiles for update
  using (auth.uid() = id);

-- Only service role (admin API) can insert profiles
create policy "profiles_insert_service_role"
  on profiles for insert
  with check (auth.role() = 'service_role');


-- ============================================================
-- 2. Picks — one row per user per year
-- ============================================================
create table if not exists picks (
  id         uuid not null default gen_random_uuid() primary key,
  user_id    uuid references profiles (id) on delete cascade not null,
  year       integer not null default 2026,
  selections jsonb  not null default '{}'::jsonb,
                     -- e.g. {"1": "Scottie Scheffler", "2": "Jon Rahm", ...}
  updated_at timestamptz not null default now(),
  unique (user_id, year)
);

-- Row-level security
alter table picks enable row level security;

-- Anyone authenticated can read all picks (visible on leaderboard)
create policy "picks_select_authenticated"
  on picks for select
  using (auth.role() = 'authenticated');

-- Users can only insert/update their own picks
create policy "picks_insert_own"
  on picks for insert
  with check (auth.uid() = user_id);

create policy "picks_update_own"
  on picks for update
  using (auth.uid() = user_id);


-- ============================================================
-- 3. Auto-create profile on new auth user (optional trigger)
--    Useful if you create users via Supabase dashboard directly.
--    The nickname will default to the part before '@' in the email.
-- ============================================================
create or replace function handle_new_auth_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into profiles (id, nickname)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'nickname',
      split_part(new.email, '@', 1)
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_auth_user();
