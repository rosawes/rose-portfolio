"use client";

import { arc, pie, type PieArcDatum } from "d3-shape";
import { useState } from "react";
import { type BreakdownSlice } from "../../domain/fundraising";
import { formatCents } from "../../domain/money";
import { useMounted } from "../ui/use-today";

const COLORS = ["#be185d", "#db2777", "#ec4899", "#f472b6", "#f9a8d4", "#fbcfe8", "#fce7f3"];
const SIZE = 220;
const R = SIZE / 2;

/** Interactive "where the money came from" donut. Hover a slice or legend row. */
export function BreakdownDonut({ slices, approximate }: { slices: BreakdownSlice[]; approximate: boolean }) {
  const [active, setActive] = useState<number | null>(null);
  const mounted = useMounted();
  const arcs = pie<BreakdownSlice>()
    .value((s) => s.amountCents)
    .sort(null)
    .padAngle(0.02)(slices);
  const make = (d: PieArcDatum<BreakdownSlice>, outer: number) =>
    arc<PieArcDatum<BreakdownSlice>>().innerRadius(R * 0.62).outerRadius(outer).cornerRadius(4)(d) ?? "";
  const total = slices.reduce((t, s) => t + s.amountCents, 0);
  const a = active !== null ? slices[active] : null;

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
      <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
        <svg viewBox={`${-R} ${-R} ${SIZE} ${SIZE}`} width={SIZE} height={SIZE} role="img" aria-label="Fundraising breakdown by source">
          {arcs.map((d, i) => (
            <path
              key={d.data.key}
              d={make(d, active === i ? R : R - 8)}
              fill={COLORS[i % COLORS.length]}
              opacity={active === null || active === i ? 1 : 0.35}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              className="cursor-pointer transition-[opacity] duration-200"
              style={{
                transform: mounted ? "rotate(0deg) scale(1)" : "rotate(-60deg) scale(0.6)",
                transition: "transform 900ms cubic-bezier(0.2,0.7,0.2,1), opacity 200ms",
              }}
            />
          ))}
        </svg>
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div className="max-w-[60%]">
            <p className="text-xl font-medium tracking-tight tabular-nums">
              {approximate ? "~" : ""}
              {formatCents(a ? a.amountCents : total)}
            </p>
            <p className="mt-0.5 text-[11px] leading-tight text-muted">{a ? a.label : "total in breakdown"}</p>
            {a ? <p className="text-[11px] text-accent">{Math.round(a.share * 100)}%</p> : null}
          </div>
        </div>
      </div>
      <ul className="w-full space-y-1">
        {slices.map((s, i) => (
          <li key={s.key}>
            <button
              type="button"
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm transition ${active === i ? "bg-surface-2" : ""}`}
            >
              <span className="flex items-center gap-2.5">
                <span aria-hidden className="size-3 shrink-0 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                {s.label}
              </span>
              <span className="font-mono text-xs text-muted tabular-nums">
                {s.isApproximate ? "~" : ""}
                {formatCents(s.amountCents)}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
