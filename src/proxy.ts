/**
 * Proxy (formerly "middleware") runs before admin pages render.
 *
 *  • Refreshes the Supabase login session cookie when it's close to expiring.
 *  • Sends signed-out visitors to the login page.
 *
 * This is the FIRST lock. Every admin page and Server Action also re-checks the
 * session and admin role (the second lock), because proxies can be misconfigured.
 */
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const LOGIN_PATH = "/running/admin/login";

export async function proxy(request: NextRequest) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  const isLogin = request.nextUrl.pathname === LOGIN_PATH;

  // Not connected to a database yet: only the login page (which explains this) is reachable.
  if (!url || !key) {
    return isLogin ? NextResponse.next() : NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet, headers) => {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
        for (const [k, v] of Object.entries(headers ?? {})) response.headers.set(k, v);
      },
    },
  });

  const { data } = await supabase.auth.getUser();
  if (!data.user && !isLogin) {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  }
  // (Signed-in admins visiting the login page are redirected by the page itself,
  // which also checks the admin role, so non-admins can't get stuck in a loop.)
  return response;
}

export const config = {
  matcher: ["/running/admin/:path*", "/running/admin"],
};
