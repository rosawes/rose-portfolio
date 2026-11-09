import { describe, expect, it } from "vitest";
import { findPossibleDuplicates, isLikelySameRun } from "./duplicates";

describe("isLikelySameRun", () => {
  it("matches same day, distances within 3%", () => {
    expect(isLikelySameRun({ date: "2026-01-01", distanceM: 10000 }, { date: "2026-01-01", distanceM: 10250 })).toBe(true);
  });
  it("uses a 0.1 mile floor for short runs", () => {
    expect(isLikelySameRun({ date: "2026-01-01", distanceM: 1600 }, { date: "2026-01-01", distanceM: 1750 })).toBe(true);
  });
  it("does not match different days or clearly different runs", () => {
    expect(isLikelySameRun({ date: "2026-01-01", distanceM: 10000 }, { date: "2026-01-02", distanceM: 10000 })).toBe(false);
    expect(isLikelySameRun({ date: "2026-01-01", distanceM: 10000 }, { date: "2026-01-01", distanceM: 5000 })).toBe(false);
  });
});

describe("findPossibleDuplicates", () => {
  it("ignores the activity being edited", () => {
    const existing = [{ id: "x", date: "2026-01-01", distanceM: 5000 }];
    expect(findPossibleDuplicates({ id: "x", date: "2026-01-01", distanceM: 5000 }, existing)).toEqual([]);
    expect(findPossibleDuplicates({ date: "2026-01-01", distanceM: 5050 }, existing)).toHaveLength(1);
  });
});
