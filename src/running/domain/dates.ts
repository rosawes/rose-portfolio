/**
 * Calendar helpers for "YYYY-MM-DD" date strings.
 *
 * Runs are bucketed by the runner's LOCAL calendar date, so all math here is done
 * in UTC on purpose: treating the date as UTC midnight means a viewer's own time
 * zone can never shift a run onto a different day.
 */

const DAY_MS = 86_400_000;
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isISODate(value: string): boolean {
  const m = ISO_DATE.exec(value);
  if (!m) return false;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return d.getUTCFullYear() === +m[1] && d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3];
}

export function toUTCms(iso: string): number {
  const [y, mo, d] = iso.split("-").map(Number);
  return Date.UTC(y, mo - 1, d);
}

export function fromUTCms(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

export function addDays(iso: string, days: number): string {
  return fromUTCms(toUTCms(iso) + days * DAY_MS);
}

export function daysBetween(fromIso: string, toIso: string): number {
  return Math.round((toUTCms(toIso) - toUTCms(fromIso)) / DAY_MS);
}

/** 0 = Monday … 6 = Sunday. */
export function weekdayIndex(iso: string): number {
  return (new Date(toUTCms(iso)).getUTCDay() + 6) % 7;
}

/** The Monday that starts the week containing `iso`. */
export function startOfWeek(iso: string): string {
  return addDays(iso, -weekdayIndex(iso));
}

export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

export function yearOf(iso: string): number {
  return Number(iso.slice(0, 4));
}

/** "YYYY-MM" → the next month's key. */
export function nextMonthKey(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;
}

export const WEEKDAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatMonthKey(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return `${MONTHS_SHORT[m - 1]} ${y}`;
}

export function formatShortDate(iso: string): string {
  const [, m, d] = iso.split("-").map(Number);
  return `${MONTHS_SHORT[m - 1]} ${d}`;
}

export function formatLongDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTHS_SHORT[m - 1]} ${d}, ${y}`;
}

export function monthShortName(monthIndex0: number): string {
  return MONTHS_SHORT[monthIndex0];
}
