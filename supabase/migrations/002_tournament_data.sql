-- Masters Pool — tournament data tables
-- Stores the field of players and live leaderboard data per year

-- ============================================================
-- 1. Tournament field — one row per golfer per year
--    Contains the golfer's group assignment and live scoring data
-- ============================================================
create table if not exists tournament_players (
  id            uuid not null default gen_random_uuid() primary key,
  year          integer not null,
  player_name   text not null,
  "group"       integer not null,               -- pool group (1-15)
  group_position integer,                        -- rank within their group
  position      text,                            -- overall position (e.g. "1", "T5", "CUT", "WD")
  total         integer,                         -- total score to par (null if not started / WD)
  thru          text not null default '-',       -- holes completed: "F", "-", or "1"-"18"
  today         text,                            -- score to par for the current round
  r1            integer,                         -- round 1 score to par
  r2            integer,                         -- round 2 score to par
  r3            integer,                         -- round 3 score to par
  r4            integer,                         -- round 4 score to par
  strokes       integer,                         -- total strokes
  status        text not null default 'active',  -- 'active', 'cut', 'wd'
  updated_at    timestamptz not null default now(),
  unique (year, player_name)
);

-- Row-level security
alter table tournament_players enable row level security;

-- Anyone authenticated can read tournament data
drop policy if exists "tournament_players_select_authenticated" on tournament_players;
create policy "tournament_players_select_authenticated"
  on tournament_players for select
  using (auth.role() = 'authenticated');

-- Only service_role (API/scraper) can insert/update/delete
drop policy if exists "tournament_players_modify_service_role" on tournament_players;
create policy "tournament_players_modify_service_role"
  on tournament_players for all
  using (auth.role() = 'service_role');

-- ============================================================
-- 2. Past results — one row per year
-- ============================================================
create table if not exists past_results (
  id            uuid not null default gen_random_uuid() primary key,
  year          integer not null unique,
  champion      text not null,
  co_champion   text,
  runner_up     text,
  co_runner_up  text,
  second_place  text,
  third_place   text,
  comments      text,
  description   text
);

alter table past_results enable row level security;

-- Anyone authenticated can read past results
drop policy if exists "past_results_select_authenticated" on past_results;
create policy "past_results_select_authenticated"
  on past_results for select
  using (auth.role() = 'authenticated');

-- Only service_role can modify
drop policy if exists "past_results_modify_service_role" on past_results;
create policy "past_results_modify_service_role"
  on past_results for all
  using (auth.role() = 'service_role');

-- ============================================================
-- 3. Index for fast lookups by year
-- ============================================================
create index if not exists idx_tournament_players_year on tournament_players (year);
create index if not exists idx_tournament_players_year_group on tournament_players (year, "group");
