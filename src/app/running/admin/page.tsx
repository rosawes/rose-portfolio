import Link from "next/link";
import { formatRaised } from "@/running/domain/money";
import { formatMiles } from "@/running/domain/units";
import { listActivities, listCampaigns, listRaces } from "@/running/server/admin-repo";
import { requireAdmin } from "@/running/server/auth";
import { AdminShell } from "./admin-shell";

export default function AdminHome() {
  return (
    <AdminShell>
      <Overview />
    </AdminShell>
  );
}

async function Overview() {
  const admin = await requireAdmin();
  const [activities, races, campaigns] = await Promise.all([listActivities(admin), listRaces(admin), listCampaigns(admin)]);
  const counted = activities.filter((a) => !a.duplicate_of);
  const publicRuns = counted.filter((a) => a.visibility === "public");
  const meters = publicRuns.reduce((t, a) => t + Number(a.distance_m), 0);

  const cards = [
    { href: "/running/admin/activities", title: "Runs", value: `${counted.length}`, detail: `${formatMiles(meters)} public miles · ${counted.length - publicRuns.length} private`, cta: "Add a run" },
    { href: "/running/admin/races", title: "Races", value: `${races.length}`, detail: `${races.filter((r) => r.status === "completed").length} completed`, cta: "Manage races" },
    {
      href: "/running/admin/campaigns",
      title: "Fundraising",
      value: `${campaigns.length}`,
      detail: campaigns.map((c) => `${c.title}: ${formatRaised(Number(c.reported_raised_cents ?? 0), c.raised_is_minimum)}`).join(" · ") || "No campaigns",
      cta: "Manage campaigns",
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-medium tracking-tight">Welcome back</h1>
      <p className="mt-1 text-sm text-muted">Signed in as {admin.email}. Changes appear on the public page right after you save.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className="glass group rounded-3xl p-6 transition hover:-translate-y-0.5">
            <p className="font-mono text-[11px] tracking-[0.16em] text-muted uppercase">{c.title}</p>
            <p className="mt-2 text-4xl font-medium tracking-tight">{c.value}</p>
            <p className="mt-1 line-clamp-2 text-sm text-muted">{c.detail}</p>
            <p className="mt-4 text-sm text-accent">{c.cta} →</p>
          </Link>
        ))}
      </div>
      <p className="mt-8 rounded-2xl bg-surface p-4 text-sm text-muted">
        Strava import isn&rsquo;t connected yet. When it is, imported runs that match runs you logged here will be linked
        automatically so nothing is counted twice.
      </p>
    </div>
  );
}
