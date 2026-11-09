import Link from "next/link";
import { formatDuration } from "@/running/domain/units";
import { RaceForm } from "@/running/components/admin/race-form";
import { listRaces } from "@/running/server/admin-repo";
import { requireAdmin } from "@/running/server/auth";
import { AdminCard, AdminShell } from "../admin-shell";

export default function RacesPage() {
  return (
    <AdminShell>
      <Races />
    </AdminShell>
  );
}

async function Races() {
  const admin = await requireAdmin();
  const races = await listRaces(admin);
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-medium tracking-tight">Races</h1>
      <AdminCard title={`Your races (${races.length})`}>
        {races.length === 0 ? (
          <p className="text-sm text-muted">No races yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {races.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-medium">
                    {r.name} {r.race_year}
                  </p>
                  <p className="text-sm text-muted">
                    {r.status[0].toUpperCase() + r.status.slice(1)}
                    {r.official_time_s ? ` · ${r.time_is_placeholder ? "~" : ""}${formatDuration(r.official_time_s)}` : ""}
                    {r.time_is_placeholder ? " (approximate)" : ""}
                    {r.is_public ? "" : " · hidden"}
                  </p>
                </div>
                <Link href={`/running/admin/races/${r.id}`} className="text-sm text-accent hover:underline">
                  Edit
                </Link>
              </li>
            ))}
          </ul>
        )}
      </AdminCard>
      <AdminCard title="Add a race">
        <RaceForm />
      </AdminCard>
    </div>
  );
}
