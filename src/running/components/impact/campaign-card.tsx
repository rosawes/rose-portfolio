"use client";

import { breakdown, campaignProgress } from "../../domain/fundraising";
import { formatCents, formatRaised } from "../../domain/money";
import { type Campaign, type Contribution } from "../../domain/types";
import { useMounted } from "../ui/use-today";
import { BreakdownDonut } from "./breakdown-donut";

export function CampaignCard({ campaign, contributions }: { campaign: Campaign; contributions: Contribution[] }) {
  const mounted = useMounted();
  const p = campaignProgress(campaign, contributions);
  const slices = breakdown(contributions);
  const approximate = contributions.some((c) => c.isApproximate);

  const badge =
    campaign.status === "completed"
      ? p.goalMet
        ? "Completed · goal exceeded"
        : "Completed"
      : campaign.status === "active"
        ? "Active"
        : campaign.isConfirmed
          ? "Planned"
          : "Planned · not yet confirmed";

  return (
    <article className="glass overflow-hidden rounded-3xl">
      <div className="p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-2xl font-medium tracking-tight">{campaign.title}</h3>
            {campaign.charityName ? (
              <p className="mt-1 text-sm text-muted">
                {campaign.charityName}
                {campaign.charityTeam ? ` · ${campaign.charityTeam}` : ""}
              </p>
            ) : (
              <p className="mt-1 text-sm text-muted">Charity to be announced</p>
            )}
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs ${campaign.status === "completed" ? "bg-accent text-white" : "border border-dashed border-accent-2 text-accent"}`}
          >
            {badge}
          </span>
        </div>

        {/* Big numbers */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div>
            <p className="font-mono text-[11px] tracking-[0.14em] text-muted uppercase">Raised</p>
            <p className="mt-1 text-3xl font-medium tracking-[-0.03em] tabular-nums sm:text-4xl">
              {formatRaised(p.raisedCents, p.isMinimum)}
            </p>
          </div>
          <div>
            <p className="font-mono text-[11px] tracking-[0.14em] text-muted uppercase">Goal</p>
            <p className="mt-1 text-3xl font-medium tracking-[-0.03em] text-muted tabular-nums sm:text-4xl">
              {formatCents(campaign.goalCents)}
            </p>
          </div>
          <div>
            <p className="font-mono text-[11px] tracking-[0.14em] text-muted uppercase">Remaining</p>
            <p className="mt-1 text-3xl font-medium tracking-[-0.03em] text-muted tabular-nums sm:text-4xl">
              {formatCents(p.remainingCents)}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-6">
          <div
            className="h-3 overflow-hidden rounded-full bg-surface-2"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={p.barPercent}
            aria-label={`${p.percentOfGoal}% of goal`}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent-soft via-accent-2 to-accent transition-[width] duration-[1400ms] ease-out"
              style={{ width: mounted ? `${p.barPercent}%` : "0%" }}
            />
          </div>
          <p className="mt-2 text-sm text-muted">
            <span className="font-medium text-text">
              {p.percentOfGoal}%{p.isMinimum ? "+" : ""}
            </span>{" "}
            of goal
            {p.goalMet && p.raisedCents > campaign.goalCents
              ? ` · ${formatRaised(p.raisedCents - campaign.goalCents, p.isMinimum)} over`
              : ""}
          </p>
        </div>

        {campaign.story ? <p className="mt-6 leading-relaxed whitespace-pre-line text-muted">{campaign.story}</p> : null}

        {campaign.donationUrl ? (
          <a
            href={campaign.donationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90"
          >
            Official donation page <span aria-hidden>↗</span>
          </a>
        ) : null}
      </div>

      {/* Breakdown */}
      <div className="border-t border-border bg-white/50 p-6 sm:p-8">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h4 className="font-medium">Where the money came from</h4>
          {approximate ? <span className="text-xs text-muted">Approximate amounts</span> : null}
        </div>
        {slices.length ? (
          <>
            <BreakdownDonut slices={slices} approximate={approximate} />
            {p.isMinimum ? (
              <p className="mt-4 text-xs text-muted">
                The total raised was over {formatCents(p.raisedCents)}; this breakdown is an approximate split of {formatCents(p.contributionsTotalCents)}.
              </p>
            ) : null}
          </>
        ) : (
          <p className="rounded-2xl bg-surface p-4 text-sm text-muted">
            {campaign.status === "planned" ? "Fundraising hasn't started yet." : "No breakdown recorded yet."}
          </p>
        )}
      </div>
    </article>
  );
}
