/**
 * Database row shapes (snake_case, as Postgres returns them) and mappers into the
 * camelCase domain types. Keeping this mapping in one place means a column rename
 * only touches this file.
 */
import {
  type Activity,
  type Campaign,
  type Contribution,
  type ContributionCategory,
  type CampaignStatus,
  type MajorSlug,
  type Race,
  type RaceStatus,
  type SportType,
} from "../domain/types";

export interface ActivityRow {
  id: string;
  local_date: string;
  sport_type: SportType;
  distance_m: number | string;
  moving_s: number;
  elapsed_s: number | null;
  elevation_gain_m: number | string | null;
}

/** Admin-only columns (never selected by public queries). */
export interface AdminActivityRow extends ActivityRow {
  source: "manual" | "strava_export" | "strava_api";
  source_id: string | null;
  name: string | null;
  notes: string | null;
  start_time: string | null;
  visibility: "public" | "private";
  duplicate_of: string | null;
}

export interface RaceRow {
  id: string;
  name: string;
  major: MajorSlug | null;
  race_year: number;
  race_date: string | null;
  city: string | null;
  distance_m: number | string;
  status: RaceStatus;
  official_time_s: number | null;
  time_is_placeholder: boolean;
  goal_time_s: number | null;
  story: string | null;
}

export interface AdminRaceRow extends RaceRow {
  is_public: boolean;
}

export interface CampaignRow {
  id: string;
  race_id: string | null;
  title: string;
  charity_name: string | null;
  charity_team: string | null;
  donation_url: string | null;
  goal_cents: number | string;
  reported_raised_cents: number | string | null;
  raised_is_minimum: boolean;
  status: CampaignStatus;
  is_confirmed: boolean;
  story: string | null;
}

export interface AdminCampaignRow extends CampaignRow {
  is_public: boolean;
}

export interface ContributionRow {
  id: string;
  campaign_id: string;
  amount_cents: number | string;
  occurred_on: string | null;
  category: ContributionCategory;
  label: string | null;
  is_approximate: boolean;
}

export interface AdminContributionRow extends ContributionRow {
  note: string | null;
}

// Postgres numeric/bigint columns can arrive as strings; normalize to numbers.
const num = (v: number | string) => (typeof v === "number" ? v : Number(v));
const numOrNull = (v: number | string | null) => (v == null ? null : num(v));

export const PUBLIC_ACTIVITY_COLUMNS = "id, local_date, sport_type, distance_m, moving_s, elapsed_s, elevation_gain_m";
export const PUBLIC_RACE_COLUMNS =
  "id, name, major, race_year, race_date, city, distance_m, status, official_time_s, time_is_placeholder, goal_time_s, story";
export const PUBLIC_CAMPAIGN_COLUMNS =
  "id, race_id, title, charity_name, charity_team, donation_url, goal_cents, reported_raised_cents, raised_is_minimum, status, is_confirmed, story";
export const PUBLIC_CONTRIBUTION_COLUMNS = "id, campaign_id, amount_cents, occurred_on, category, label, is_approximate";

export function toActivity(r: ActivityRow): Activity {
  return {
    id: r.id,
    date: r.local_date,
    sportType: r.sport_type,
    distanceM: num(r.distance_m),
    movingS: r.moving_s,
    elapsedS: r.elapsed_s,
    elevationGainM: numOrNull(r.elevation_gain_m),
  };
}

export function toRace(r: RaceRow): Race {
  return {
    id: r.id,
    name: r.name,
    major: r.major,
    year: r.race_year,
    date: r.race_date,
    city: r.city,
    distanceM: num(r.distance_m),
    status: r.status,
    officialTimeS: r.official_time_s,
    timeIsPlaceholder: r.time_is_placeholder,
    goalTimeS: r.goal_time_s,
    story: r.story,
  };
}

export function toCampaign(r: CampaignRow): Campaign {
  return {
    id: r.id,
    raceId: r.race_id,
    title: r.title,
    charityName: r.charity_name,
    charityTeam: r.charity_team,
    donationUrl: r.donation_url,
    goalCents: num(r.goal_cents),
    reportedRaisedCents: numOrNull(r.reported_raised_cents),
    raisedIsMinimum: r.raised_is_minimum,
    status: r.status,
    isConfirmed: r.is_confirmed,
    story: r.story,
  };
}

export function toContribution(r: ContributionRow): Contribution {
  return {
    id: r.id,
    campaignId: r.campaign_id,
    amountCents: num(r.amount_cents),
    occurredOn: r.occurred_on,
    category: r.category,
    label: r.label,
    isApproximate: r.is_approximate,
  };
}
