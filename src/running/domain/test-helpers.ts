import { type Activity } from "./types";
import { milesToMeters } from "./units";

let n = 0;
/** Builds a run: run("2026-01-05", 5, "45:00"). */
export function run(date: string, miles: number, minutes: number, extra: Partial<Activity> = {}): Activity {
  n++;
  return {
    id: `a${String(n).padStart(4, "0")}`,
    date,
    sportType: "run",
    distanceM: milesToMeters(miles),
    movingS: minutes * 60,
    elapsedS: null,
    elevationGainM: null,
    ...extra,
  };
}
