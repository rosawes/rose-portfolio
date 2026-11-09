import { redirect } from "next/navigation";
import { LoginForm } from "@/running/components/admin/login-form";
import { getAdmin } from "@/running/server/auth";
import { supabaseEnv } from "@/running/server/env";
import { AdminShell } from "../admin-shell";

export default function LoginPage() {
  return (
    <AdminShell>
      <Login />
    </AdminShell>
  );
}

async function Login() {
  if (await getAdmin()) redirect("/running/admin");
  const configured = Boolean(supabaseEnv());
  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-3xl font-medium tracking-tight">Sign in</h1>
      <p className="mt-2 text-sm text-muted">Admin access for the Running Archive.</p>
      <div className="glass mt-6 rounded-3xl p-6">
        {configured ? (
          <LoginForm />
        ) : (
          <p className="text-sm text-muted">
            The database isn&rsquo;t connected yet. Add <code>SUPABASE_URL</code> and <code>SUPABASE_PUBLISHABLE_KEY</code> to{" "}
            <code>.env.local</code>, then restart the dev server.
          </p>
        )}
      </div>
    </div>
  );
}
