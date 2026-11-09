import Link from "next/link";
import { notFound } from "next/navigation";
import { ActivityForm } from "@/running/components/admin/activity-form";
import { DeleteButton } from "@/running/components/admin/delete-button";
import { removeActivity } from "@/running/server/actions";
import { getActivity } from "@/running/server/admin-repo";
import { requireAdmin } from "@/running/server/auth";
import { uuid } from "@/running/validation/forms";
import { AdminCard, AdminShell } from "../../admin-shell";

export default function EditActivityPage({ params }: PageProps<"/running/admin/activities/[id]">) {
  return (
    <AdminShell>
      <EditActivity params={params} />
    </AdminShell>
  );
}

async function EditActivity({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  const { id } = await params;
  if (!uuid.safeParse(id).success) notFound();
  const activity = await getActivity(admin, id);
  if (!activity) notFound();

  return (
    <div className="space-y-6">
      <Link href="/running/admin/activities" className="text-sm text-muted hover:text-text">
        ← All runs
      </Link>
      <h1 className="text-3xl font-medium tracking-tight">Edit run</h1>
      <AdminCard
        title={activity.source === "manual" ? "Manual entry" : "Imported from Strava"}
        action={<DeleteButton action={removeActivity} fields={{ id }} confirmText="Delete this run? This can't be undone." />}
      >
        <ActivityForm activity={activity} today={new Date().toISOString().slice(0, 10)} />
      </AdminCard>
    </div>
  );
}
