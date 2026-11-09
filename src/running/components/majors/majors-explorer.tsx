"use client";

import { useState } from "react";
import { formatLongDate } from "../../domain/dates";
import { campaignProgress } from "../../domain/fundraising";
import { MAJORS } from "../../domain/majors";
import { formatRaised } from "../../domain/money";
import { type Campaign, type Contribution, type MajorSlug, type Race } from "../../domain/types";
import { formatDuration } from "../../domain/units";

export type MajorState = "completed" | "upcoming" | "none";

function stateFor(races: Race[]): MajorState {
  if (races.some((r) => r.status === "completed")) return "completed";
  if (races.some((r) => r.status === "planned" || r.status === "registered")) return "upcoming";
  return "none";
}

const STATUS_TEXT: Record<Race["status"], string> = {
  planned: "Planned",
  registered: "Registered",
  completed: "Completed",
  dns: "Did not start",
  dnf: "Did not finish",
};

export function MajorsExplorer({
  map,
  pins,
  races,
  campaigns,
  contributions,
}: {
  map: React.ReactNode;
  pins: Record<MajorSlug, { x: number; y: number }>;
  races: Race[];
  campaigns: Campaign[];
  contributions: Contribution[];
}) {
  const byMajor = Object.fromEntries(
    MAJORS.map((m) => [m.slug, races.filter((r) => r.major === m.slug).sort((a, b) => b.year - a.year)]),
  ) as Record<MajorSlug, Race[]>;
  const states = Object.fromEntries(MAJORS.map((m) => [m.slug, stateFor(byMajor[m.slug])])) as Record<MajorSlug, MajorState>;
  const completedCount = MAJORS.filter((m) => states[m.slug] === "completed").length;

  const firstInteresting = MAJORS.find((m) => states[m.slug] === "completed") ?? MAJORS.find((m) => states[m.slug] === "upcoming");
  const [selected, setSelected] = useState<MajorSlug>(firstInteresting?.slug ?? "nyc");
  const major = MAJORS.find((m) => m.slug === selected)!;
  const selectedRaces = byMajor[selected];

  // Tracker order tells the story: finished Majors first, then planned ones, then the rest.
  const rank = { completed: 0, upcoming: 1, none: 2 } as const;
  const trackerOrder = [...MAJORS].sort((a, b) => rank[states[a.slug]] - rank[states[b.slug]]);

  const nycFinishes = byMajor.nyc.filter((r) => r.status === "completed").map((r) => r.year).sort();

  return (
    <div className="space-y-6">
      {/* ── Completion tracker ── */}
      <div className="glass rounded-3xl p-5 sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] tracking-[0.16em] text-muted uppercase">World Marathon Majors</p>
            <p className="mt-1 text-4xl font-medium tracking-[-0.03em] tabular-nums">
              {completedCount}
              <span className="text-muted"> / 7</span>
              <span className="ml-2 text-base font-normal text-muted">completed</span>
            </p>
          </div>
          {nycFinishes.length ? (
            <p className="text-sm text-muted">
              NYC every year: <span className="font-medium text-text">{nycFinishes.join(" · ")}</span>
            </p>
          ) : null}
        </div>
        <ol className="relative mt-6 grid grid-cols-7 gap-1" aria-label="Majors progress">
          <div aria-hidden className="absolute top-1/2 right-[7%] left-[7%] h-0.5 -translate-y-1/2 bg-border sm:top-[22px]" />
          <div
            aria-hidden
            className="absolute top-1/2 left-[7%] h-0.5 -translate-y-1/2 bg-gradient-to-r from-accent-soft to-accent transition-[width] duration-1000 sm:top-[22px]"
            style={{ width: `${(Math.max(0, completedCount - 1) / 6) * 86}%` }}
          />
          {trackerOrder.map((m) => {
            const st = states[m.slug];
            return (
              <li key={m.slug} className="relative flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => setSelected(m.slug)}
                  aria-label={`${m.name}: ${st === "completed" ? "completed" : st === "upcoming" ? "planned" : "not yet run"}`}
                  aria-pressed={selected === m.slug}
                  className={`relative grid size-9 place-items-center rounded-full text-xs font-semibold transition sm:size-11 ${
                    st === "completed"
                      ? "bg-accent text-white shadow-[0_0_24px_-4px_var(--accent-2)]"
                      : st === "upcoming"
                        ? "border-2 border-dashed border-accent-2 bg-white text-accent"
                        : "border border-border bg-white text-muted"
                  } ${selected === m.slug ? "ring-2 ring-accent ring-offset-2" : ""}`}
                >
                  {st === "completed" ? "✓" : m.city.slice(0, 2).toUpperCase()}
                </button>
                <span className="mt-2 hidden text-center text-xs text-muted sm:block">{m.city}</span>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* ── Map ── */}
        <div className="glass relative overflow-hidden rounded-3xl p-3 sm:p-5">
          <div className="relative">
            {map}
            {MAJORS.map((m) => {
              const p = pins[m.slug];
              const st = states[m.slug];
              const isSel = selected === m.slug;
              return (
                <button
                  key={m.slug}
                  type="button"
                  onClick={() => setSelected(m.slug)}
                  aria-label={`Show ${m.name}`}
                  aria-pressed={isSel}
                  className={`group absolute -translate-x-1/2 -translate-y-1/2 p-2 ${isSel ? "z-20" : "hover:z-30"}`}
                  style={{ left: `${p.x}%`, top: `${p.y}%` }}
                >
                  {st === "completed" ? (
                    <span aria-hidden className="absolute inset-0 m-auto size-4 animate-ping rounded-full bg-accent-2/40" />
                  ) : null}
                  <span
                    aria-hidden
                    className={`relative block rounded-full transition-transform group-hover:scale-125 ${isSel ? "scale-125" : ""} ${
                      st === "completed"
                        ? "size-3.5 bg-accent ring-2 ring-white"
                        : st === "upcoming"
                          ? "size-3.5 border-2 border-accent-2 bg-white"
                          : "size-2.5 bg-muted/50 ring-2 ring-white"
                    }`}
                  />
                  <span
                    className={`absolute top-1/2 left-full z-10 -translate-y-1/2 rounded-md px-1.5 py-0.5 text-[11px] whitespace-nowrap ${
                      isSel ? "bg-text text-white" : "hidden bg-white text-text shadow-sm group-hover:block group-focus-visible:block"
                    }`}
                  >
                    {m.city}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mt-2 flex flex-wrap gap-4 px-1 text-xs text-muted" aria-hidden>
            <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-accent" /> Completed</span>
            <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full border-2 border-accent-2" /> Planned</span>
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-muted/50" /> Not yet</span>
          </div>
        </div>

        {/* ── Detail panel ── */}
        <div className="glass rounded-3xl p-5 sm:p-7" aria-live="polite">
          <p className="font-mono text-[11px] tracking-[0.16em] text-accent uppercase">
            {major.city}, {major.country}
          </p>
          <h3 className="mt-2 text-2xl font-medium tracking-tight">{major.name}</h3>
          <p className="mt-1 text-sm text-muted">Usually held in {major.usualMonth}.</p>

          {selectedRaces.length === 0 ? (
            <p className="mt-6 rounded-2xl bg-surface p-4 text-sm text-muted">Not on the calendar yet. One day.</p>
          ) : (
            <ul className="mt-6 space-y-4">
              {selectedRaces.map((r) => {
                const campaign = campaigns.find((c) => c.raceId === r.id);
                const progress = campaign
                  ? campaignProgress(campaign, contributions.filter((x) => x.campaignId === campaign.id))
                  : null;
                return (
                  <li key={r.id} className="rounded-2xl border border-border bg-white/70 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium">{r.year}</p>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs ${
                          r.status === "completed" ? "bg-accent text-white" : "border border-accent-2/50 text-accent"
                        }`}
                      >
                        {STATUS_TEXT[r.status]}
                        {r.status === "planned" ? " · not yet confirmed" : ""}
                      </span>
                    </div>
                    {r.status === "completed" && r.officialTimeS ? (
                      <p className="mt-3">
                        <span className="text-3xl font-medium tracking-tight tabular-nums">
                          {r.timeIsPlaceholder ? "~" : ""}
                          {formatDuration(r.officialTimeS)}
                        </span>
                        <span className="ml-2 text-sm text-muted">
                          {r.timeIsPlaceholder ? "approximate, official time coming" : "official time"}
                        </span>
                      </p>
                    ) : null}
                    {r.goalTimeS && r.status !== "completed" ? (
                      <p className="mt-2 text-sm text-muted">Goal: {formatDuration(r.goalTimeS)}</p>
                    ) : null}
                    {r.date ? <p className="mt-2 text-sm text-muted">{formatLongDate(r.date)}</p> : null}
                    {progress && campaign ? (
                      <p className="mt-2 text-sm">
                        <a href="#impact" className="text-accent underline decoration-accent-soft underline-offset-4 hover:decoration-accent">
                          {campaign.status === "planned"
                            ? `Fundraising goal: ${formatRaised(campaign.goalCents, false)}`
                            : `Raised ${formatRaised(progress.raisedCents, progress.isMinimum)}${campaign.charityTeam ? ` with ${campaign.charityTeam}` : ""}`}
                        </a>
                      </p>
                    ) : null}
                    {r.story ? <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-muted">{r.story}</p> : null}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
