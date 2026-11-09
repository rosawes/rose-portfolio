import { describe, expect, it } from "vitest";
import { type ExistingActivity, type IncomingActivity, planImport } from "./plan-import";

const incoming = (sourceId: string, date: string, distanceM: number, extra: Partial<IncomingActivity> = {}): IncomingActivity => ({
  source: "strava_export",
  sourceId,
  date,
  sportType: "run",
  distanceM,
  movingS: 1800,
  elapsedS: 1900,
  elevationGainM: null,
  name: null,
  ...extra,
});

describe("planImport", () => {
  it("inserts new activities", () => {
    const plan = planImport([], [incoming("1", "2026-01-01", 5000)]);
    expect(plan.inserts).toHaveLength(1);
    expect(plan.updates).toHaveLength(0);
  });

  it("updates instead of duplicating on re-import", () => {
    const existing: ExistingActivity[] = [
      { id: "db1", source: "strava_export", sourceId: "1", date: "2026-01-01", distanceM: 5000, duplicateOf: null },
    ];
    const plan = planImport(existing, [incoming("1", "2026-01-01", 5010), incoming("2", "2026-01-02", 8000)]);
    expect(plan.updates).toEqual([{ id: "db1", row: expect.objectContaining({ sourceId: "1" }) }]);
    expect(plan.inserts.map((r) => r.sourceId)).toEqual(["2"]);
  });

  it("treats the same ID from a different source as different", () => {
    const existing: ExistingActivity[] = [
      { id: "db1", source: "strava_api", sourceId: "1", date: "2026-01-01", distanceM: 5000, duplicateOf: null },
    ];
    expect(planImport(existing, [incoming("1", "2026-01-01", 5000)]).inserts).toHaveLength(1);
  });

  it("collapses repeated IDs inside one file, keeping the last", () => {
    const plan = planImport([], [incoming("1", "2026-01-01", 5000), incoming("1", "2026-01-01", 5100)]);
    expect(plan.inserts).toHaveLength(1);
    expect(plan.inserts[0].distanceM).toBe(5100);
    expect(plan.collapsedInFile).toBe(1);
  });

  it("links a matching manual run so it isn't counted twice", () => {
    const existing: ExistingActivity[] = [
      { id: "m1", source: "manual", sourceId: null, date: "2026-01-01", distanceM: 8047, duplicateOf: null },
      { id: "m2", source: "manual", sourceId: null, date: "2026-01-01", distanceM: 3000, duplicateOf: null },
    ];
    const plan = planImport(existing, [incoming("9", "2026-01-01", 8100)]);
    expect(plan.manualDuplicates).toEqual([{ manualId: "m1", sourceId: "9" }]);
  });

  it("never matches one manual run to two imported runs", () => {
    const existing: ExistingActivity[] = [
      { id: "m1", source: "manual", sourceId: null, date: "2026-01-01", distanceM: 5000, duplicateOf: null },
    ];
    const plan = planImport(existing, [incoming("1", "2026-01-01", 5000), incoming("2", "2026-01-01", 5050)]);
    expect(plan.manualDuplicates).toHaveLength(1);
  });

  it("skips manual runs already marked as duplicates", () => {
    const existing: ExistingActivity[] = [
      { id: "m1", source: "manual", sourceId: null, date: "2026-01-01", distanceM: 5000, duplicateOf: "other" },
    ];
    expect(planImport(existing, [incoming("1", "2026-01-01", 5000)]).manualDuplicates).toHaveLength(0);
  });
});
