/**
 * Running statistics. Pure functions: activities in → numbers out.
 *
 * Only running sport types count (walks and hikes are stored but excluded).
 */
import {
  addDays,
  daysBetween,
  formatMonthKey,
  formatShortDate,
  monthKey,
  nextMonthKey,
  startOfWeek,
  yearOf,
} from "./dates";
import { type Activity, RUNNING_SPORT_TYPES } from "./types";
import { metersToMiles, pacePerMile } from "./units";

export function isRun(a: Pick<Activity, "sportType">): boolean {
  return RUNNING_SPORT_TYPES.includes(a.sportType);
}

export interface DateRange {
  /** Inclusive "YYYY-MM-DD". */
  from?: string | null;
  /** Inclusive "YYYY-MM-DD". */
  to?: string | null;
}

/** Runs only, optionally limited to a date range, sorted oldest → newest. */
export function selectRuns(activities: Activity[], range: DateRange = {}): Activity[] {
  return activities
    .filter((a) => isRun(a))
    .filter((a) => (!range.from || a.date >= range.from) && (!range.to || a.date <= range.to))
    .sort((a, b) => (a.date === b.date ? a.id.localeCompare(b.id) : a.date < b.date ? -1 : 1));
}

export interface Summary {
  runs: number;
  distanceM: number;
  miles: number;
  movingS: number;
  /** Total moving seconds ÷ total miles: a distance-weighted average. */
  avgPaceSPerMile: number | null;
  avgRunMiles: number;
  longest: Activity | null;
  activeDays: number;
}

export function summarize(runs: Activity[]): Summary {
  let distanceM = 0;
  let movingS = 0;
  let longest: Activity | null = null;
  const days = new Set<string>();
  for (const r of runs) {
    distanceM += r.distanceM;
    movingS += r.movingS;
    days.add(r.date);
    if (!longest || r.distanceM > longest.distanceM) longest = r;
  }
  const miles = metersToMiles(distanceM);
  return {
    runs: runs.length,
    distanceM,
    miles,
    movingS,
    avgPaceSPerMile: pacePerMile(distanceM, movingS),
    avgRunMiles: runs.length ? miles / runs.length : 0,
    longest,
    activeDays: days.size,
  };
}

export interface DayTotal {
  distanceM: number;
  runs: number;
}

/** date → total distance and run count for that day (for the heatmap). */
export function dailyTotals(runs: Activity[]): Map<string, DayTotal> {
  const map = new Map<string, DayTotal>();
  for (const r of runs) {
    const cur = map.get(r.date) ?? { distanceM: 0, runs: 0 };
    cur.distanceM += r.distanceM;
    cur.runs += 1;
    map.set(r.date, cur);
  }
  return map;
}

export type BucketUnit = "week" | "month" | "year";

export interface Bucket {
  key: string;
  label: string;
  /** First day of the bucket, "YYYY-MM-DD". */
  start: string;
  miles: number;
  runs: number;
  movingS: number;
}

function bucketKey(date: string, unit: BucketUnit): string {
  if (unit === "week") return startOfWeek(date);
  if (unit === "month") return monthKey(date);
  return String(yearOf(date));
}

function nextKey(key: string, unit: BucketUnit): string {
  if (unit === "week") return addDays(key, 7);
  if (unit === "month") return nextMonthKey(key);
  return String(Number(key) + 1);
}

function describe(key: string, unit: BucketUnit): { label: string; start: string } {
  if (unit === "week") return { label: `Week of ${formatShortDate(key)}`, start: key };
  if (unit === "month") return { label: formatMonthKey(key), start: `${key}-01` };
  return { label: key, start: `${key}-01-01` };
}

/**
 * Mileage grouped by week (Monday start), month, or year. Empty periods between
 * the first and last run are included as zeros so charts show gaps honestly.
 * Pass `range` to pad the series out to the edges of a selected date range.
 */
export function mileageBuckets(runs: Activity[], unit: BucketUnit, range: DateRange = {}): Bucket[] {
  if (runs.length === 0 && !(range.from && range.to)) return [];
  const sums = new Map<string, { distanceM: number; runs: number; movingS: number }>();
  for (const r of runs) {
    const k = bucketKey(r.date, unit);
    const cur = sums.get(k) ?? { distanceM: 0, runs: 0, movingS: 0 };
    cur.distanceM += r.distanceM;
    cur.runs += 1;
    cur.movingS += r.movingS;
    sums.set(k, cur);
  }
  const firstDate = range.from ?? runs[0].date;
  const lastDate = range.to ?? runs[runs.length - 1].date;
  const out: Bucket[] = [];
  const end = bucketKey(lastDate, unit);
  for (let k = bucketKey(firstDate, unit); k <= end; k = nextKey(k, unit)) {
    const s = sums.get(k);
    out.push({
      key: k,
      ...describe(k, unit),
      miles: s ? metersToMiles(s.distanceM) : 0,
      runs: s?.runs ?? 0,
      movingS: s?.movingS ?? 0,
    });
    if (out.length > 5000) break; // safety valve against bad input
  }
  return out;
}

export interface Streaks {
  /** Longest run of consecutive days with at least one run. */
  longestDays: number;
  /** Consecutive days up to today (or yesterday, if you haven't run yet today). */
  currentDays: number;
  /** Longest run of consecutive weeks with at least one run. */
  longestWeeks: number;
}

export function streaks(runs: Activity[], today: string): Streaks {
  const days = [...new Set(runs.map((r) => r.date))].sort();
  let longestDays = 0;
  let run = 0;
  for (let i = 0; i < days.length; i++) {
    run = i > 0 && daysBetween(days[i - 1], days[i]) === 1 ? run + 1 : 1;
    longestDays = Math.max(longestDays, run);
  }

  let currentDays = 0;
  const daySet = new Set(days);
  let cursor = daySet.has(today) ? today : addDays(today, -1);
  while (daySet.has(cursor)) {
    currentDays++;
    cursor = addDays(cursor, -1);
  }

  const weeks = [...new Set(days.map(startOfWeek))].sort();
  let longestWeeks = 0;
  let wRun = 0;
  for (let i = 0; i < weeks.length; i++) {
    wRun = i > 0 && daysBetween(weeks[i - 1], weeks[i]) === 7 ? wRun + 1 : 1;
    longestWeeks = Math.max(longestWeeks, wRun);
  }

  return { longestDays, currentDays, longestWeeks };
}

export interface PacePoint {
  key: string;
  label: string;
  start: string;
  paceSPerMile: number;
  miles: number;
  runs: number;
}

/** Monthly average pace (moving time ÷ miles), only for months with runs. */
export function paceTrend(runs: Activity[]): PacePoint[] {
  return mileageBuckets(runs, "month")
    .filter((b) => b.runs > 0 && b.miles > 0)
    .map((b) => ({
      key: b.key,
      label: b.label,
      start: b.start,
      paceSPerMile: b.movingS / b.miles,
      miles: b.miles,
      runs: b.runs,
    }));
}

/** Years that contain at least one run, newest first (for the year filter). */
export function yearsWithRuns(activities: Activity[]): number[] {
  return [...new Set(activities.filter(isRun).map((a) => yearOf(a.date)))].sort((a, b) => b - a);
}
