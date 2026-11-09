import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { supabaseEnv } from "./env";
import { createSessionClient } from "./supabase";

export const LOGIN_PATH = "/running/admin/login";

export interface AdminContext {
  userId: string;
  email: string | null;
  db: Awaited<ReturnType<typeof createSessionClient>>;
}

/**
 * Returns the logged-in admin, or null. `getUser()` asks Supabase's Auth server
 * to verify the session, so a forged or expired cookie is rejected.
 */
export async function getAdmin(): Promise<AdminContext | null> {
  // Admin pages are always rendered fresh, per request. Never prerendered or cached.
  await connection();
  if (!supabaseEnv()) return null;
  const db = await createSessionClient();
  const { data, error } = await db.auth.getUser();
  if (error || !data.user) return null;

  const { data: profile } = await db.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
  if (profile?.role !== "admin") return null;

  return { userId: data.user.id, email: data.user.email ?? null, db };
}

/** For admin pages: redirect to the login page when not signed in as admin. */
export async function requireAdmin(): Promise<AdminContext> {
  const admin = await getAdmin();
  if (!admin) redirect(LOGIN_PATH);
  return admin;
}
