"use client";

import { useMemo, useState } from "react";
import { addDays, formatLongDate, monthShortName, startOfWeek } from "../../domain/dates";
import { type DayTotal } from "../../domain/stats";
import { metersToMiles } from "../../domain/units";
import { ChartTooltip } from "../ui/tooltip";

const CELL = 12;
const GAP = 3;
const STEP = CELL + GAP;
const LEFT = 28;
const TOP = 18;

/** Mileage → intensity level 0–4. Fixed thresholds so colors mean the same thing every year. */
function level(miles: number): number {
  if (miles <= 0) return 0;
  if (miles < 3) return 1;
  if (miles < 6) return 2;
  if (miles < 10) return 3;
  return 4;
}
const FILLS = ["var(--surface-2)", "#fbcfe8", "#f9a8d4", "#ec4899", "#be185d"];

export function CalendarHeatmap({ year, days }: { year: number; days: Map<string, DayTotal> }) {
  const [hover, setHover] = useState<{ date: string; x: number; y: number } | null>(null);

  const { cells, weeks, monthLabels, activeDays, totalMiles } = useMemo(() => {
    const first = `${year}-01-01`;
    const last = `${year}-12-31`;
    const start = startOfWeek(first);
    const cells: { date: string; col: number; row: number; miles: number; runs: number }[] = [];
    const monthLabels: { label: string; col: number }[] = [];
    let col = 0;
    let activeDays = 0;
    let totalMiles = 0;
    for (let weekStart = start; weekStart <= last; weekStart = addDays(weekStart, 7), col++) {
      for (let row = 0; row < 7; row++) {
        const date = addDays(weekStart, row);
        if (date < first || date > last) continue;
        const t = days.get(date);
        const miles = t ? metersToMiles(t.distanceM) : 0;
        if (t) {
          activeDays++;
          totalMiles += miles;
        }
        cells.push({ date, col, row, miles, runs: t?.runs ?? 0 });
        if (date.endsWith("-01")) monthLabels.push({ label: monthShortName(Number(date.slice(5, 7)) - 1), col });
      }
    }
    return { cells, weeks: col, monthLabels, activeDays, totalMiles };
  }, [year, days]);

  const width = LEFT + weeks * STEP;
  const height = TOP + 7 * STEP;
  const hovered = hover ? cells.find((c) => c.date === hover.date) : null;

  return (
    <div>
      <div className="relative -mx-1 overflow-x-auto px-1 pb-2">
        <div className="relative" style={{ minWidth: width }}>
          <svg
            viewBox={`0 0 ${width} ${height}`}
            width="100%"
            role="img"
            aria-label={`${activeDays} days with runs in ${year}, ${totalMiles.toFixed(1)} miles total`}
            onMouseLeave={() => setHover(null)}
          >
            {monthLabels.map((m) => (
              <text key={m.label} x={LEFT + m.col * STEP} y={11} className="fill-muted text-[10px]">
                {m.label}
              </text>
            ))}
            {["Mon", "Wed", "Fri"].map((d, i) => (
              <text key={d} x={0} y={TOP + (i * 2) * STEP + CELL - 2} className="fill-muted text-[9px]">
                {d}
              </text>
            ))}
            {cells.map((c, i) => (
              <rect
                key={c.date}
                x={LEFT + c.col * STEP}
                y={TOP + c.row * STEP}
                width={CELL}
                height={CELL}
                rx={3}
                fill={FILLS[level(c.miles)]}
                className="origin-center animate-[heat-in_0.5s_ease-out_both] transition-[stroke] duration-150"
                style={{ animationDelay: `${Math.min(i * 1.2, 450)}ms`, transformBox: "fill-box" }}
                stroke={hover?.date === c.date ? "var(--text)" : "transparent"}
                strokeWidth={1.5}
                onMouseEnter={() =>
                  setHover({
                    date: c.date,
                    x: ((LEFT + c.col * STEP + CELL / 2) / width) * 100,
                    y: ((TOP + c.row * STEP) / height) * 100,
                  })
                }
              />
            ))}
          </svg>
          {hover && hovered ? (
            <ChartTooltip x={hover.x} y={hover.y}>
              <p className="font-medium">{formatLongDate(hovered.date)}</p>
              <p className="text-muted">
                {hovered.runs ? `${hovered.miles.toFixed(2)} mi · ${hovered.runs} run${hovered.runs > 1 ? "s" : ""}` : "Rest day"}
              </p>
            </ChartTooltip>
          ) : null}
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
        <p>
          <span className="font-medium text-text">{activeDays}</span> days run in {year}
        </p>
        <div className="flex items-center gap-1.5" aria-hidden>
          <span>Less</span>
          {FILLS.map((f) => (
            <span key={f} className="size-3 rounded-[3px]" style={{ background: f }} />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
