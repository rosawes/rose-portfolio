import { describe, expect, it } from "vitest";
import { breakdown, campaignProgress, lifetimeRaised } from "./fundraising";
import { type Campaign, type Contribution } from "./types";

const nyc: Campaign = {
  id: "c1",
  raceId: null,
  title: "NYC Marathon 2026",
  charityName: "Memorial Sloan Kettering Cancer Center",
  charityTeam: "Fred's Team",
  donationUrl: null,
  goalCents: 650000,
  reportedRaisedCents: 700000,
  raisedIsMinimum: true,
  status: "completed",
  isConfirmed: true,
  story: null,
};
const sydney: Campaign = { ...nyc, id: "c2", goalCents: 500000, reportedRaisedCents: null, raisedIsMinimum: false, status: "planned" };

const contrib = (id: string, campaignId: string, amountCents: number, extra: Partial<Contribution> = {}): Contribution => ({
  id,
  campaignId,
  amountCents,
  occurredOn: null,
  category: "donations",
  label: null,
  isApproximate: true,
  ...extra,
});

const nycBreakdown = [
  contrib("1", "c1", 200000, { category: "bake_sale", label: "Homemade Argentine alfajor bake sales" }),
  contrib("2", "c1", 50000, { category: "social_media" }),
  contrib("3", "c1", 50000, { category: "company_match" }),
  contrib("4", "c1", 40000, { category: "personal" }),
  contrib("5", "c1", 360000, { category: "donations", label: "Other donations" }),
];

describe("campaignProgress", () => {
  it("NYC: reported lower bound, goal exceeded, nothing remaining", () => {
    const p = campaignProgress(nyc, nycBreakdown);
    expect(p.raisedCents).toBe(700000);
    expect(p.isMinimum).toBe(true);
    expect(p.percentOfGoal).toBe(107); // 107.69…, rounded DOWN so we never overstate
    expect(p.barPercent).toBe(100);
    expect(p.remainingCents).toBe(0);
    expect(p.goalMet).toBe(true);
    expect(p.contributionsTotalCents).toBe(700000);
  });
  it("Sydney: sums contributions when no reported total", () => {
    const p = campaignProgress(sydney, []);
    expect(p.raisedCents).toBe(0);
    expect(p.percentOfGoal).toBe(0);
    expect(p.remainingCents).toBe(500000);
    expect(p.goalMet).toBe(false);
    expect(p.isMinimum).toBe(false);
  });
  it("handles a zero goal without dividing by zero", () => {
    expect(campaignProgress({ ...sydney, goalCents: 0 }, []).percentOfGoal).toBe(0);
  });
});

describe("breakdown", () => {
  it("sorts slices by amount with shares that add to 1", () => {
    const slices = breakdown(nycBreakdown);
    expect(slices[0].label).toBe("Other donations");
    expect(slices[1].label).toBe("Homemade Argentine alfajor bake sales");
    expect(slices.reduce((s, x) => s + x.share, 0)).toBeCloseTo(1, 10);
    expect(slices.every((s) => s.isApproximate)).toBe(true);
  });
  it("is empty with no contributions", () => {
    expect(breakdown([])).toEqual([]);
  });
});

describe("lifetimeRaised", () => {
  it("adds campaigns and stays a lower bound if any campaign is", () => {
    expect(lifetimeRaised([nyc, sydney], nycBreakdown)).toEqual({ cents: 700000, isMinimum: true });
  });
});
