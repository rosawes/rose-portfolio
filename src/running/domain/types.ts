/**
 * Core data types for the Running Archive.
 *
 * These are the shapes the UI and calculations work with. They are deliberately
 * independent of the database (the server layer maps DB rows into these), so the
 * domain logic can be tested without a database and reused if the storage changes.
 *
 * Units: distances in meters, durations in seconds, money in integer cents,
 * dates as "YYYY-MM-DD" strings in the runner's local calendar.
 */

export const SPORT_TYPES = ["run", "trail_run", "treadmill", "race", "walk", "hike", "other"] as const;
export type SportType = (typeof SPORT_TYPES)[number];

/** Sport types that count toward running stats. */
export const RUNNING_SPORT_TYPES: readonly SportType[] = ["run", "trail_run", "treadmill", "race"];

export const SPORT_TYPE_LABELS: Record<SportType, string> = {
  run: "Run",
  trail_run: "Trail run",
  treadmill: "Treadmill",
  race: "Race",
  walk: "Walk",
  hike: "Hike",
  other: "Other",
};

export interface Activity {
  id: string;
  /** Local calendar date, "YYYY-MM-DD". */
  date: string;
  sportType: SportType;
  distanceM: number;
  /** Time actually moving. Used for pace. */
  movingS: number;
  /** Total time including stops, if known. */
  elapsedS: number | null;
  elevationGainM: number | null;
}

export const MAJOR_SLUGS = ["tokyo", "boston", "london", "sydney", "berlin", "chicago", "nyc"] as const;
export type MajorSlug = (typeof MAJOR_SLUGS)[number];

export const RACE_STATUSES = ["planned", "registered", "completed", "dns", "dnf"] as const;
export type RaceStatus = (typeof RACE_STATUSES)[number];

export interface Race {
  id: string;
  name: string;
  major: MajorSlug | null;
  year: number;
  date: string | null;
  city: string | null;
  distanceM: number;
  status: RaceStatus;
  officialTimeS: number | null;
  /** True while the official time is an estimate. */
  timeIsPlaceholder: boolean;
  goalTimeS: number | null;
  story: string | null;
}

export const CAMPAIGN_STATUSES = ["planned", "active", "completed"] as const;
export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];

export interface Campaign {
  id: string;
  raceId: string | null;
  title: string;
  charityName: string | null;
  charityTeam: string | null;
  donationUrl: string | null;
  goalCents: number;
  /** Headline total you report; null means "sum the contributions". */
  reportedRaisedCents: number | null;
  /** True when the reported total is a lower bound ("over $7,000"). */
  raisedIsMinimum: boolean;
  status: CampaignStatus;
  isConfirmed: boolean;
  story: string | null;
}

export const CONTRIBUTION_CATEGORIES = [
  "bake_sale",
  "social_media",
  "company_match",
  "personal",
  "donations",
  "event",
  "other",
] as const;
export type ContributionCategory = (typeof CONTRIBUTION_CATEGORIES)[number];

export const CONTRIBUTION_CATEGORY_LABELS: Record<ContributionCategory, string> = {
  bake_sale: "Bake sales",
  social_media: "Social media",
  company_match: "Company matching",
  personal: "Personal contribution",
  donations: "Donations",
  event: "Events",
  other: "Other",
};

export interface Contribution {
  id: string;
  campaignId: string;
  amountCents: number;
  occurredOn: string | null;
  category: ContributionCategory;
  label: string | null;
  isApproximate: boolean;
}

/** Everything the public /running page needs, in one serializable object. */
export interface PublicArchive {
  profile: { handle: string; displayName: string };
  activities: Activity[];
  races: Race[];
  campaigns: Campaign[];
  contributions: Contribution[];
}
