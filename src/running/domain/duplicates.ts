/**
 * Duplicate detection between runs from different sources.
 *
 * Example: you log a run manually today, then later import your Strava history,
 * which contains the same run. Exact matching is impossible (no shared ID), so we
 * match on the same date + nearly the same distance. The importer links the manual
 * row to the imported one (`duplicate_of`) so it's never counted twice.
 */
import { type Activity } from "./types";

export interface DuplicateCandidate {
  date: string;
  distanceM: number;
}

/** Distances within 3% (or 0.1 mi for short runs) count as "the same run". */
const RELATIVE_TOLERANCE = 0.03;
const ABSOLUTE_TOLERANCE_M = 160;

export function isLikelySameRun(a: DuplicateCandidate, b: DuplicateCandidate): boolean {
  if (a.date !== b.date) return false;
  const tolerance = Math.max(ABSOLUTE_TOLERANCE_M, RELATIVE_TOLERANCE * Math.max(a.distanceM, b.distanceM));
  return Math.abs(a.distanceM - b.distanceM) <= tolerance;
}

export function findPossibleDuplicates<T extends DuplicateCandidate & Pick<Activity, "id">>(
  candidate: DuplicateCandidate & { id?: string },
  existing: T[],
): T[] {
  return existing.filter((e) => e.id !== candidate.id && isLikelySameRun(candidate, e));
}
