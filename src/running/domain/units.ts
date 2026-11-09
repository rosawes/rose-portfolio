/**
 * Unit conversions and formatting.
 *
 * Pace is ALWAYS computed from moving time (Strava's convention for training
 * runs): pace = moving seconds ÷ miles. Elapsed time (including stops) is shown
 * separately and never mixed into pace.
 */

export const METERS_PER_MILE = 1609.344;
export const METERS_PER_KM = 1000;
export const MARATHON_M = 42195;

export function metersToMiles(m: number): number {
  return m / METERS_PER_MILE;
}

export function milesToMeters(mi: number): number {
  return mi * METERS_PER_MILE;
}

export function kmToMeters(km: number): number {
  return km * METERS_PER_KM;
}

/** "26.2" (miles, fixed decimals, thousands separators). */
export function formatMiles(meters: number, digits = 1): string {
  return metersToMiles(meters).toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

/** Seconds per mile, or null when distance is zero. */
export function pacePerMile(distanceM: number, seconds: number): number | null {
  if (!(distanceM > 0) || !(seconds > 0)) return null;
  return seconds / metersToMiles(distanceM);
}

const pad2 = (n: number) => String(n).padStart(2, "0");

/** 14280 → "3:58:00"; 2712 → "45:12". Rounds to the nearest second. */
export function formatDuration(totalSeconds: number): string {
  const s = Math.round(totalSeconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0 ? `${h}:${pad2(m)}:${pad2(sec)}` : `${m}:${pad2(sec)}`;
}

/** 522.4 → "8:42" (minutes:seconds per mile). */
export function formatPace(secondsPerMile: number | null): string {
  if (secondsPerMile == null || !Number.isFinite(secondsPerMile)) return "–";
  const s = Math.round(secondsPerMile);
  return `${Math.floor(s / 60)}:${pad2(s % 60)}`;
}

/**
 * Parses a duration typed by a person into seconds.
 * Accepts "h:mm:ss", "mm:ss", or a plain number of minutes ("45" or "45.5").
 * Returns null for anything invalid (e.g. "1:75", "abc", "0").
 */
export function parseDuration(input: string): number | null {
  const value = input.trim();
  if (!value) return null;

  if (/^\d+(\.\d+)?$/.test(value)) {
    const seconds = Math.round(Number(value) * 60);
    return seconds > 0 ? seconds : null;
  }

  const parts = value.split(":");
  if (parts.length < 2 || parts.length > 3 || parts.some((p) => !/^\d+$/.test(p))) return null;
  const nums = parts.map(Number);
  const [h, m, s] = nums.length === 3 ? nums : [0, nums[0], nums[1]];
  // Minutes may exceed 59 only when there's no hours part ("75:00" is fine).
  if (s >= 60 || (nums.length === 3 && m >= 60)) return null;
  const total = h * 3600 + m * 60 + s;
  return total > 0 ? total : null;
}
