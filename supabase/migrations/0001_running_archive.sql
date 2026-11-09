-- ════════════════════════════════════════════════════════════════════
--  The Running Archive: initial schema
--
--  Security model (read this first):
--   • Every table that stores a person's data has a user_id.
--   • Row Level Security (RLS) is ON for every table. The only policies
--     let a logged-in user read/write THEIR OWN rows.
--   • Anonymous visitors cannot read any table directly.
--   • The public website reads through the public_* VIEWS at the bottom,
--     which expose only approved rows and safe columns (no notes, no
--     activity names, no start times). Views are the "public API".
--   • No GPS or route data is stored anywhere.
-- ════════════════════════════════════════════════════════════════════

-- Keep updated_at current on every UPDATE.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── profiles: one row per runner ─────────────────────────────────────
create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  handle        text not null unique check (handle ~ '^[a-z0-9-]{2,32}$'),
  display_name  text not null check (char_length(display_name) between 1 and 80),
  is_public     boolean not null default false,
  role          text not null default 'runner' check (role in ('runner', 'admin')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ── activities: one row per run (summary numbers only) ───────────────
create table public.activities (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.profiles (id) on delete cascade,
  -- Where the row came from. Manual entries have no source_id; Strava rows
  -- carry Strava's activity id so re-imports update instead of duplicating.
  source            text not null default 'manual'
                      check (source in ('manual', 'strava_export', 'strava_api')),
  source_id         text check (source_id is null or char_length(source_id) <= 64),
  local_date        date not null,
  start_time        time,                       -- private: never exposed publicly
  sport_type        text not null default 'run'
                      check (sport_type in ('run', 'trail_run', 'treadmill', 'race', 'walk', 'hike', 'other')),
  name              text check (char_length(name) <= 120),   -- private
  notes             text check (char_length(notes) <= 4000), -- private
  distance_m        numeric(9, 1) not null check (distance_m > 0 and distance_m < 400000),
  moving_s          integer not null check (moving_s > 0 and moving_s < 172800),
  elapsed_s         integer check (elapsed_s is null or elapsed_s >= moving_s),
  elevation_gain_m  numeric(7, 1) check (elevation_gain_m is null or elevation_gain_m >= 0),
  visibility        text not null default 'public' check (visibility in ('public', 'private')),
  -- When a manual run and an imported Strava run are the same run, the manual
  -- one points at the imported one here and is excluded from all stats.
  duplicate_of      uuid references public.activities (id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint manual_has_no_source_id check (source <> 'manual' or source_id is null),
  constraint imported_has_source_id  check (source = 'manual' or source_id is not null)
);
create unique index activities_source_unique
  on public.activities (user_id, source, source_id) where source_id is not null;
create index activities_user_date on public.activities (user_id, local_date);

-- ── races: marathons and other races ─────────────────────────────────
create table public.races (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references public.profiles (id) on delete cascade,
  name                 text not null check (char_length(name) between 1 and 120),
  major                text check (major in ('tokyo', 'boston', 'london', 'sydney', 'berlin', 'chicago', 'nyc')),
  race_year            integer not null check (race_year between 1950 and 2100),
  race_date            date,                    -- null until the date is known
  city                 text check (char_length(city) <= 80),
  distance_m           numeric(9, 1) not null default 42195 check (distance_m > 0),
  status               text not null default 'planned'
                         check (status in ('planned', 'registered', 'completed', 'dns', 'dnf')),
  official_time_s      integer check (official_time_s is null or official_time_s > 0),
  time_is_placeholder  boolean not null default false,
  goal_time_s          integer check (goal_time_s is null or goal_time_s > 0),
  story                text check (char_length(story) <= 20000),
  is_public            boolean not null default true,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  constraint race_date_matches_year check (race_date is null or extract(year from race_date) = race_year)
);
create index races_user on public.races (user_id, race_year);

-- ── campaigns: fundraising campaigns ─────────────────────────────────
create table public.campaigns (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null references public.profiles (id) on delete cascade,
  race_id                uuid references public.races (id) on delete set null,
  title                  text not null check (char_length(title) between 1 and 120),
  charity_name           text check (char_length(charity_name) <= 160),
  charity_team           text check (char_length(charity_team) <= 120),
  donation_url           text check (donation_url is null or donation_url ~ '^https://'),
  -- Money is stored in whole cents to avoid floating-point rounding errors.
  goal_cents             bigint not null check (goal_cents >= 0),
  -- Optional headline total you report (e.g. "over $7,000"). When null, the
  -- total is the sum of contributions.
  reported_raised_cents  bigint check (reported_raised_cents is null or reported_raised_cents >= 0),
  raised_is_minimum      boolean not null default false,
  status                 text not null default 'planned' check (status in ('planned', 'active', 'completed')),
  is_confirmed           boolean not null default true,
  story                  text check (char_length(story) <= 20000),
  is_public              boolean not null default true,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);
create index campaigns_user on public.campaigns (user_id);

-- ── contributions: where fundraising money came from ─────────────────
create table public.contributions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles (id) on delete cascade,
  campaign_id     uuid not null references public.campaigns (id) on delete cascade,
  amount_cents    bigint not null check (amount_cents > 0),
  occurred_on     date,
  category        text not null default 'other'
                    check (category in ('bake_sale', 'social_media', 'company_match', 'personal', 'donations', 'event', 'other')),
  label           text check (char_length(label) <= 120),   -- public, e.g. "Alfajor bake sales"
  note            text check (char_length(note) <= 2000),   -- private (could name donors)
  is_approximate  boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index contributions_campaign on public.contributions (campaign_id);

-- updated_at triggers
create trigger profiles_touch      before update on public.profiles      for each row execute function public.touch_updated_at();
create trigger activities_touch    before update on public.activities    for each row execute function public.touch_updated_at();
create trigger races_touch         before update on public.races         for each row execute function public.touch_updated_at();
create trigger campaigns_touch     before update on public.campaigns     for each row execute function public.touch_updated_at();
create trigger contributions_touch before update on public.contributions for each row execute function public.touch_updated_at();

-- ════════════════════════════════════════════════════════════════════
--  Row Level Security: owners only
-- ════════════════════════════════════════════════════════════════════
alter table public.profiles      enable row level security;
alter table public.activities    enable row level security;
alter table public.races         enable row level security;
alter table public.campaigns     enable row level security;
alter table public.contributions enable row level security;

-- Anonymous visitors get nothing from the base tables.
revoke all on public.profiles, public.activities, public.races, public.campaigns, public.contributions from anon;

-- Profiles: you can read and update your own profile (role changes are blocked below).
create policy "own profile: read"   on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy "own profile: update" on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
-- Nobody can promote themselves to admin through the API: logged-in users may
-- only update these specific columns (role is not among them).
revoke update on public.profiles from authenticated;
grant update (handle, display_name, is_public) on public.profiles to authenticated;
-- Profiles are created by the setup script (seed.sql), not through the API.
revoke insert, delete on public.profiles from authenticated;

-- Activities, races, campaigns, contributions: full CRUD on your own rows only.
create policy "own activities" on public.activities for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "own races" on public.races for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "own campaigns" on public.campaigns for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
-- A contribution must belong to you AND point at one of your campaigns.
create policy "own contributions" on public.contributions for all to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.campaigns c where c.id = campaign_id and c.user_id = (select auth.uid()))
  );

-- ════════════════════════════════════════════════════════════════════
--  Public views: the only data anonymous visitors can read
--  (Views run with the owner's rights, so they can read past RLS. That's why
--   each one filters to public profiles + public rows and lists columns
--   explicitly. Adding a column to a table never leaks it automatically.)
-- ════════════════════════════════════════════════════════════════════
create view public.public_profiles as
  select p.id, p.handle, p.display_name
  from public.profiles p
  where p.is_public;

create view public.public_activities as
  select a.id, p.handle, a.local_date, a.sport_type, a.distance_m, a.moving_s, a.elapsed_s, a.elevation_gain_m
  from public.activities a
  join public.profiles p on p.id = a.user_id
  where p.is_public and a.visibility = 'public' and a.duplicate_of is null;

create view public.public_races as
  select r.id, p.handle, r.name, r.major, r.race_year, r.race_date, r.city, r.distance_m, r.status,
         r.official_time_s, r.time_is_placeholder, r.goal_time_s, r.story
  from public.races r
  join public.profiles p on p.id = r.user_id
  where p.is_public and r.is_public;

create view public.public_campaigns as
  select c.id, p.handle, c.race_id, c.title, c.charity_name, c.charity_team, c.donation_url, c.goal_cents,
         c.reported_raised_cents, c.raised_is_minimum, c.status, c.is_confirmed, c.story, c.created_at
  from public.campaigns c
  join public.profiles p on p.id = c.user_id
  where p.is_public and c.is_public;

create view public.public_contributions as
  select co.id, co.campaign_id, co.amount_cents, co.occurred_on, co.category, co.label, co.is_approximate
  from public.contributions co
  join public.campaigns c on c.id = co.campaign_id and c.is_public
  join public.profiles p on p.id = co.user_id and p.is_public;

grant select on public.public_profiles, public.public_activities, public.public_races,
                public.public_campaigns, public.public_contributions to anon, authenticated;
