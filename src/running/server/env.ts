import "server-only";

/**
 * Server-only configuration. These values are read on the server and never sent
 * to the browser (no NEXT_PUBLIC_ prefix). Set them in .env.local for local dev and
 * in Vercel → Project → Settings → Environment Variables for production.
 *
 *   SUPABASE_URL              https://<project-ref>.supabase.co
 *   SUPABASE_PUBLISHABLE_KEY  sb_publishable_…  (safe for RLS-protected access)
 *   RUNNING_ARCHIVE_HANDLE    whose public dashboard /running shows (default "rose")
 *
 * No secret/service-role key is used: Row Level Security does the authorization.
 */
export interface SupabaseEnv {
  url: string;
  key: string;
}

export function supabaseEnv(): SupabaseEnv | null {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!url || !key) return null;
  return { url, key };
}

export function archiveHandle(): string {
  return process.env.RUNNING_ARCHIVE_HANDLE?.trim() || "rose";
}
