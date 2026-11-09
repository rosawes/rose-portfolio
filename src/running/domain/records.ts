/**
 * Personal records, longest runs, and milestones.
 *
 * Honesty rule: a "fastest 10K" here means the fastest LOGGED run whose total
 * distance was close to 10K (not a best split inside a longer run, which needs
 * GPS data we deliberately don't store). Race results use official times.
 */
import { type Activity, type Race } from "./types";
import { MARATHON_M, METERS_PER_MILE, metersToMiles, pacePerMile } from "./units";

export const STANDARD_DISTANCES = [
  { key: "5k", label: "5K", meters: 5000 },
  { key: "10k", label: "10K", meters: 10000 },
  { key: "half", label: "Half marathon", meters: 21097.5 },
  { key: "marathon", label: "Marathon", meters: MARATHON_M },
] as const;

export type StandardDistanceKey = (typeof STANDARD_DISTANCES)[number]["key"];

/** A run counts for a distance if it's between 98% and 105% of it (GPS drift, tangents). */
const MIN_RATIO = 0.98;
const MAX_RATIO = 1.05;

export interface PersonalBest {
  key: StandardDistanceKey;
  label: string;
  timeS: number;
  paceSPerMile: number;
  date: string | null;
  source: "activity" | "race";
  /** True when based on a race time that's still an estimate. */
  isPlaceholder: boolean;
}

export function personalBests(runs: Activity[], races: Race[] = []): PersonalBest[] {
  const out: PersonalBest[] = [];
  for (const d of STANDARD_DISTANCES) {
    let best: PersonalBest | null = null;

    for (const r of runs) {
      const ratio = r.distanceM / d.meters;
      if (ratio < MIN_RATIO || ratio > MAX_RATIO) continue;
      if (!best || r.movingS < best.timeS) {
        best = {
          key: d.key,
          label: d.label,
          timeS: r.movingS,
          paceSPerMile: pacePerMile(r.distanceM, r.movingS) ?? 0,
          date: r.date,
          source: "activity",
          isPlaceholder: false,
        };
      }
    }

    for (const race of races) {
      if (race.status !== "completed" || !race.officialTimeS) continue;
      const ratio = race.distanceM / d.meters;
      if (ratio < MIN_RATIO || ratio > MAX_RATIO) continue;
      // Official race results win ties and replace slower logged runs.
      if (!best || race.officialTimeS <= best.timeS) {
        best = {
          key: d.key,
          label: d.label,
          timeS: race.officialTimeS,
          paceSPerMile: pacePerMile(race.distanceM, race.officialTimeS) ?? 0,
          date: race.date,
          source: "race",
          isPlaceholder: race.timeIsPlaceholder,
        };
      }
    }

    if (best) out.push(best);
  }
  return out;
}

export function longestRuns(runs: Activity[], count = 5): Activity[] {
  return [...runs].sort((a, b) => b.distanceM - a.distanceM || (a.date < b.date ? -1 : 1)).slice(0, count);
}

export const MILESTONE_MILES = [100, 250, 500, 750, 1000, 1500, 2000, 2500, 3000, 4000, 5000, 7500, 10000];

export interface Milestones {
  reached: { miles: number; date: string }[];
  next: { miles: number; remainingMiles: number } | null;
}

/** Lifetime-mileage milestones, with the date each was crossed. */
export function milestones(runs: Activity[]): Milestones {
  const sorted = [...runs].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  const reached: Milestones["reached"] = [];
  let totalM = 0;
  let i = 0;
  for (const r of sorted) {
    totalM += r.distanceM;
    while (i < MILESTONE_MILES.length && totalM >= MILESTONE_MILES[i] * METERS_PER_MILE) {
      reached.push({ miles: MILESTONE_MILES[i], date: r.date });
      i++;
    }
  }
  const nextMiles = MILESTONE_MILES[i];
  return {
    reached,
    next: nextMiles ? { miles: nextMiles, remainingMiles: nextMiles - metersToMiles(totalM) } : null,
  };
}
