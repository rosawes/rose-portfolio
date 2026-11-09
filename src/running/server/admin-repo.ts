import "server-only";
/**
 * Admin data access ("repositories"). Every function takes the logged-in admin's
 * context and uses THEIR session client, so Row Level Security limits each query
 * to their own rows, even if a bug passed in someone else's id.
 */
import {
  type ActivityInput,
  type CampaignInput,
  type ContributionInput,
  type RaceInput,
} from "../validation/forms";
import { type AdminContext } from "./auth";
import {
  type AdminActivityRow,
  type AdminCampaignRow,
  type AdminContributionRow,
  type AdminRaceRow,
} from "./rows";

function fail(action: string, error: { message: string } | null): never {
  throw new Error(`${action} failed${error ? `: ${error.message}` : ""}`);
}

// ── Activities ──────────────────────────────────────────────────────
const ACTIVITY_COLS =
  "id, source, source_id, local_date, start_time, sport_type, name, notes, distance_m, moving_s, elapsed_s, elevation_gain_m, visibility, duplicate_of";

export async function listActivities(ctx: AdminContext): Promise<AdminActivityRow[]> {
  const rows: AdminActivityRow[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await ctx.db
      .from("activities")
      .select(ACTIVITY_COLS)
      .order("local_date", { ascending: false })
      .order("created_at", { ascending: false })
      .range(from, from + 999);
    if (error) fail("Loading runs", error);
    rows.push(...(data as AdminActivityRow[]));
    if (data.length < 1000) return rows;
  }
}

export async function getActivity(ctx: AdminContext, id: string): Promise<AdminActivityRow | null> {
  const { data, error } = await ctx.db.from("activities").select(ACTIVITY_COLS).eq("id", id).maybeSingle();
  if (error) fail("Loading run", error);
  return data as AdminActivityRow | null;
}

/** Runs on the same day, for the duplicate warning. */
export async function activitiesOnDate(ctx: AdminContext, date: string) {
  const { data, error } = await ctx.db
    .from("activities")
    .select("id, local_date, distance_m, duplicate_of")
    .eq("local_date", date)
    .is("duplicate_of", null);
  if (error) fail("Checking for duplicates", error);
  return (data as { id: string; local_date: string; distance_m: number | string }[]).map((r) => ({
    id: r.id,
    date: r.local_date,
    distanceM: Number(r.distance_m),
  }));
}

function activityColumns(input: ActivityInput) {
  return {
    local_date: input.localDate,
    sport_type: input.sportType,
    distance_m: input.distanceM,
    moving_s: input.movingS,
    elapsed_s: input.elapsedS,
    name: input.name,
    notes: input.notes,
    visibility: input.visibility,
  };
}

export async function createActivity(ctx: AdminContext, input: ActivityInput) {
  const { error } = await ctx.db
    .from("activities")
    .insert({ ...activityColumns(input), user_id: ctx.userId, source: "manual" });
  if (error) fail("Saving run", error);
}

export async function updateActivity(ctx: AdminContext, id: string, input: ActivityInput) {
  const { error, count } = await ctx.db
    .from("activities")
    .update(activityColumns(input), { count: "exact" })
    .eq("id", id);
  if (error) fail("Updating run", error);
  if (count === 0) fail("Updating run", { message: "not found" });
}

export async function deleteActivity(ctx: AdminContext, id: string) {
  const { error } = await ctx.db.from("activities").delete().eq("id", id);
  if (error) fail("Deleting run", error);
}

// ── Races ───────────────────────────────────────────────────────────
const RACE_COLS =
  "id, name, major, race_year, race_date, city, distance_m, status, official_time_s, time_is_placeholder, goal_time_s, story, is_public";

export async function listRaces(ctx: AdminContext): Promise<AdminRaceRow[]> {
  const { data, error } = await ctx.db.from("races").select(RACE_COLS).order("race_year", { ascending: false });
  if (error) fail("Loading races", error);
  return data as AdminRaceRow[];
}

export async function getRace(ctx: AdminContext, id: string): Promise<AdminRaceRow | null> {
  const { data, error } = await ctx.db.from("races").select(RACE_COLS).eq("id", id).maybeSingle();
  if (error) fail("Loading race", error);
  return data as AdminRaceRow | null;
}

function raceColumns(r: RaceInput) {
  return {
    name: r.name,
    major: r.major,
    race_year: r.raceYear,
    race_date: r.raceDate,
    city: r.city,
    distance_m: r.distanceM,
    status: r.status,
    official_time_s: r.officialTimeS,
    time_is_placeholder: r.timeIsPlaceholder,
    goal_time_s: r.goalTimeS,
    story: r.story,
    is_public: r.isPublic,
  };
}

export async function createRace(ctx: AdminContext, input: RaceInput) {
  const { error } = await ctx.db.from("races").insert({ ...raceColumns(input), user_id: ctx.userId });
  if (error) fail("Saving race", error);
}

export async function updateRace(ctx: AdminContext, id: string, input: RaceInput) {
  const { error } = await ctx.db.from("races").update(raceColumns(input)).eq("id", id);
  if (error) fail("Updating race", error);
}

export async function deleteRace(ctx: AdminContext, id: string) {
  const { error } = await ctx.db.from("races").delete().eq("id", id);
  if (error) fail("Deleting race", error);
}

// ── Campaigns ───────────────────────────────────────────────────────
const CAMPAIGN_COLS =
  "id, race_id, title, charity_name, charity_team, donation_url, goal_cents, reported_raised_cents, raised_is_minimum, status, is_confirmed, story, is_public";

export async function listCampaigns(ctx: AdminContext): Promise<AdminCampaignRow[]> {
  const { data, error } = await ctx.db.from("campaigns").select(CAMPAIGN_COLS).order("created_at", { ascending: false });
  if (error) fail("Loading campaigns", error);
  return data as AdminCampaignRow[];
}

export async function getCampaign(ctx: AdminContext, id: string): Promise<AdminCampaignRow | null> {
  const { data, error } = await ctx.db.from("campaigns").select(CAMPAIGN_COLS).eq("id", id).maybeSingle();
  if (error) fail("Loading campaign", error);
  return data as AdminCampaignRow | null;
}

function campaignColumns(c: CampaignInput) {
  return {
    title: c.title,
    race_id: c.raceId,
    charity_name: c.charityName,
    charity_team: c.charityTeam,
    donation_url: c.donationUrl,
    goal_cents: c.goalCents,
    reported_raised_cents: c.reportedRaisedCents,
    raised_is_minimum: c.raisedIsMinimum,
    status: c.status,
    is_confirmed: c.isConfirmed,
    story: c.story,
    is_public: c.isPublic,
  };
}

export async function createCampaign(ctx: AdminContext, input: CampaignInput): Promise<string> {
  const { data, error } = await ctx.db
    .from("campaigns")
    .insert({ ...campaignColumns(input), user_id: ctx.userId })
    .select("id")
    .single();
  if (error) fail("Saving campaign", error);
  return data.id as string;
}

export async function updateCampaign(ctx: AdminContext, id: string, input: CampaignInput) {
  const { error } = await ctx.db.from("campaigns").update(campaignColumns(input)).eq("id", id);
  if (error) fail("Updating campaign", error);
}

export async function deleteCampaign(ctx: AdminContext, id: string) {
  const { error } = await ctx.db.from("campaigns").delete().eq("id", id);
  if (error) fail("Deleting campaign", error);
}

// ── Contributions ───────────────────────────────────────────────────
const CONTRIBUTION_COLS = "id, campaign_id, amount_cents, occurred_on, category, label, note, is_approximate";

export async function listContributions(ctx: AdminContext, campaignId?: string): Promise<AdminContributionRow[]> {
  let q = ctx.db.from("contributions").select(CONTRIBUTION_COLS).order("amount_cents", { ascending: false });
  if (campaignId) q = q.eq("campaign_id", campaignId);
  const { data, error } = await q;
  if (error) fail("Loading contributions", error);
  return data as AdminContributionRow[];
}

function contributionColumns(c: ContributionInput) {
  return {
    amount_cents: c.amountCents,
    occurred_on: c.occurredOn,
    category: c.category,
    label: c.label,
    note: c.note,
    is_approximate: c.isApproximate,
  };
}

export async function createContribution(ctx: AdminContext, campaignId: string, input: ContributionInput) {
  const { error } = await ctx.db
    .from("contributions")
    .insert({ ...contributionColumns(input), campaign_id: campaignId, user_id: ctx.userId });
  if (error) fail("Saving contribution", error);
}

export async function updateContribution(ctx: AdminContext, id: string, input: ContributionInput) {
  const { error } = await ctx.db.from("contributions").update(contributionColumns(input)).eq("id", id);
  if (error) fail("Updating contribution", error);
}

export async function deleteContribution(ctx: AdminContext, id: string) {
  const { error } = await ctx.db.from("contributions").delete().eq("id", id);
  if (error) fail("Deleting contribution", error);
}
