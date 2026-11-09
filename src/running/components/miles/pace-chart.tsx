"use client";

import { scaleLinear, scalePoint } from "d3-scale";
import { line, curveMonotoneX } from "d3-shape";
import { useState } from "react";
import { type PacePoint } from "../../domain/stats";
import { formatPace } from "../../domain/units";
import { ChartTooltip } from "../ui/tooltip";

const W = 720;
const H = 240;
const M = { top: 20, right: 16, bottom: 28, left: 44 };

/** Monthly average pace. Faster is higher on the chart. */
export function PaceChart({ points }: { points: PacePoint[] }) {
  const [active, setActive] = useState<number | null>(null);

  const paces = points.map((p) => p.paceSPerMile);
  const pad = 15;
  // Domain is reversed (slow at the bottom, fast at the top).
  const y = scaleLinear()
    .domain([Math.max(...paces) + pad, Math.min(...paces) - pad])
    .range([H - M.bottom, M.top]);
  const x = scalePoint<number>()
    .domain(points.map((_, i) => i))
    .range([M.left, W - M.right])
    .padding(0.5);
  const path = line<PacePoint>()
    .x((_, i) => x(i)!)
    .y((p) => y(p.paceSPerMile))
    .curve(curveMonotoneX)(points);
  const ticks = y.ticks(4);
  const labelEvery = Math.max(1, Math.ceil(points.length / 8));
  const a = active !== null ? points[active] : null;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Average pace by month" onMouseLeave={() => setActive(null)}>
        <defs>
          <linearGradient id="pace-stroke" x1="0" x2="1">
            <stop offset="0%" stopColor="#f9a8d4" />
            <stop offset="100%" stopColor="#db2777" />
          </linearGradient>
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={M.left} x2={W - M.right} y1={y(t)} y2={y(t)} stroke="var(--border)" />
            <text x={M.left - 8} y={y(t) + 3} textAnchor="end" className="fill-muted text-[10px]">
              {formatPace(t)}
            </text>
          </g>
        ))}
        {path ? (
          <path
            d={path}
            fill="none"
            stroke="url(#pace-stroke)"
            strokeWidth={3}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            className="animate-[draw_1.4s_ease-out_both]"
          />
        ) : null}
        {points.map((p, i) => (
          <g key={p.key} onMouseEnter={() => setActive(i)}>
            <circle cx={x(i)} cy={y(p.paceSPerMile)} r={14} fill="transparent" />
            <circle
              cx={x(i)}
              cy={y(p.paceSPerMile)}
              r={active === i ? 6 : 4}
              fill="white"
              stroke="var(--accent)"
              strokeWidth={2}
              className="transition-all duration-200"
            />
            {i % labelEvery === 0 ? (
              <text x={x(i)} y={H - 8} textAnchor="middle" className="fill-muted text-[10px]">
                {p.label}
              </text>
            ) : null}
          </g>
        ))}
      </svg>
      {a && active !== null ? (
        <ChartTooltip x={(x(active)! / W) * 100} y={(y(a.paceSPerMile) / H) * 100}>
          <p className="font-medium">{a.label}</p>
          <p className="text-muted">
            {formatPace(a.paceSPerMile)}/mi avg · {a.miles.toFixed(1)} mi · {a.runs} run{a.runs === 1 ? "" : "s"}
          </p>
        </ChartTooltip>
      ) : null}
    </div>
  );
}
