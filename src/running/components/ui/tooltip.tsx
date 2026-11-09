/** Floating tooltip positioned in percentages over a chart. */
export function ChartTooltip({
  x,
  y,
  children,
}: {
  /** 0–100, horizontal position in the chart. */
  x: number;
  /** 0–100, vertical position in the chart. */
  y: number;
  children: React.ReactNode;
}) {
  // Keep the tooltip inside the chart near the edges.
  const translateX = x < 15 ? "0%" : x > 85 ? "-100%" : "-50%";
  return (
    <div
      role="status"
      className="pointer-events-none absolute z-10 rounded-xl border border-border bg-white/95 px-3 py-2 text-xs whitespace-nowrap shadow-[0_8px_30px_-8px_rgb(0_0_0/0.2)] backdrop-blur"
      style={{ left: `${x}%`, top: `${y}%`, transform: `translate(${translateX}, calc(-100% - 10px))` }}
    >
      {children}
    </div>
  );
}
