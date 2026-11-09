/**
 * Plain-English observations generated from real data. Each insight is only
 * produced when there's enough data to support it; nothing is filled in.
 */
import { WEEKDAY_NAMES, weekdayIndex } from "./dates";
import { type Summary, mileageBuckets, paceTrend, type Streaks } from "./stats";
import { type Activity } from "./types";
import { formatPace } from "./units";

export interface Insight {
  id: string;
  title: string;
  detail: string;
}

export function buildInsights(runs: Activity[], summary: Summary, s: Streaks): Insight[] {
  const out: Insight[] = [];
  if (runs.length === 0) return out;

  // Favorite day of the week (needs a handful of runs to mean anything).
  if (runs.length >= 5) {
    const counts = new Array(7).fill(0);
    for (const r of runs) counts[weekdayIndex(r.date)]++;
    const max = Math.max(...counts);
    const day = counts.indexOf(max);
    out.push({
      id: "weekday",
      title: `${WEEKDAY_NAMES[day]}s are your day`,
      detail: `${max} of ${runs.length} runs (${Math.round((max / runs.length) * 100)}%) happened on a ${WEEKDAY_NAMES[day]}.`,
    });
  }

  // Weekly consistency across the selected period.
  const weeks = mileageBuckets(runs, "week");
  if (weeks.length >= 4) {
    const active = weeks.filter((w) => w.runs > 0).length;
    out.push({
      id: "consistency",
      title: `${Math.round((active / weeks.length) * 100)}% of weeks had a run`,
      detail: `You ran in ${active} of ${weeks.length} weeks, with a longest stretch of ${s.longestWeeks} week${s.longestWeeks === 1 ? "" : "s"} in a row.`,
    });
  }

  if (s.longestDays >= 3) {
    out.push({
      id: "streak",
      title: `${s.longestDays}-day streak`,
      detail: `Your longest run of consecutive days with at least one run.`,
    });
  }

  // Pace change from first to most recent month with runs.
  const trend = paceTrend(runs);
  if (trend.length >= 2) {
    const first = trend[0];
    const last = trend[trend.length - 1];
    const diff = first.paceSPerMile - last.paceSPerMile;
    if (Math.abs(diff) >= 5) {
      out.push({
        id: "pace",
        title: diff > 0 ? `${formatPace(diff)}/mi faster` : `${formatPace(-diff)}/mi slower`,
        detail: `Average pace went from ${formatPace(first.paceSPerMile)}/mi in ${first.label} to ${formatPace(last.paceSPerMile)}/mi in ${last.label}.`,
      });
    }
  }

  // Biggest month.
  const months = mileageBuckets(runs, "month").filter((m) => m.runs > 0);
  if (months.length >= 2) {
    const top = months.reduce((a, b) => (b.miles > a.miles ? b : a));
    out.push({
      id: "biggest-month",
      title: `Biggest month: ${top.label}`,
      detail: `${top.miles.toFixed(1)} miles across ${top.runs} run${top.runs === 1 ? "" : "s"}.`,
    });
  }

  if (summary.runs >= 3) {
    out.push({
      id: "typical",
      title: `${summary.avgRunMiles.toFixed(1)} miles per run`,
      detail: `Your average run length over ${summary.runs} runs.`,
    });
  }

  return out;
}
