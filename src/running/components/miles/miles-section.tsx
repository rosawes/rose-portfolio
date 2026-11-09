"use client";

import { useMemo, useState } from "react";
import { formatLongDate, yearOf } from "../../domain/dates";
import { buildInsights } from "../../domain/insights";
import { longestRuns, milestones, personalBests } from "../../domain/records";
import {
  type BucketUnit,
  dailyTotals,
  mileageBuckets,
  paceTrend,
  selectRuns,
  streaks,
  summarize,
  yearsWithRuns,
} from "../../domain/stats";
import { type Activity, type Race, SPORT_TYPE_LABELS } from "../../domain/types";
import { formatDuration, formatMiles, formatPace, metersToMiles, pacePerMile } from "../../domain/units";
import { EmptyState } from "../ui/empty-state";
import { Stat } from "../ui/stat";
import { useToday } from "../ui/use-today";
import { CalendarHeatmap } from "./calendar-heatmap";
import { MileageChart } from "./mileage-chart";
import { PaceChart } from "./pace-chart";

type Filter = { kind: "all" } | { kind: "year"; year: number } | { kind: "range"; from: string; to: string };

const UNIT_LABELS: Record<BucketUnit, string> = { week: "Weekly", month: "Monthly", year: "Yearly" };

export function MilesSection({ activities, races }: { activities: Activity[]; races: Race[] }) {
  const today = useToday();
  const allRuns = useMemo(() => selectRuns(activities), [activities]);
  const years = useMemo(() => yearsWithRuns(activities), [activities]);

  const [filter, setFilter] = useState<Filter>({ kind: "all" });
  const [unit, setUnit] = useState<BucketUnit>("month");
  const [heatYear, setHeatYear] = useState<number | null>(null);

  const range = filter.kind === "year"
    ? { from: `${filter.year}-01-01`, to: `${filter.year}-12-31` }
    : filter.kind === "range"
      ? { from: filter.from || null, to: filter.to || null }
      : {};

  const runs = useMemo(() => selectRuns(activities, range), [activities, range.from, range.to]); // eslint-disable-line react-hooks/exhaustive-deps
  const summary = useMemo(() => summarize(runs), [runs]);
  const days = useMemo(() => dailyTotals(allRuns), [allRuns]);
  const buckets = useMemo(
    () => mileageBuckets(runs, unit, filter.kind === "year" ? range : {}),
    [runs, unit, filter.kind, range.from, range.to], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const pace = useMemo(() => paceTrend(runs), [runs]);
  const s = useMemo(() => streaks(runs, today ?? "1970-01-01"), [runs, today]);
  const insights = useMemo(() => buildInsights(runs, summary, s), [runs, summary, s]);
  const pbs = useMemo(() => personalBests(runs, races), [runs, races]);
  const longest = useMemo(() => longestRuns(runs, 5), [runs]);
  const lifetime = useMemo(() => milestones(allRuns), [allRuns]);

  if (allRuns.length === 0) {
    return (
      <EmptyState title="No runs logged yet">
        Runs appear here as soon as they&rsquo;re added. Every number on this page comes from real logged runs.
      </EmptyState>
    );
  }

  const shownHeatYear = heatYear ?? (filter.kind === "year" ? filter.year : years[0]);
  const filterLabel =
    filter.kind === "all" ? "All time" : filter.kind === "year" ? String(filter.year) : "Custom range";

  return (
    <div className="space-y-6">
      {/* ── Filters ── */}
      <div className="glass flex flex-wrap items-center gap-2 rounded-2xl p-2" role="group" aria-label="Filter runs">
        <FilterChip active={filter.kind === "all"} onClick={() => setFilter({ kind: "all" })}>
          All time
        </FilterChip>
        {years.map((y) => (
          <FilterChip
            key={y}
            active={filter.kind === "year" && filter.year === y}
            onClick={() => {
              setFilter({ kind: "year", year: y });
              setHeatYear(null);
            }}
          >
            {y}
          </FilterChip>
        ))}
        <FilterChip
          active={filter.kind === "range"}
          onClick={() => setFilter({ kind: "range", from: allRuns[0].date, to: allRuns[allRuns.length - 1].date })}
        >
          Custom range
        </FilterChip>
        {filter.kind === "range" ? (
          <div className="flex flex-wrap items-center gap-2 px-2 text-sm">
            <label className="flex items-center gap-1.5">
              <span className="text-muted">From</span>
              <input
                type="date"
                value={filter.from}
                max={filter.to}
                onChange={(e) => setFilter({ ...filter, from: e.target.value })}
                className="rounded-lg border border-border bg-white px-2 py-1"
              />
            </label>
            <label className="flex items-center gap-1.5">
              <span className="text-muted">To</span>
              <input
                type="date"
                value={filter.to}
                min={filter.from}
                onChange={(e) => setFilter({ ...filter, to: e.target.value })}
                className="rounded-lg border border-border bg-white px-2 py-1"
              />
            </label>
          </div>
        ) : null}
      </div>

      {runs.length === 0 ? (
        <EmptyState title={`No runs in ${filterLabel.toLowerCase()}`}>Try a different year or range.</EmptyState>
      ) : (
        <>
          {/* ── Headline numbers ── */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat label="Miles" value={formatMiles(summary.distanceM)} hint={filterLabel} />
            <Stat label="Runs" value={summary.runs.toLocaleString("en-US")} hint={`${summary.activeDays} active days`} />
            <Stat label="Avg pace" value={formatPace(summary.avgPaceSPerMile)} unit="/mi" hint="Moving time ÷ miles" />
            <Stat
              label="Time moving"
              value={formatDuration(summary.movingS)}
              hint={today ? `Current streak: ${streaks(allRuns, today).currentDays} days` : " "}
            />
          </div>

          {/* ── Heatmap ── */}
          <Card title="Every day I ran" action={
            years.length > 1 ? (
              <select
                aria-label="Heatmap year"
                value={shownHeatYear}
                onChange={(e) => setHeatYear(Number(e.target.value))}
                className="rounded-lg border border-border bg-white px-2 py-1 text-sm"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            ) : null
          }>
            <CalendarHeatmap year={shownHeatYear} days={days} />
          </Card>

          {/* ── Mileage ── */}
          <Card
            title={`${UNIT_LABELS[unit]} mileage`}
            action={
              <div className="flex rounded-xl bg-surface-2 p-1" role="group" aria-label="Group mileage by">
                {(["week", "month", "year"] as const).map((u) => (
                  <button
                    key={u}
                    type="button"
                    aria-pressed={unit === u}
                    onClick={() => setUnit(u)}
                    className={`rounded-lg px-3 py-1 text-sm transition ${unit === u ? "bg-white text-text shadow-sm" : "text-muted hover:text-text"}`}
                  >
                    {UNIT_LABELS[u]}
                  </button>
                ))}
              </div>
            }
          >
            <MileageChart key={`${unit}-${filterLabel}`} buckets={buckets} />
          </Card>

          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            {/* ── Pace ── */}
            <Card title="Pace progression">
              {pace.length >= 2 ? (
                <PaceChart key={filterLabel} points={pace} />
              ) : (
                <p className="py-10 text-center text-sm text-muted">Pace trends appear once there are runs in at least two months.</p>
              )}
            </Card>

            {/* ── Insights ── */}
            <Card title="What the data says">
              {insights.length ? (
                <ul className="space-y-4">
                  {insights.map((i) => (
                    <li key={i.id} className="flex gap-3">
                      <span aria-hidden className="mt-1.5 size-2 shrink-0 rounded-full bg-accent-2" />
                      <div>
                        <p className="font-medium">{i.title}</p>
                        <p className="text-sm text-muted">{i.detail}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted">Insights appear as more runs are logged.</p>
              )}
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* ── Longest runs ── */}
            <Card title="Longest runs">
              <ol className="space-y-3">
                {longest.map((r, i) => (
                  <li key={r.id} className="flex items-baseline justify-between gap-3">
                    <span className="flex items-baseline gap-3">
                      <span className="font-mono text-xs text-muted">{i + 1}</span>
                      <span>
                        <span className="font-medium">{formatMiles(r.distanceM, 2)} mi</span>
                        <span className="block text-xs text-muted">
                          {formatLongDate(r.date)} · {SPORT_TYPE_LABELS[r.sportType]}
                        </span>
                      </span>
                    </span>
                    <span className="font-mono text-xs text-muted tabular-nums">
                      {formatPace(pacePerMile(r.distanceM, r.movingS))}/mi
                    </span>
                  </li>
                ))}
              </ol>
            </Card>

            {/* ── Personal records ── */}
            <Card title="Personal records">
              {pbs.length ? (
                <ul className="space-y-3">
                  {pbs.map((p) => (
                    <li key={p.key} className="flex items-baseline justify-between gap-3">
                      <span>
                        <span className="font-medium">{p.label}</span>
                        <span className="block text-xs text-muted">
                          {p.source === "race" ? "Official race time" : "Fastest logged run"}
                          {p.date ? ` · ${formatLongDate(p.date)}` : ""}
                        </span>
                      </span>
                      <span className="text-right font-mono text-sm tabular-nums">
                        {p.isPlaceholder ? "~" : ""}
                        {formatDuration(p.timeS)}
                        {p.isPlaceholder ? <span className="block text-[10px] text-muted">approximate</span> : null}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted">Records appear once there are runs near 5K, 10K, half, or full marathon distance.</p>
              )}
            </Card>

            {/* ── Milestones ── */}
            <Card title="Lifetime milestones">
              <p className="text-3xl font-medium tracking-tight tabular-nums">
                {formatMiles(allRuns.reduce((t, r) => t + r.distanceM, 0))}
                <span className="ml-1 text-base text-muted">lifetime mi</span>
              </p>
              {lifetime.next ? (
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-muted">
                    <span>Next: {lifetime.next.miles.toLocaleString("en-US")} mi</span>
                    <span>{lifetime.next.remainingMiles.toFixed(1)} to go</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-2">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-accent-soft to-accent"
                      style={{ width: `${Math.max(2, (1 - lifetime.next.remainingMiles / lifetime.next.miles) * 100)}%` }}
                    />
                  </div>
                </div>
              ) : null}
              {lifetime.reached.length ? (
                <ul className="mt-4 space-y-1.5 text-sm">
                  {lifetime.reached.map((m) => (
                    <li key={m.miles} className="flex justify-between">
                      <span>{m.miles.toLocaleString("en-US")} miles</span>
                      <span className="text-muted">{formatLongDate(m.date)}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              <p className="mt-4 text-xs text-muted">
                {metersToMiles(allRuns.reduce((t, r) => t + r.distanceM, 0)) < 100
                  ? "The first milestone is 100 miles."
                  : `First run logged ${formatLongDate(allRuns[0].date)} (${yearOf(allRuns[0].date)}).`}
              </p>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-xl px-3.5 py-1.5 text-sm transition ${active ? "bg-accent text-white" : "text-muted hover:bg-surface-2 hover:text-text"}`}
    >
      {children}
    </button>
  );
}

function Card({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="glass rounded-3xl p-5 sm:p-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-medium tracking-tight">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}
