-- ════════════════════════════════════════════════════════════════════
--  One-time setup: your profile + the races and campaigns you described.
--
--  Run AFTER:
--   1. 0001_running_archive.sql
--   2. Creating your login in Supabase → Authentication → Users → Add user
--
--  Safe to run more than once: existing rows are left alone.
--  Contains NO running activities. You enter those yourself.
-- ════════════════════════════════════════════════════════════════════
do $$
declare
  uid          uuid;
  user_count   integer;
  nyc_race     uuid;
  sydney_race  uuid;
  nyc_campaign uuid;
begin
  select count(*) into user_count from auth.users;
  if user_count <> 1 then
    raise exception 'Expected exactly 1 user in Authentication → Users, found %. Create your admin login first (and only that one).', user_count;
  end if;
  select id into uid from auth.users limit 1;

  -- Your public profile. Handle "rose" is what the website looks up.
  insert into public.profiles (id, handle, display_name, is_public, role)
  values (uid, 'rose', 'Rose Weseley', true, 'admin')
  on conflict (id) do update set role = 'admin';

  -- ── Races ────────────────────────────────────────────────────────
  select id into nyc_race from public.races where user_id = uid and major = 'nyc' and race_year = 2026;
  if nyc_race is null then
    insert into public.races (user_id, name, major, race_year, race_date, city, status, official_time_s, time_is_placeholder)
    values (uid, 'TCS New York City Marathon', 'nyc', 2026, '2026-11-01', 'New York', 'completed',
            14280,  -- 3:58:00, approximate; update with your official time in the admin
            true)
    returning id into nyc_race;
  end if;

  select id into sydney_race from public.races where user_id = uid and major = 'sydney' and race_year = 2027;
  if sydney_race is null then
    insert into public.races (user_id, name, major, race_year, race_date, city, status)
    values (uid, 'Sydney Marathon', 'sydney', 2027, null, 'Sydney', 'planned')
    returning id into sydney_race;
  end if;

  -- ── Campaigns ────────────────────────────────────────────────────
  select id into nyc_campaign from public.campaigns where user_id = uid and race_id = nyc_race;
  if nyc_campaign is null then
    insert into public.campaigns (user_id, race_id, title, charity_name, charity_team, goal_cents,
                                  reported_raised_cents, raised_is_minimum, status, is_confirmed)
    values (uid, nyc_race, 'NYC Marathon 2026', 'Memorial Sloan Kettering Cancer Center', 'Fred''s Team',
            650000,   -- $6,500 goal
            716000,   -- $7,160 raised
            false, 'completed', true)
    returning id into nyc_campaign;

    -- Approximate breakdown (adds up to $7,160; editable in the admin).
    insert into public.contributions (user_id, campaign_id, amount_cents, category, label, is_approximate) values
      (uid, nyc_campaign, 216000, 'bake_sale',     'Homemade Argentine alfajor bake sales', true),
      (uid, nyc_campaign,  50000, 'social_media',  'Social media competition',              true),
      (uid, nyc_campaign,  50000, 'company_match', 'Company matching',                      true),
      (uid, nyc_campaign,  40000, 'personal',      'Personal contribution',                 true),
      (uid, nyc_campaign, 360000, 'donations',     'Other donations',                       true);
  end if;

  if not exists (select 1 from public.campaigns where user_id = uid and race_id = sydney_race) then
    insert into public.campaigns (user_id, race_id, title, goal_cents, reported_raised_cents, status, is_confirmed)
    values (uid, sydney_race, 'Sydney Marathon 2027', 500000, null, 'planned', false);
  end if;
end $$;
