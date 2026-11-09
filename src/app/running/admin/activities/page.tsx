import Link from "next/link";
import { formatLongDate } from "@/running/domain/dates";
import { SPORT_TYPE_LABELS } from "@/running/domain/types";
import { formatDuration, formatMiles, formatPace, pacePerMile } from "@/running/domain/units";
import { ActivityForm } from "@/running/components/admin/activity-form";
import { listActivities } from "@/running/server/admin-repo";
import { requireAdmin } from "@/running/server/auth";
import { AdminCard, AdminShell } from "../admin-shell";

export default function ActivitiesPage() {
  return (
    <AdminShell>
      <Activities />
    </AdminShell>
  );
}

async function Activities() {
  const admin = await requireAdmin();
  const activities = await listActivities(admin);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-medium tracking-tight">Runs</h1>
      <AdminCard title="Add a run">
        <ActivityForm today={today} />
      </AdminCard>

      <AdminCard title={`All runs (${activities.length})`}>
        {activities.length === 0 ? (
          <p className="text-sm text-muted">No runs yet. Add your first one above.</p>
        ) : (
          <div className="-mx-2 overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="text-left font-mono text-[11px] tracking-wider text-muted uppercase">
                  <th className="px-2 py-2 font-normal">Date</th>
                  <th className="px-2 py-2 font-normal">Type</th>
                  <th className="px-2 py-2 text-right font-normal">Miles</th>
                  <th className="px-2 py-2 text-right font-normal">Moving</th>
                  <th className="px-2 py-2 text-right font-normal">Pace</th>
                  <th className="px-2 py-2 font-normal">Visibility</th>
                  <th className="px-2 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {activities.map((a) => (
                  <tr key={a.id} className={a.duplicate_of ? "opacity-50" : ""}>
                    <td className="px-2 py-2.5">
                      {formatLongDate(a.local_date)}
                      {a.name ? <span className="block text-xs text-muted">{a.name}</span> : null}
                    </td>
                    <td className="px-2 py-2.5">{SPORT_TYPE_LABELS[a.sport_type]}</td>
                    <td className="px-2 py-2.5 text-right tabular-nums">{formatMiles(Number(a.distance_m), 2)}</td>
                    <td className="px-2 py-2.5 text-right tabular-nums">{formatDuration(a.moving_s)}</td>
                    <td className="px-2 py-2.5 text-right tabular-nums">{formatPace(pacePerMile(Number(a.distance_m), a.moving_s))}/mi</td>
                    <td className="px-2 py-2.5 text-xs text-muted">
                      {a.duplicate_of ? "Duplicate (not counted)" : a.visibility === "public" ? "Public" : "Private"}
                      {a.source !== "manual" ? " · Strava" : ""}
                    </td>
                    <td className="px-2 py-2.5 text-right">
                      <Link href={`/running/admin/activities/${a.id}`} className="text-accent hover:underline">
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    </div>
  );
}
