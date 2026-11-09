import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { supabaseEnv } from "./env";

export class NotConfiguredError extends Error {
  constructor() {
    super("Supabase is not configured. Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY.");
  }
}

/**
 * Anonymous client for PUBLIC reads. It has no session, so the database only lets it
 * read the public_* views. Safe to use inside cached functions (no cookies).
 */
export function createPublicClient(): SupabaseClient {
  const env = supabaseEnv();
  if (!env) throw new NotConfiguredError();
  return createClient(env.url, env.key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

/**
 * Client that acts AS the logged-in user (via their session cookie). Every query it
 * makes is filtered by Row Level Security, so it can only touch that user's rows.
 * Used by the admin pages and Server Actions.
 */
export async function createSessionClient(): Promise<SupabaseClient> {
  const env = supabaseEnv();
  if (!env) throw new NotConfiguredError();
  const cookieStore = await cookies();
  return createServerClient(env.url, env.key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          for (const { name, value, options } of cookiesToSet) cookieStore.set(name, value, options);
        } catch {
          // Called from a Server Component, where cookies are read-only. Safe to ignore:
          // proxy.ts refreshes the session cookie on every admin request.
        }
      },
    },
  });
}
