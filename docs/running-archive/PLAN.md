# The Running Archive: Architecture & Build Plan

A running analytics, marathon, and fundraising app that lives at `/running` inside
the portfolio today and can move to its own domain later. This document explains
**what we're building, how the pieces fit together, and why**, in plain English.

---

## 1. Where we're starting

The portfolio is a **Next.js 16** app (App Router, React 19, TypeScript, Tailwind v4).
Today every page is static: content lives in typed files in `src/content/`, and
Next.js turns the pages into plain HTML at build time. There is **no database, no
login, and no server code yet**.

That's a great foundation, but the Running Archive needs three things the
portfolio doesn't have:

| Need | Why | What adds it |
| --- | --- | --- |
| **Persistent data** | You want to edit fundraising and races from an admin page and see the site update without touching code | A hosted Postgres database |
| **Login** | The admin page must be private | An auth service |
| **File storage** | Race photos | An object store (like a folder in the cloud) |

---

## 2. The big picture

```
                         ┌───────────────────────── Browser ─────────────────────────┐
                         │  /running (public)            /running/admin (you only)   │
                         │  charts, map, campaigns       forms, uploads, imports     │
                         └──────────────┬──────────────────────────┬─────────────────┘
                                        │ HTML (mostly cached)      │ form submits
                         ┌──────────────▼──────────────────────────▼─────────────────┐
  Next.js on Vercel      │  Server Components ── read data     Server Actions ── write│
  (frontend + backend)   │            │                              │  validate (zod)│
                         │            └──────────┬───────────────────┘  check login   │
                         │                       ▼                                    │
                         │        running/server: repositories (all DB access)         │
                         │                       │                                    │
                         │        running/domain: pure calculations (tested)           │
                         └───────────────────────┼────────────────────────────────────┘
                                                 ▼
                         ┌─────────────── Supabase (managed) ─────────────────────────┐
                         │  Postgres (+ Row Level Security)   Auth   Storage (photos) │
                         └────────────────────────────────────────────────────────────┘

  Local only, never deployed:  private-strava-imports/activities.csv
                               └─► import script ─► parser ─► validated rows ─► Postgres
```

**Plain-English version:** the browser asks Next.js for a page. Next.js (running on
Vercel's servers) fetches the data it needs from the database, does the math, and
sends back finished HTML. When you save something in the admin, a *Server Action*
(a function that runs on the server, triggered by a form) checks you're logged in,
validates the input, writes to the database, and tells Next.js to refresh the
cached public pages. The browser never talks to the database directly and never
sees a secret key.

---

## 3. Code layout: keeping it modular

Everything for the running app lives in **one feature folder**, so it can later be
lifted into its own app without untangling it from the portfolio:

```
src/
  app/running/                 ← routes only: thin pages that call into the feature
    page.tsx                     /running (overview)
    miles/  majors/  impact/     the three sections
    admin/                       private dashboard (Phase 3)
  running/                     ← the feature module (portable)
    domain/                    ← pure TypeScript: types + calculations. No React, no DB.
      units.ts                   meters↔miles, seconds↔"3:58:12", pace math
      stats.ts                   totals, streaks, weekly/monthly/yearly buckets
      records.ts                 longest runs, fastest efforts, milestones
      fundraising.ts             progress %, remaining, breakdown shares
      *.test.ts                  unit tests live next to the code they test
    import/                    ← data processing
      strava-csv.ts              parses Strava's activities.csv → validated rows
      dedupe.ts                  decides insert vs. update vs. skip
      *.test.ts
    server/                    ← the ONLY code allowed to touch the database
      db.ts                      creates the Supabase client (server-only)
      activities.ts races.ts campaigns.ts   "repositories": typed read/write functions
      auth.ts                    who is logged in, are they an admin
    components/                ← React UI for the feature
      charts/  map/  campaign/  ...
supabase/
  migrations/                  ← the database schema, versioned as SQL files in git
scripts/
  import-strava.ts             ← CLI you run locally to import your export
```

**Why this split matters (interview answer):** the *domain* layer is pure functions,
so it's trivial to test and reuse anywhere. The *server* layer is the single gate
to the database, so security rules and queries live in one place. The *app/* routes
stay thin. If the Running Archive moves to `runningarchive.com`, `src/running/` and
`supabase/` move with it; only the route files get re-created.

---

## 4. Infrastructure choice

### Recommendation: **Supabase** (free tier)

Supabase bundles **Postgres + Auth + Storage** behind one dashboard and works
smoothly with Next.js on Vercel.

| Option | Pros | Cons |
| --- | --- | --- |
| **Supabase** ✅ | Real Postgres (valuable SQL skills); built-in auth; photo storage; **Row Level Security** makes multi-user separation a database rule, not just app code; generous free tier | Free projects **pause after ~7 days with no database activity** (fixable, see below); one more vendor |
| Neon Postgres + Auth.js + Vercel Blob | Postgres too; Neon free tier doesn't pause the same way | Three services to wire together; more auth code to write and secure yourself |
| Firebase | Easy auth + storage | NoSQL (no SQL joins/aggregations, which this app is full of); less transferable for analytics |
| Files in the repo (no DB) | Free, simple | You'd have to edit code and push to change anything. You explicitly don't want that |

**Free tier limits (Supabase):** 500 MB database, 1 GB file storage, 50,000 monthly
users, 2 free projects. Your data (thousands of runs, a few dozen photos) fits easily.
**Cost: $0.** The paid plan ($25/month) is only needed if the app outgrows that.

**The pause problem and the fix:**
1. Public pages are **cached** by Next.js, so visitors are served saved HTML and
   don't hit the database on every view.
2. A free **Vercel Cron Job** pings the database once a day so the project never
   counts as inactive.

### Other new tools (all free, open-source npm packages)

| Package | Job |
| --- | --- |
| `zod` | Validates every input (CSV rows, admin forms) with clear error messages |
| `papaparse` | Robust CSV parsing (Strava's CSV has quoted, multi-line descriptions) |
| `d3-scale`, `d3-shape`, `d3-array`, `d3-geo`, `topojson-client`, `world-atlas` | Math for custom SVG charts and the world map; we draw the visuals ourselves in React for full design control |
| `vitest` | Fast unit tests |
| `@supabase/supabase-js`, `@supabase/ssr` | Talking to Supabase from the server, with login cookies (Phase 2+) |

---

## 5. Data model (multi-user from day one)

Every table that holds a person's data has a `user_id`. Today there's one user (you);
later, other runners get their own rows, and **Row Level Security (RLS)** policies,
rules enforced *inside* Postgres, guarantee nobody can read or edit someone else's
private data, even if the app code had a bug.

```
profiles            one row per runner
  id (= auth user id)  handle ("rose")  display_name  is_public  role ('admin'|'runner')

activities          one row per run (no GPS, ever)
  id  user_id  source ('strava_export'|'strava_api'|'manual')  source_id
  start_at (UTC)  local_date  timezone  sport_type  name
  distance_m  moving_s  elapsed_s  elevation_gain_m
  visibility ('private'|'public')            ← you approve what's shown
  UNIQUE (user_id, source, source_id)        ← makes re-imports safe (no duplicates)

import_batches      audit log of each import
  id  user_id  filename  rows_read  inserted  updated  skipped  errors(json)  created_at

races               marathons and other races
  id  user_id  name  major ('nyc'|'boston'|'chicago'|'berlin'|'london'|'tokyo'|'sydney'|null)
  race_date  status ('planned'|'registered'|'completed')  official_time_s  time_is_placeholder
  story (markdown)  activity_id (optional link to the run)

race_photos         id  race_id  user_id  storage_path  caption  sort_order

campaigns           fundraising campaigns
  id  user_id  race_id  title  charity_name  charity_team  donation_url
  goal_cents  reported_raised_cents  raised_is_minimum (for "over $7,000")
  status ('planned'|'active'|'completed')  story

contributions       where the money came from
  id  campaign_id  user_id  amount_cents  occurred_on  category
  ('bake_sale'|'social_media'|'company_match'|'personal'|'other_donations'|…)
  note  is_approximate

strava_connections  (Phase 4, server-only: no RLS read access at all)
  user_id  athlete_id  access_token_enc  refresh_token_enc  expires_at  scopes
```

**Design decisions worth explaining:**
- **Money is stored in integer cents** (`700000`, not `7000.00`) because floating-point
  numbers can't represent decimals exactly. It's a classic bug source.
- **"Over $7,000" is modeled honestly:** `reported_raised_cents = 700000` +
  `raised_is_minimum = true` → displayed as **"$7,000+"**. Breakdown rows are flagged
  `is_approximate`.
- **Distance in meters, time in seconds:** store raw units; convert only for display.
- **Moving vs. elapsed time are separate columns.** Pace = moving time ÷ distance
  (Strava's convention for training runs). Race results use official/elapsed time.
- **No GPS is stored anywhere.** We import summary numbers only, so there's nothing
  location-sensitive in the database to leak.
- **Dedupe key** `(user_id, source, source_id)`: importing a newer export updates
  existing runs and adds new ones instead of duplicating them.
- **Strava tokens** (Phase 4) are encrypted, stored in a table no browser role can
  read, and only touched by server code using a secret key from environment variables.

---

## 6. Privacy & security rules (non-negotiable)

1. Raw exports live only in `private-strava-imports/` (git-ignored, never in `public/`).
2. GPS/route files (`.gpx`, `.fit`, `.tcx`) are git-ignored everywhere and never imported.
3. Activity **names, notes, and start times are never public**, and donation notes
   are private. The public site can only read the `public_*` database views, which
   list safe columns explicitly. Runs can also be marked private one by one.
4. Secrets live in `.env.local` (git-ignored) and in Vercel's encrypted environment
   settings. Only variables prefixed `NEXT_PUBLIC_` reach the browser, and the
   Supabase **service-role key is never one of them**.
5. Admin pages are protected three times: `proxy.ts` redirects logged-out visitors,
   every page and Server Action re-checks the session and admin role, and RLS in
   Postgres only lets a session touch its own rows. No secret key is used at all.
6. Before every push: list staged files and confirm nothing sensitive is included.

---

## 7. Phases

> **Plan change (Nov 2026):** the Strava export isn't available yet, so the database,
> login, and manual data entry moved up front. Strava import stays in the
> architecture (source tracking, dedupe logic, and import planner are built and tested)
> and plugs in later.

### Phase 0: Safety setup ✅
`private-strava-imports/` created and git-ignored; GPS/export/credential patterns
ignored; repository history checked: no sensitive files tracked.

### Phase 1: Database, admin, and dashboard ✅ (built, awaiting Supabase setup)
- Postgres schema + Row Level Security + public views (`supabase/migrations/0001_…`).
- Seed of the races and campaigns you described (`supabase/seed.sql`), with no runs.
- Private admin at `/running/admin`: email/password login; add/edit/delete runs,
  races, campaigns, and donations; pace calculated automatically; duplicate warning
  when a run on the same day has nearly the same distance.
- Public `/running`: The Miles (heatmap, weekly/monthly/yearly mileage, pace trend,
  filters, longest runs, PRs, milestones, insights), The Majors (map + tracker),
  The Impact (campaign cards, progress, breakdown donut).
- Saving in the admin refreshes the public page immediately (`updateTag`).
- 80 unit tests for calculations, money, validation, and import planning.

### Phase 2: Strava history import
- Parse your real `activities.csv` (built around its actual columns) into
  `IncomingActivity` rows → `planImport()` → preview → save.
- Manual runs that match imported ones get linked via `duplicate_of`, not double-counted.

### Phase 3: Photos & polish
- Race photo uploads (Supabase Storage), richer race stories.

### Phase 4: Strava API sync
- "Connect Strava" (OAuth), encrypted tokens, webhook for new runs.

### Phase 5: Multi-user
- Sign-up, per-runner public pages (`/r/[handle]`); RLS and views already scope by user.

## 8. Glossary

- **Server Component:** a React component that runs on the server, can read the
  database directly, and sends HTML to the browser (no secrets leave the server).
- **Server Action:** a server function a form can call; our "API" for writes.
- **Repository:** a module whose only job is reading/writing one kind of data.
- **Migration:** a versioned SQL file that changes the database schema; replaying
  them builds an identical database anywhere.
- **RLS (Row Level Security):** Postgres rules like "a user can only select rows where
  `user_id` = their id", enforced by the database itself.
- **Cache revalidation:** telling Next.js "this saved page is stale; rebuild it."
- **OAuth:** the "Connect with Strava" flow, where Strava gives us a token instead of
  you giving us your password.
