import { describe, expect, it } from "vitest";
import { longestRuns, milestones, personalBests } from "./records";
import { run } from "./test-helpers";
import { type Race } from "./types";
import { kmToMeters } from "./units";

const nyc: Race = {
  id: "r1",
  name: "NYC",
  major: "nyc",
  year: 2026,
  date: "2026-11-01",
  city: "New York",
  distanceM: 42195,
  status: "completed",
  officialTimeS: 14280,
  timeIsPlaceholder: true,
  goalTimeS: null,
  story: null,
};

describe("personalBests", () => {
  it("uses runs close to the standard distance only", () => {
    const runs = [
      run("2026-01-01", 3.1, 27, { distanceM: kmToMeters(5) }),
      run("2026-01-02", 3.1, 25, { distanceM: kmToMeters(5.2) }), // 104%: counts
      run("2026-01-03", 3.1, 20, { distanceM: kmToMeters(6) }), // 120%: too long
    ];
    const pb = personalBests(runs).find((p) => p.key === "5k");
    expect(pb?.timeS).toBe(25 * 60);
    expect(pb?.date).toBe("2026-01-02");
  });
  it("prefers the official race result and flags placeholders", () => {
    const pb = personalBests([run("2026-11-01", 26.2, 245, { distanceM: 42400 })], [nyc]).find(
      (p) => p.key === "marathon",
    );
    expect(pb?.source).toBe("race");
    expect(pb?.timeS).toBe(14280);
    expect(pb?.isPlaceholder).toBe(true);
  });
  it("ignores planned races", () => {
    expect(personalBests([], [{ ...nyc, status: "planned" }])).toEqual([]);
  });
});

describe("longestRuns", () => {
  it("sorts by distance", () => {
    const out = longestRuns([run("2026-01-01", 3, 30), run("2026-01-02", 10, 100), run("2026-01-03", 6, 60)], 2);
    expect(out.map((r) => r.date)).toEqual(["2026-01-02", "2026-01-03"]);
  });
});

describe("milestones", () => {
  it("records the date each lifetime milestone was crossed", () => {
    const runs = [run("2026-01-01", 60, 600), run("2026-02-01", 60, 600), run("2026-03-01", 200, 2000)];
    const m = milestones(runs);
    expect(m.reached).toEqual([
      { miles: 100, date: "2026-02-01" },
      { miles: 250, date: "2026-03-01" },
    ]);
    expect(m.next?.miles).toBe(500);
    expect(m.next?.remainingMiles).toBeCloseTo(180, 6);
  });
});
