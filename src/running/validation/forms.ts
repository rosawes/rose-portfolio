/**
 * Validation for every admin form, using zod.
 *
 * Forms submit strings, so each schema parses text into the stored units
 * (meters, seconds, cents) and produces friendly messages per field. The database
 * has its own CHECK constraints as a second line of defense.
 */
import { z } from "zod";
import { addDays, isISODate } from "../domain/dates";
import { parseMoneyToCents } from "../domain/money";
import {
  CAMPAIGN_STATUSES,
  CONTRIBUTION_CATEGORIES,
  MAJOR_SLUGS,
  RACE_STATUSES,
  SPORT_TYPES,
} from "../domain/types";
import { kmToMeters, MARATHON_M, milesToMeters, parseDuration } from "../domain/units";

// ── Shared field helpers ────────────────────────────────────────────
const text = (max: number) => z.string().trim().max(max, `Keep this under ${max} characters`);
const optionalText = (max: number) => text(max).transform((v) => (v === "" ? null : v));
const checkbox = z
  .string()
  .optional()
  .transform((v) => v === "on" || v === "true");

const requiredDate = z
  .string()
  .trim()
  .refine(isISODate, "Enter a valid date")
  // Allow "tomorrow" in UTC so a late-evening run in US time zones isn't rejected.
  .refine((d) => d <= addDays(new Date().toISOString().slice(0, 10), 1), "Date can't be in the future");

const optionalDate = z
  .string()
  .trim()
  .refine((v) => v === "" || isISODate(v), "Enter a valid date")
  .transform((v) => (v === "" ? null : v));

const requiredDuration = z
  .string()
  .trim()
  .min(1, "Enter a time")
  .transform((v, ctx) => {
    const s = parseDuration(v);
    if (s === null) {
      ctx.addIssue({ code: "custom", message: "Use h:mm:ss or mm:ss (e.g. 45:30)" });
      return z.NEVER;
    }
    return s;
  });

const optionalDuration = z
  .string()
  .trim()
  .transform((v, ctx) => {
    if (v === "") return null;
    const s = parseDuration(v);
    if (s === null) {
      ctx.addIssue({ code: "custom", message: "Use h:mm:ss or mm:ss" });
      return z.NEVER;
    }
    return s;
  });

const money = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `Enter ${label}`)
    .transform((v, ctx) => {
      const c = parseMoneyToCents(v);
      if (c === null) {
        ctx.addIssue({ code: "custom", message: "Enter an amount like 250 or 1,250.50" });
        return z.NEVER;
      }
      return c;
    });

const optionalMoney = z
  .string()
  .trim()
  .transform((v, ctx) => {
    if (v === "") return null;
    const c = parseMoneyToCents(v);
    if (c === null) {
      ctx.addIssue({ code: "custom", message: "Enter an amount like 250 or 1,250.50" });
      return z.NEVER;
    }
    return c;
  });

const positiveNumber = (label: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, `Enter ${label}`)
    .transform(Number)
    .refine((n) => Number.isFinite(n) && n > 0 && n <= max, `Enter ${label} between 0 and ${max}`);

export const uuid = z.string().uuid("Invalid id");

// ── Activities ──────────────────────────────────────────────────────
export const activityForm = z
  .object({
    date: requiredDate,
    distance: positiveNumber("a distance", 250),
    unit: z.enum(["mi", "km"]),
    duration: requiredDuration,
    elapsed: optionalDuration,
    sportType: z.enum(SPORT_TYPES),
    name: optionalText(120),
    notes: optionalText(4000),
    isPublic: checkbox,
    confirmDuplicate: checkbox,
  })
  .superRefine((v, ctx) => {
    if (v.elapsed !== null && v.elapsed < v.duration) {
      ctx.addIssue({ code: "custom", path: ["elapsed"], message: "Elapsed time can't be shorter than moving time" });
    }
  })
  .transform((v) => ({
    localDate: v.date,
    distanceM: Math.round((v.unit === "mi" ? milesToMeters(v.distance) : kmToMeters(v.distance)) * 10) / 10,
    movingS: v.duration,
    elapsedS: v.elapsed,
    sportType: v.sportType,
    name: v.name,
    notes: v.notes,
    visibility: v.isPublic ? ("public" as const) : ("private" as const),
    confirmDuplicate: v.confirmDuplicate,
  }));
export type ActivityInput = z.output<typeof activityForm>;

// ── Races ───────────────────────────────────────────────────────────
const RACE_DISTANCES = { marathon: MARATHON_M, half: 21097.5, "10k": 10000, "5k": 5000 } as const;

export const raceForm = z
  .object({
    name: text(120).min(1, "Enter the race name"),
    major: z.enum(["", ...MAJOR_SLUGS]).transform((v) => (v === "" ? null : v)),
    year: z
      .string()
      .trim()
      .transform(Number)
      .refine((n) => Number.isInteger(n) && n >= 1950 && n <= 2100, "Enter a year like 2027"),
    date: optionalDate,
    city: optionalText(80),
    distance: z.enum(["marathon", "half", "10k", "5k"]),
    status: z.enum(RACE_STATUSES),
    officialTime: optionalDuration,
    timeIsPlaceholder: checkbox,
    goalTime: optionalDuration,
    story: optionalText(20000),
    isPublic: checkbox,
  })
  .superRefine((v, ctx) => {
    if (v.date && Number(v.date.slice(0, 4)) !== v.year) {
      ctx.addIssue({ code: "custom", path: ["date"], message: "Date must be in the race year" });
    }
    if (v.status !== "completed" && v.officialTime !== null) {
      ctx.addIssue({ code: "custom", path: ["officialTime"], message: "Only completed races have a finish time" });
    }
  })
  .transform((v) => ({
    name: v.name,
    major: v.major,
    raceYear: v.year,
    raceDate: v.date,
    city: v.city,
    distanceM: RACE_DISTANCES[v.distance],
    status: v.status,
    officialTimeS: v.officialTime,
    timeIsPlaceholder: v.officialTime !== null && v.timeIsPlaceholder,
    goalTimeS: v.goalTime,
    story: v.story,
    isPublic: v.isPublic,
  }));
export type RaceInput = z.output<typeof raceForm>;

// ── Campaigns ───────────────────────────────────────────────────────
export const campaignForm = z
  .object({
    title: text(120).min(1, "Enter a title"),
    raceId: z
      .string()
      .trim()
      .refine((v) => v === "" || uuid.safeParse(v).success, "Pick a race")
      .transform((v) => (v === "" ? null : v)),
    charityName: optionalText(160),
    charityTeam: optionalText(120),
    donationUrl: z
      .string()
      .trim()
      .refine((v) => v === "" || /^https:\/\/[^\s]+$/.test(v), "Use a full https:// link")
      .transform((v) => (v === "" ? null : v)),
    goal: money("a goal"),
    reportedRaised: optionalMoney,
    raisedIsMinimum: checkbox,
    status: z.enum(CAMPAIGN_STATUSES),
    isConfirmed: checkbox,
    story: optionalText(20000),
    isPublic: checkbox,
  })
  .transform((v) => ({
    title: v.title,
    raceId: v.raceId,
    charityName: v.charityName,
    charityTeam: v.charityTeam,
    donationUrl: v.donationUrl,
    goalCents: v.goal,
    reportedRaisedCents: v.reportedRaised,
    raisedIsMinimum: v.reportedRaised !== null && v.raisedIsMinimum,
    status: v.status,
    isConfirmed: v.isConfirmed,
    story: v.story,
    isPublic: v.isPublic,
  }));
export type CampaignInput = z.output<typeof campaignForm>;

// ── Contributions ───────────────────────────────────────────────────
export const contributionForm = z
  .object({
    amount: money("an amount"),
    occurredOn: optionalDate,
    category: z.enum(CONTRIBUTION_CATEGORIES),
    label: optionalText(120),
    note: optionalText(2000),
    isApproximate: checkbox,
  })
  .transform((v) => ({
    amountCents: v.amount,
    occurredOn: v.occurredOn,
    category: v.category,
    label: v.label,
    note: v.note,
    isApproximate: v.isApproximate,
  }));
export type ContributionInput = z.output<typeof contributionForm>;

// ── Login ───────────────────────────────────────────────────────────
export const loginForm = z.object({
  email: z.string().trim().email("Enter your email"),
  password: z.string().min(1, "Enter your password"),
});

// ── Turning FormData into validated data ────────────────────────────
export type FieldErrors = Record<string, string>;

export function parseForm<S extends z.ZodType>(
  schema: S,
  formData: FormData,
): { ok: true; data: z.output<S> } | { ok: false; fieldErrors: FieldErrors } {
  const raw: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string" && !key.startsWith("$")) raw[key] = value;
  }
  const result = schema.safeParse(raw);
  if (result.success) return { ok: true, data: result.data };
  const fieldErrors: FieldErrors = {};
  for (const issue of result.error.issues) {
    const key = String(issue.path[0] ?? "form");
    fieldErrors[key] ??= issue.message;
  }
  return { ok: false, fieldErrors };
}

/** The raw text the user typed, so forms can be re-filled after an error. */
export function formValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string" && !key.startsWith("$")) values[key] = value;
  }
  return values;
}
