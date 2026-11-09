import { describe, expect, it } from "vitest";
import { activityForm, campaignForm, contributionForm, parseForm, raceForm } from "./forms";

const fd = (obj: Record<string, string>) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(obj)) f.set(k, v);
  return f;
};

describe("activityForm", () => {
  const base = { date: "2026-11-01", distance: "26.2", unit: "mi", duration: "3:58:00", elapsed: "", sportType: "race", name: "", notes: "", isPublic: "on" };

  it("converts to meters and seconds", () => {
    const r = parseForm(activityForm, fd(base));
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.data.distanceM).toBeCloseTo(42164.8, 1);
    expect(r.data.movingS).toBe(14280);
    expect(r.data.visibility).toBe("public");
    expect(r.data.name).toBeNull();
  });
  it("supports kilometers and private runs", () => {
    const r = parseForm(activityForm, fd({ ...base, distance: "10", unit: "km", isPublic: "" }));
    expect(r.ok && r.data.distanceM).toBe(10000);
    expect(r.ok && r.data.visibility).toBe("private");
  });
  it("reports field errors", () => {
    const r = parseForm(activityForm, fd({ ...base, date: "2026-02-30", distance: "-1", duration: "1:99" }));
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(Object.keys(r.fieldErrors).sort()).toEqual(["date", "distance", "duration"]);
  });
  it("rejects elapsed shorter than moving", () => {
    const r = parseForm(activityForm, fd({ ...base, elapsed: "3:00:00" }));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.fieldErrors.elapsed).toMatch(/shorter/);
  });
  it("rejects dates in the future", () => {
    const r = parseForm(activityForm, fd({ ...base, date: "2999-01-01" }));
    expect(r.ok).toBe(false);
  });
});

describe("raceForm", () => {
  const base = { name: "Sydney Marathon", major: "sydney", year: "2027", date: "", city: "Sydney", distance: "marathon", status: "planned", officialTime: "", goalTime: "", story: "", isPublic: "on" };
  it("accepts a planned race with no date", () => {
    const r = parseForm(raceForm, fd(base));
    expect(r.ok && r.data.raceDate).toBeNull();
    expect(r.ok && r.data.distanceM).toBe(42195);
  });
  it("requires the date to be in the race year and finish times only when completed", () => {
    const r = parseForm(raceForm, fd({ ...base, date: "2026-09-01", officialTime: "3:58:00" }));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.fieldErrors).sort()).toEqual(["date", "officialTime"]);
  });
});

describe("campaignForm", () => {
  it("stores money in cents and keeps the minimum flag only with a reported total", () => {
    const r = parseForm(
      campaignForm,
      fd({ title: "Sydney", raceId: "", charityName: "", charityTeam: "", donationUrl: "", goal: "$5,000", reportedRaised: "", raisedIsMinimum: "on", status: "planned", story: "" }),
    );
    expect(r.ok && r.data.goalCents).toBe(500000);
    expect(r.ok && r.data.raisedIsMinimum).toBe(false);
    expect(r.ok && r.data.isConfirmed).toBe(false);
  });
  it("only allows https donation links", () => {
    const r = parseForm(
      campaignForm,
      fd({ title: "x", raceId: "", charityName: "", charityTeam: "", donationUrl: "http://example.com", goal: "1", reportedRaised: "", status: "planned", story: "" }),
    );
    expect(r.ok).toBe(false);
  });
});

describe("contributionForm", () => {
  it("parses amounts and flags", () => {
    const r = parseForm(contributionForm, fd({ amount: "2,000", occurredOn: "", category: "bake_sale", label: "Alfajor bake sales", note: "", isApproximate: "on" }));
    expect(r.ok && r.data).toEqual({ amountCents: 200000, occurredOn: null, category: "bake_sale", label: "Alfajor bake sales", note: null, isApproximate: true });
  });
});
