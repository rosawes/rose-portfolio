import Link from "next/link";
import { formatCents, formatRaised } from "@/running/domain/money";
import { CampaignForm } from "@/running/components/admin/campaign-form";
import { listCampaigns, listContributions, listRaces } from "@/running/server/admin-repo";
import { requireAdmin } from "@/running/server/auth";
import { AdminCard, AdminShell } from "../admin-shell";

export default function CampaignsPage() {
  return (
    <AdminShell>
      <Campaigns />
    </AdminShell>
  );
}

async function Campaigns() {
  const admin = await requireAdmin();
  const [campaigns, contributions, races] = await Promise.all([listCampaigns(admin), listContributions(admin), listRaces(admin)]);
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-medium tracking-tight">Fundraising</h1>
      <AdminCard title={`Campaigns (${campaigns.length})`}>
        {campaigns.length === 0 ? (
          <p className="text-sm text-muted">No campaigns yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {campaigns.map((c) => {
              const sum = contributions.filter((x) => x.campaign_id === c.id).reduce((t, x) => t + Number(x.amount_cents), 0);
              const raised = c.reported_raised_cents != null ? Number(c.reported_raised_cents) : sum;
              return (
                <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div>
                    <p className="font-medium">{c.title}</p>
                    <p className="text-sm text-muted">
                      {formatRaised(raised, c.raised_is_minimum && c.reported_raised_cents != null)} of {formatCents(Number(c.goal_cents))} ·{" "}
                      {c.status}
                      {c.is_confirmed ? "" : " · not confirmed"}
                    </p>
                  </div>
                  <Link href={`/running/admin/campaigns/${c.id}`} className="text-sm text-accent hover:underline">
                    Edit & donations
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </AdminCard>
      <AdminCard title="New campaign">
        <CampaignForm races={races} />
      </AdminCard>
    </div>
  );
}
