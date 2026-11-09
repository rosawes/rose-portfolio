import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteButton } from "@/running/components/admin/delete-button";
import { RaceForm } from "@/running/components/admin/race-form";
import { removeRace } from "@/running/server/actions";
import { getRace } from "@/running/server/admin-repo";
import { requireAdmin } from "@/running/server/auth";
import { uuid } from "@/running/validation/forms";
import { AdminCard, AdminShell } from "../../admin-shell";

export default function EditRacePage({ params }: PageProps<"/running/admin/races/[id]">) {
  return (
    <AdminShell>
      <EditRace params={params} />
    </AdminShell>
  );
}

async function EditRace({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  const { id } = await params;
  if (!uuid.safeParse(id).success) notFound();
  const race = await getRace(admin, id);
  if (!race) notFound();
  return (
    <div className="space-y-6">
      <Link href="/running/admin/races" className="text-sm text-muted hover:text-text">
        ← All races
      </Link>
      <h1 className="text-3xl font-medium tracking-tight">
        {race.name} {race.race_year}
      </h1>
      <AdminCard
        title="Edit race"
        action={<DeleteButton action={removeRace} fields={{ id }} confirmText="Delete this race? Any linked campaign stays but loses its race link." />}
      >
        <RaceForm race={race} />
      </AdminCard>
    </div>
  );
}
