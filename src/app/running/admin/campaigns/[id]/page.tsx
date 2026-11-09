import Link from "next/link";
import { notFound } from "next/navigation";
import { formatCents } from "@/running/domain/money";
import { CampaignForm } from "@/running/components/admin/campaign-form";
import { ContributionForm } from "@/running/components/admin/contribution-form";
import { DeleteButton } from "@/running/components/admin/delete-button";
import { removeCampaign, removeContribution } from "@/running/server/actions";
import { getCampaign, listContributions, listRaces } from "@/running/server/admin-repo";
import { requireAdmin } from "@/running/server/auth";
import { uuid } from "@/running/validation/forms";
import { AdminCard, AdminShell } from "../../admin-shell";

export default function EditCampaignPage({ params }: PageProps<"/running/admin/campaigns/[id]">) {
  return (
    <AdminShell>
      <EditCampaign params={params} />
    </AdminShell>
  );
}

async function EditCampaign({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  const { id } = await params;
  if (!uuid.safeParse(id).success) notFound();
  const [campaign, contributions, races] = await Promise.all([getCampaign(admin, id), listContributions(admin, id), listRaces(admin)]);
  if (!campaign) notFound();
  const total = contributions.reduce((t, c) => t + Number(c.amount_cents), 0);

  return (
    <div className="space-y-6">
      <Link href="/running/admin/campaigns" className="text-sm text-muted hover:text-text">
        ← All campaigns
      </Link>
      <h1 className="text-3xl font-medium tracking-tight">{campaign.title}</h1>

      <AdminCard
        title={`Donations & fundraising sources (${formatCents(total)} total)`}
      >
        <p className="mb-4 text-sm text-muted">
          These make up the “where the money came from” chart. Labels, amounts, and categories are public; notes are private.
        </p>
        <div className="space-y-3">
          {contributions.map((c) => (
            <div key={c.id} className="space-y-2">
              <ContributionForm campaignId={id} contribution={c} />
              <div className="flex justify-end">
                <DeleteButton
                  action={removeContribution}
                  fields={{ id: c.id, campaignId: id }}
                  label="Remove"
                  confirmText={`Remove this ${formatCents(Number(c.amount_cents))} entry?`}
                />
              </div>
            </div>
          ))}
          <p className="pt-2 text-sm font-medium">Add a donation or fundraising activity</p>
          <ContributionForm campaignId={id} />
        </div>
      </AdminCard>

      <AdminCard
        title="Campaign details"
        action={<DeleteButton action={removeCampaign} fields={{ id }} confirmText="Delete this campaign and all of its donations? This can't be undone." />}
      >
        <CampaignForm campaign={campaign} races={races} />
      </AdminCard>
    </div>
  );
}
