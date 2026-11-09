import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { type PublicArchive } from "../domain/types";
import { archiveHandle, supabaseEnv } from "./env";
import {
  type ActivityRow,
  type CampaignRow,
  type ContributionRow,
  PUBLIC_ACTIVITY_COLUMNS,
  PUBLIC_CAMPAIGN_COLUMNS,
  PUBLIC_CONTRIBUTION_COLUMNS,
  PUBLIC_RACE_COLUMNS,
  type RaceRow,
  toActivity,
  toCampaign,
  toContribution,
  toRace,
} from "./rows";
import { createPublicClient } from "./supabase";

/** Cache tag for everything on the public dashboard. Admin saves call updateTag() with it. */
export const ARCHIVE_TAG = "running-archive";

export type ArchiveResult =
  | { status: "ok"; archive: PublicArchive }
  | { status: "not-configured" }
  | { status: "no-profile" };

/**
 * Loads the public dashboard data for the configured runner.
 *
 * Cached indefinitely and refreshed only when the admin saves something (updateTag),
 * so visitors don't hit the database on every page view. Errors are thrown (and
 * therefore NOT cached), so a temporary outage can't get stuck in the cache.
 */
export async function getPublicArchive(): Promise<ArchiveResult> {
  "use cache";
  cacheTag(ARCHIVE_TAG);
  cacheLife("max");

  if (!supabaseEnv()) return { status: "not-configured" };
  const handle = archiveHandle();
  const db = createPublicClient();

  const profile = await db.from("public_profiles").select("handle, display_name").eq("handle", handle).maybeSingle();
  if (profile.error) throw new Error(`Loading profile failed: ${profile.error.message}`);
  if (!profile.data) return { status: "no-profile" };

  const [activities, races, campaigns] = await Promise.all([
    fetchAllActivities(db, handle),
    db.from("public_races").select(PUBLIC_RACE_COLUMNS).eq("handle", handle).order("race_year"),
    db.from("public_campaigns").select(PUBLIC_CAMPAIGN_COLUMNS).eq("handle", handle).order("created_at"),
  ]);
  if (races.error) throw new Error(`Loading races failed: ${races.error.message}`);
  if (campaigns.error) throw new Error(`Loading campaigns failed: ${campaigns.error.message}`);

  const campaignIds = (campaigns.data as CampaignRow[]).map((c) => c.id);
  const contributions = campaignIds.length
    ? await db.from("public_contributions").select(PUBLIC_CONTRIBUTION_COLUMNS).in("campaign_id", campaignIds)
    : { data: [] as ContributionRow[], error: null };
  if (contributions.error) throw new Error(`Loading contributions failed: ${contributions.error.message}`);

  return {
    status: "ok",
    archive: {
      profile: { handle: profile.data.handle, displayName: profile.data.display_name },
      activities: activities.map(toActivity),
      races: (races.data as RaceRow[]).map(toRace),
      campaigns: (campaigns.data as CampaignRow[]).map(toCampaign),
      contributions: (contributions.data as ContributionRow[]).map(toContribution),
    },
  };
}

/** Supabase returns at most 1,000 rows per request, so page through them. */
async function fetchAllActivities(db: ReturnType<typeof createPublicClient>, handle: string): Promise<ActivityRow[]> {
  const PAGE = 1000;
  const rows: ActivityRow[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await db
      .from("public_activities")
      .select(PUBLIC_ACTIVITY_COLUMNS)
      .eq("handle", handle)
      .order("local_date")
      .order("id")
      .range(from, from + PAGE - 1);
    if (error) throw new Error(`Loading activities failed: ${error.message}`);
    rows.push(...(data as ActivityRow[]));
    if (data.length < PAGE) return rows;
  }
}
