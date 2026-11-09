"use server";
/**
 * Server Actions: the "API" the admin forms call.
 *
 * Every action follows the same steps:
 *   1. Re-check that the caller is the admin (never trust that the page did it).
 *   2. Validate input with zod.
 *   3. Write through the repository (RLS-protected).
 *   4. Expire the public dashboard's cache so changes show up immediately.
 */
import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { findPossibleDuplicates } from "../domain/duplicates";
import { formatMiles } from "../domain/units";
import {
  activityForm,
  campaignForm,
  contributionForm,
  formValues,
  loginForm,
  parseForm,
  raceForm,
  uuid,
} from "../validation/forms";
import * as repo from "./admin-repo";
import { type AdminContext, getAdmin, LOGIN_PATH } from "./auth";
import { supabaseEnv } from "./env";
import { ARCHIVE_TAG } from "./public-archive";
import { createSessionClient } from "./supabase";

export interface FormState {
  status: "idle" | "error" | "warning" | "success";
  message?: string;
  fieldErrors?: Record<string, string>;
  /** What the user typed, to refill the form after an error. */
  values?: Record<string, string>;
}

const ADMIN = "/running/admin";

async function adminOrError(): Promise<AdminContext | FormState> {
  const admin = await getAdmin();
  return admin ?? { status: "error", message: "Your session expired. Please sign in again." };
}

function isState(x: AdminContext | FormState): x is FormState {
  return "status" in x;
}

function publicChanged() {
  updateTag(ARCHIVE_TAG);
}

function failure(err: unknown, formData: FormData): FormState {
  console.error(err);
  return {
    status: "error",
    message: "Something went wrong saving that. Please try again.",
    values: formValues(formData),
  };
}

function readId(formData: FormData, field = "id"): string | null {
  const parsed = uuid.safeParse(formData.get(field));
  return parsed.success ? parsed.data : null;
}

// ── Auth ────────────────────────────────────────────────────────────
export async function signIn(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!supabaseEnv()) return { status: "error", message: "The database isn't connected yet." };
  const parsed = parseForm(loginForm, formData);
  if (!parsed.ok) return { status: "error", fieldErrors: parsed.fieldErrors, values: { email: String(formData.get("email") ?? "") } };

  const db = await createSessionClient();
  const { error } = await db.auth.signInWithPassword(parsed.data);
  if (error) {
    // Same message for wrong email or password, so attackers can't probe which emails exist.
    return { status: "error", message: "That email and password don't match.", values: { email: parsed.data.email } };
  }
  if (!(await getAdmin())) {
    await db.auth.signOut();
    return { status: "error", message: "This account doesn't have admin access." };
  }
  redirect(ADMIN);
}

export async function signOut() {
  if (supabaseEnv()) {
    const db = await createSessionClient();
    await db.auth.signOut();
  }
  redirect(LOGIN_PATH);
}

// ── Activities ──────────────────────────────────────────────────────
export async function saveActivity(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await adminOrError();
  if (isState(admin)) return admin;
  const id = formData.get("id") ? readId(formData) : null;
  if (formData.get("id") && !id) return { status: "error", message: "Invalid run." };

  const parsed = parseForm(activityForm, formData);
  if (!parsed.ok) return { status: "error", fieldErrors: parsed.fieldErrors, values: formValues(formData) };
  const input = parsed.data;

  try {
    // Warn (once) if this looks like a run that's already logged.
    if (!input.confirmDuplicate) {
      const sameDay = await repo.activitiesOnDate(admin, input.localDate);
      const dupes = findPossibleDuplicates({ id: id ?? undefined, date: input.localDate, distanceM: input.distanceM }, sameDay);
      if (dupes.length > 0) {
        return {
          status: "warning",
          message: `You already logged a ${formatMiles(dupes[0].distanceM)} mi run on this date. Save anyway?`,
          values: formValues(formData),
        };
      }
    }
    if (id) await repo.updateActivity(admin, id, input);
    else await repo.createActivity(admin, input);
  } catch (err) {
    return failure(err, formData);
  }

  publicChanged();
  if (id) redirect(`${ADMIN}/activities`);
  refresh();
  return { status: "success", message: "Run saved." };
}

export async function removeActivity(formData: FormData) {
  const admin = await getAdmin();
  const id = readId(formData);
  if (!admin || !id) redirect(LOGIN_PATH);
  await repo.deleteActivity(admin, id);
  publicChanged();
  redirect(`${ADMIN}/activities`);
}

// ── Races ───────────────────────────────────────────────────────────
export async function saveRace(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await adminOrError();
  if (isState(admin)) return admin;
  const id = formData.get("id") ? readId(formData) : null;
  if (formData.get("id") && !id) return { status: "error", message: "Invalid race." };

  const parsed = parseForm(raceForm, formData);
  if (!parsed.ok) return { status: "error", fieldErrors: parsed.fieldErrors, values: formValues(formData) };
  try {
    if (id) await repo.updateRace(admin, id, parsed.data);
    else await repo.createRace(admin, parsed.data);
  } catch (err) {
    return failure(err, formData);
  }
  publicChanged();
  redirect(`${ADMIN}/races`);
}

export async function removeRace(formData: FormData) {
  const admin = await getAdmin();
  const id = readId(formData);
  if (!admin || !id) redirect(LOGIN_PATH);
  await repo.deleteRace(admin, id);
  publicChanged();
  redirect(`${ADMIN}/races`);
}

// ── Campaigns ───────────────────────────────────────────────────────
export async function saveCampaign(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await adminOrError();
  if (isState(admin)) return admin;
  const id = formData.get("id") ? readId(formData) : null;
  if (formData.get("id") && !id) return { status: "error", message: "Invalid campaign." };

  const parsed = parseForm(campaignForm, formData);
  if (!parsed.ok) return { status: "error", fieldErrors: parsed.fieldErrors, values: formValues(formData) };
  let savedId = id;
  try {
    if (id) await repo.updateCampaign(admin, id, parsed.data);
    else savedId = await repo.createCampaign(admin, parsed.data);
  } catch (err) {
    return failure(err, formData);
  }
  publicChanged();
  redirect(`${ADMIN}/campaigns/${savedId}`);
}

export async function removeCampaign(formData: FormData) {
  const admin = await getAdmin();
  const id = readId(formData);
  if (!admin || !id) redirect(LOGIN_PATH);
  await repo.deleteCampaign(admin, id);
  publicChanged();
  redirect(`${ADMIN}/campaigns`);
}

// ── Contributions ───────────────────────────────────────────────────
export async function saveContribution(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await adminOrError();
  if (isState(admin)) return admin;
  const campaignId = readId(formData, "campaignId");
  if (!campaignId) return { status: "error", message: "Invalid campaign." };
  const id = formData.get("id") ? readId(formData) : null;

  const parsed = parseForm(contributionForm, formData);
  if (!parsed.ok) return { status: "error", fieldErrors: parsed.fieldErrors, values: formValues(formData) };
  try {
    if (id) await repo.updateContribution(admin, id, parsed.data);
    else await repo.createContribution(admin, campaignId, parsed.data);
  } catch (err) {
    return failure(err, formData);
  }
  publicChanged();
  refresh();
  return { status: "success", message: id ? "Updated." : "Added." };
}

export async function removeContribution(formData: FormData) {
  const admin = await getAdmin();
  const id = readId(formData);
  const campaignId = readId(formData, "campaignId");
  if (!admin || !id || !campaignId) redirect(LOGIN_PATH);
  await repo.deleteContribution(admin, id);
  publicChanged();
  redirect(`${ADMIN}/campaigns/${campaignId}`);
}
