import { describe, expect, it } from "vitest";
import { dailyTotals, mileageBuckets, paceTrend, selectRuns, streaks, summarize, yearsWithRuns } from "./stats";
import { run } from "./test-helpers";

describe("selectRuns", () => {
  it("keeps running types only, filters by range, sorts by date", () => {
    const acts = [
      run("2026-03-02", 3, 30),
      run("2026-01-01", 5, 50),
      run("2026-02-01", 2, 30, { sportType: "walk" }),
      run("2025-12-31", 4, 40),
    ];
    const out = selectRuns(acts, { from: "2026-01-01", to: "2026-12-31" });
    expect(out.map((a) => a.date)).toEqual(["2026-01-01", "2026-03-02"]);
  });
});

describe("summarize", () => {
  it("computes distance-weighted pace from moving time", () => {
    // 1 mi in 6:00 + 3 mi in 30:00 = 4 mi in 36:00 → 9:00/mi (not the 8:00 average of 6 and 10)
    const s = summarize([run("2026-01-01", 1, 6), run("2026-01-02", 3, 30)]);
    expect(s.runs).toBe(2);
    expect(s.miles).toBeCloseTo(4, 6);
    expect(s.avgPaceSPerMile).toBeCloseTo(540, 6);
    expect(s.longest?.date).toBe("2026-01-02");
    expect(s.activeDays).toBe(2);
  });
  it("handles no runs", () => {
    const s = summarize([]);
    expect(s.runs).toBe(0);
    expect(s.avgPaceSPerMile).toBeNull();
    expect(s.longest).toBeNull();
  });
});

describe("dailyTotals", () => {
  it("adds up doubles on the same day", () => {
    const m = dailyTotals([run("2026-01-01", 3, 30), run("2026-01-01", 2, 20)]);
    expect(m.get("2026-01-01")?.runs).toBe(2);
  });
});

describe("mileageBuckets", () => {
  it("groups by Monday-start weeks and fills empty weeks with zero", () => {
    const runs = [run("2026-11-02", 3, 30), run("2026-11-08", 2, 20), run("2026-11-17", 4, 40)];
    // Nov 2 2026 is a Monday; Nov 8 is the Sunday of the same week.
    const weeks = mileageBuckets(runs, "week");
    expect(weeks.map((w) => [w.key, Math.round(w.miles)])).toEqual([
      ["2026-11-02", 5],
      ["2026-11-09", 0],
      ["2026-11-16", 4],
    ]);
  });
  it("groups by month across a year boundary", () => {
    const months = mileageBuckets([run("2025-11-15", 1, 10), run("2026-01-03", 2, 20)], "month");
    expect(months.map((m) => m.key)).toEqual(["2025-11", "2025-12", "2026-01"]);
    expect(months[1].miles).toBe(0);
  });
  it("pads to the selected range", () => {
    const years = mileageBuckets([run("2026-06-01", 1, 10)], "month", { from: "2026-01-01", to: "2026-12-31" });
    expect(years).toHaveLength(12);
  });
  it("returns nothing for no runs and no range", () => {
    expect(mileageBuckets([], "year")).toEqual([]);
  });
});

describe("streaks", () => {
  const runs = [
    run("2026-01-01", 1, 10),
    run("2026-01-02", 1, 10),
    run("2026-01-03", 1, 10),
    run("2026-01-10", 1, 10),
    run("2026-01-11", 1, 10),
  ];
  it("finds the longest daily streak", () => {
    expect(streaks(runs, "2026-02-01").longestDays).toBe(3);
  });
  it("counts the current streak through yesterday", () => {
    expect(streaks(runs, "2026-01-12").currentDays).toBe(2);
    expect(streaks(runs, "2026-01-11").currentDays).toBe(2);
    expect(streaks(runs, "2026-01-13").currentDays).toBe(0);
  });
  it("counts consecutive weeks", () => {
    // Jan 1–3 2026 is the week of Dec 29; Jan 10 (Sat) and Jan 11 (Sun) are the week of Jan 5.
    expect(streaks(runs, "2026-02-01").longestWeeks).toBe(2);
  });
});

describe("paceTrend", () => {
  it("returns monthly pace only for months with runs", () => {
    const t = paceTrend([run("2026-01-05", 2, 20), run("2026-03-05", 2, 18)]);
    expect(t.map((p) => [p.key, Math.round(p.paceSPerMile)])).toEqual([
      ["2026-01", 600],
      ["2026-03", 540],
    ]);
  });
});

describe("yearsWithRuns", () => {
  it("lists years newest first, ignoring non-runs", () => {
    expect(
      yearsWithRuns([run("2024-05-01", 1, 10), run("2026-01-01", 1, 10), run("2025-01-01", 1, 10, { sportType: "hike" })]),
    ).toEqual([2026, 2024]);
  });
});
