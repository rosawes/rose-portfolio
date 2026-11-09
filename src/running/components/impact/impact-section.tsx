import { lifetimeRaised } from "../../domain/fundraising";
import { formatRaised } from "../../domain/money";
import { type Campaign, type Contribution } from "../../domain/types";
import { EmptyState } from "../ui/empty-state";
import { CampaignCard } from "./campaign-card";

export function ImpactSection({ campaigns, contributions }: { campaigns: Campaign[]; contributions: Contribution[] }) {
  if (campaigns.length === 0) {
    return <EmptyState title="No fundraising campaigns yet" />;
  }
  const total = lifetimeRaised(campaigns, contributions);
  const completed = campaigns.filter((c) => c.status === "completed").length;

  return (
    <div className="space-y-6">
      <div className="glass flex flex-wrap items-center justify-between gap-6 rounded-3xl p-6 sm:p-8">
        <div>
          <p className="font-mono text-[11px] tracking-[0.16em] text-muted uppercase">Raised through running</p>
          <p className="mt-1 bg-gradient-to-r from-accent to-accent-2 bg-clip-text text-5xl font-medium tracking-[-0.04em] text-transparent tabular-nums sm:text-6xl">
            {formatRaised(total.cents, total.isMinimum)}
          </p>
        </div>
        <ol className="flex flex-wrap gap-3 text-sm" aria-label="Fundraising history">
          {campaigns.map((c) => (
            <li key={c.id} className="flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1.5">
              <span aria-hidden className={`size-2 rounded-full ${c.status === "completed" ? "bg-accent" : "border border-accent-2"}`} />
              {c.title}
            </li>
          ))}
        </ol>
        <p className="w-full text-sm text-muted">
          {completed} completed campaign{completed === 1 ? "" : "s"} · {campaigns.length - completed} upcoming. Donations go
          directly to each charity; this page only tracks them.
        </p>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        {campaigns.map((c) => (
          <CampaignCard key={c.id} campaign={c} contributions={contributions.filter((x) => x.campaignId === c.id)} />
        ))}
      </div>
    </div>
  );
}
