/**
 * Fundraising math: progress toward a goal and where the money came from.
 */
import {
  type Campaign,
  type Contribution,
  type ContributionCategory,
  CONTRIBUTION_CATEGORY_LABELS,
} from "./types";

export interface CampaignProgress {
  raisedCents: number;
  /** True when `raisedCents` is a lower bound (shown as "$7,000+"). */
  isMinimum: boolean;
  /** Uncapped, rounded down (so we never overstate). 107 for $7,000 of $6,500. */
  percentOfGoal: number;
  /** 0–100, for drawing a progress bar. */
  barPercent: number;
  remainingCents: number;
  goalMet: boolean;
  contributionsTotalCents: number;
}

export function campaignProgress(
  campaign: Pick<Campaign, "goalCents" | "reportedRaisedCents" | "raisedIsMinimum">,
  contributions: Pick<Contribution, "amountCents">[],
): CampaignProgress {
  const contributionsTotalCents = contributions.reduce((sum, c) => sum + c.amountCents, 0);
  const useReported = campaign.reportedRaisedCents != null;
  const raisedCents = useReported ? campaign.reportedRaisedCents! : contributionsTotalCents;
  const isMinimum = useReported && campaign.raisedIsMinimum;
  const percentOfGoal = campaign.goalCents > 0 ? Math.floor((raisedCents / campaign.goalCents) * 100) : 0;
  return {
    raisedCents,
    isMinimum,
    percentOfGoal,
    barPercent: Math.min(100, Math.max(0, percentOfGoal)),
    remainingCents: Math.max(0, campaign.goalCents - raisedCents),
    goalMet: campaign.goalCents > 0 && raisedCents >= campaign.goalCents,
    contributionsTotalCents,
  };
}

export interface BreakdownSlice {
  key: string;
  category: ContributionCategory;
  label: string;
  amountCents: number;
  /** Share of all contributions, 0–1. */
  share: number;
  isApproximate: boolean;
}

/**
 * Groups contributions into slices for the "where the money came from" chart.
 * Rows with a custom label get their own slice; others group by category.
 */
export function breakdown(contributions: Contribution[]): BreakdownSlice[] {
  const total = contributions.reduce((s, c) => s + c.amountCents, 0);
  const groups = new Map<string, BreakdownSlice>();
  for (const c of contributions) {
    const label = c.label?.trim() || CONTRIBUTION_CATEGORY_LABELS[c.category];
    const key = `${c.category}:${label}`;
    const cur = groups.get(key) ?? {
      key,
      category: c.category,
      label,
      amountCents: 0,
      share: 0,
      isApproximate: false,
    };
    cur.amountCents += c.amountCents;
    cur.isApproximate ||= c.isApproximate;
    groups.set(key, cur);
  }
  return [...groups.values()]
    .map((g) => ({ ...g, share: total > 0 ? g.amountCents / total : 0 }))
    .sort((a, b) => b.amountCents - a.amountCents);
}

/** Total raised across campaigns; a lower bound if any campaign's total is. */
export function lifetimeRaised(
  campaigns: Campaign[],
  contributions: Contribution[],
): { cents: number; isMinimum: boolean } {
  let cents = 0;
  let isMinimum = false;
  for (const c of campaigns) {
    const p = campaignProgress(c, contributions.filter((x) => x.campaignId === c.id));
    cents += p.raisedCents;
    isMinimum ||= p.isMinimum;
  }
  return { cents, isMinimum };
}
