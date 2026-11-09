"use client";

import { scaleBand, scaleLinear } from "d3-scale";
import { useState } from "react";
import { type Bucket } from "../../domain/stats";
import { formatPace } from "../../domain/units";
import { useMounted } from "../ui/use-today";
import { ChartTooltip } from "../ui/tooltip";

const W = 720;
const H = 260;
const M = { top: 16, right: 8, bottom: 28, left: 36 };

export function MileageChart({ buckets }: { buckets: Bucket[] }) {
  const [active, setActive] = useState<number | null>(null);
  const mounted = useMounted();

  const max = Math.max(1, ...buckets.map((b) => b.miles));
  const x = scaleBand<number>()
    .domain(buckets.map((_, i) => i))
    .range([M.left, W - M.right])
    .paddingInner(buckets.length > 60 ? 0.15 : 0.3);
  const y = scaleLinear().domain([0, max]).nice(4).range([H - M.bottom, M.top]);
  const ticks = y.ticks(4);

  // Show at most ~8 x-axis labels.
  const labelEvery = Math.max(1, Math.ceil(buckets.length / 8));
  const shortLabel = (b: Bucket) => b.label.replace("Week of ", "");

  const a = active !== null ? buckets[active] : null;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Mileage chart" onMouseLeave={() => setActive(null)}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={M.left} x2={W - M.right} y1={y(t)} y2={y(t)} stroke="var(--border)" />
            <text x={M.left - 8} y={y(t) + 3} textAnchor="end" className="fill-muted text-[10px]">
              {t}
            </text>
          </g>
        ))}
        {buckets.map((b, i) => {
          const bx = x(i)!;
          const h = y(0) - y(b.miles);
          return (
            <g key={b.key}>
              {/* Full-height invisible hit area makes thin bars easy to hover. */}
              <rect
                x={bx}
                y={M.top}
                width={x.bandwidth()}
                height={H - M.top - M.bottom}
                fill="transparent"
                onMouseEnter={() => setActive(i)}
              />
              <rect
                x={bx}
                y={y(b.miles)}
                width={x.bandwidth()}
                height={Math.max(0, h)}
                rx={Math.min(4, x.bandwidth() / 2)}
                fill={active === i ? "var(--accent)" : "var(--accent-2)"}
                opacity={active === null || active === i ? 1 : 0.45}
                className="pointer-events-none transition-[opacity,fill,transform] duration-700 ease-out"
                style={{
                  transformBox: "fill-box",
                  transformOrigin: "bottom",
                  transform: mounted ? "scaleY(1)" : "scaleY(0)",
                  transitionDelay: mounted ? `${Math.min(i * 8, 400)}ms` : "0ms",
                }}
              />
              {i % labelEvery === 0 ? (
                <text x={bx + x.bandwidth() / 2} y={H - 8} textAnchor="middle" className="fill-muted text-[10px]">
                  {shortLabel(b)}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
      {a && active !== null ? (
        <ChartTooltip x={((x(active)! + x.bandwidth() / 2) / W) * 100} y={(y(a.miles) / H) * 100}>
          <p className="font-medium">{a.label}</p>
          <p className="text-muted">
            {a.miles.toFixed(1)} mi · {a.runs} run{a.runs === 1 ? "" : "s"}
            {a.runs ? ` · ${formatPace(a.movingS / a.miles)}/mi` : ""}
          </p>
        </ChartTooltip>
      ) : null}
    </div>
  );
}
