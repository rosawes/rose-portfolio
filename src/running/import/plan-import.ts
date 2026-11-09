/**
 * Import planning: decides what to do with each incoming activity BEFORE anything
 * touches the database. Pure function → easy to test, and the admin can preview
 * the plan ("12 new, 3 updated, 2 matched manual runs") before saving.
 *
 * Rules:
 *  1. Same source + same source ID as an existing row → UPDATE it (re-imports are safe).
 *  2. Same source ID twice in one file → keep the last one.
 *  3. Otherwise INSERT, and if a manual run matches (same date, ~same distance),
 *     link that manual run as a duplicate so it stops counting toward stats.
 *
 * The Strava file parser (not built yet) will turn activities.csv rows into
 * `IncomingActivity` objects; this planner doesn't care which source they came from.
 */
import { isLikelySameRun } from "../domain/duplicates";
import { type SportType } from "../domain/types";

export type ImportSource = "strava_export" | "strava_api";

export interface IncomingActivity {
  source: ImportSource;
  sourceId: string;
  date: string;
  sportType: SportType;
  distanceM: number;
  movingS: number;
  elapsedS: number | null;
  elevationGainM: number | null;
  name: string | null;
}

export interface ExistingActivity {
  id: string;
  source: "manual" | ImportSource;
  sourceId: string | null;
  date: string;
  distanceM: number;
  duplicateOf: string | null;
}

export interface ImportPlan {
  inserts: IncomingActivity[];
  updates: { id: string; row: IncomingActivity }[];
  /** Manual runs to mark as duplicates of the imported run with this source ID. */
  manualDuplicates: { manualId: string; sourceId: string }[];
  /** Duplicate rows inside the incoming file that were collapsed. */
  collapsedInFile: number;
}

export function planImport(existing: ExistingActivity[], incoming: IncomingActivity[]): ImportPlan {
  const bySourceKey = new Map<string, ExistingActivity>();
  for (const e of existing) {
    if (e.sourceId) bySourceKey.set(`${e.source}:${e.sourceId}`, e);
  }

  const unique = new Map<string, IncomingActivity>();
  for (const row of incoming) unique.set(`${row.source}:${row.sourceId}`, row);

  const plan: ImportPlan = {
    inserts: [],
    updates: [],
    manualDuplicates: [],
    collapsedInFile: incoming.length - unique.size,
  };

  // Each manual run can be matched at most once.
  const availableManual = existing.filter((e) => e.source === "manual" && !e.duplicateOf);
  const claimed = new Set<string>();

  for (const [key, row] of unique) {
    const match = bySourceKey.get(key);
    if (match) {
      plan.updates.push({ id: match.id, row });
      continue;
    }
    plan.inserts.push(row);
    const manual = availableManual.find((m) => !claimed.has(m.id) && isLikelySameRun(m, row));
    if (manual) {
      claimed.add(manual.id);
      plan.manualDuplicates.push({ manualId: manual.id, sourceId: row.sourceId });
    }
  }
  return plan;
}
