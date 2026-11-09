# Running Archive: Database & Login Setup

About 10 minutes, one time. You'll create a free Supabase project, run two SQL
files, create your admin login, and paste two values into a private settings file.

## 1. Create the Supabase project
1. Go to **https://supabase.com** → **Start your project** and sign up
   (signing in with GitHub as `rosawes` is easiest). The free plan needs no credit card.
2. **New project**
   - Name: `running-archive`
   - Database password: click **Generate a password** and save it in your password
     manager. (The app never uses it; you'd only need it for advanced tools.)
   - Region: **East US (North Virginia)**, closest to Vercel's default servers.
   - Plan: **Free**
3. Wait ~2 minutes while it sets up.

## 2. Create the tables and security rules
1. Left sidebar → **SQL Editor** → **New query**.
2. Open `supabase/migrations/0001_running_archive.sql` from this project, copy
   everything, paste it in, and click **Run**. You should see "Success. No rows returned."

## 3. Lock down sign-ups
Only you should be able to log in.
1. Left sidebar → **Authentication** → **Sign In / Providers**.
2. Turn **off** "Allow new users to sign up". Save.

## 4. Create your admin login
1. **Authentication** → **Users** → **Add user** → **Create new user**.
2. Enter the email and a strong password you'll use for `/running/admin`.
   Check **Auto Confirm User**. Create.

## 5. Add your races and campaigns
1. **SQL Editor** → **New query**.
2. Paste everything from `supabase/seed.sql` and click **Run**.
   This creates your profile, the NYC 2026 and Sydney 2027 races, and both
   fundraising campaigns with the breakdown you provided. It adds **no runs**.

## 6. Connect the app
1. Supabase → **Project Settings** (gear icon) → **API Keys**.
2. Copy the **Project URL** and the **Publishable key** (`sb_publishable_…`).
   Do **not** copy the secret key; the app doesn't need it.
3. In the project folder:
   ```bash
   cp .env.example .env.local
   ```
4. Open `.env.local` and paste the two values after `SUPABASE_URL=` and
   `SUPABASE_PUBLISHABLE_KEY=`. This file is git-ignored and never committed.
5. Restart the dev server (`npm run dev`).

## 7. Try it
- Sign in at **http://localhost:3000/running/admin**
- Add a run → open **http://localhost:3000/running** and see it appear.

## Later: going live on Vercel
In Vercel → your project → **Settings → Environment Variables**, add the same
`SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, and `RUNNING_ARCHIVE_HANDLE=rose`, then redeploy.

## If the site says "taking a breather"
Free Supabase projects pause after ~7 days without database activity. Open the
Supabase dashboard and click **Restore project** (takes a minute or two).
