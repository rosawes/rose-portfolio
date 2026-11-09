/**
 * A stylized, decorative miniature of the Running Archive interface for the
 * project card: a heatmap strip, mileage bars, and the Majors tracker.
 * Purely illustrative (aria-hidden); it shows no real statistics.
 */

// Fixed pattern so server and client render identically.
const HEAT = [0, 2, 0, 1, 3, 0, 1, 2, 0, 0, 4, 1, 0, 2, 1, 3, 0, 1, 0, 2, 3, 1, 0, 4, 2, 0, 1, 1, 3, 0, 2, 0, 1, 2, 4, 0, 1, 0, 3, 2, 1, 0];
const FILLS = ["var(--surface-2)", "#fbcfe8", "#f9a8d4", "#ec4899", "#be185d"];
const BARS = [38, 52, 44, 66, 58, 74, 62, 86];

export function RunningArchivePreview() {
  return (
    <div aria-hidden className="absolute inset-x-4 top-12 bottom-3 flex gap-3">
      {/* Heatmap */}
      <div className="grid flex-1 grid-flow-col grid-rows-6 gap-[3px] self-end">
        {HEAT.map((v, i) => (
          <span
            key={i}
            className="aspect-square rounded-[2px] transition duration-500 group-hover:scale-110"
            style={{ background: FILLS[v], transitionDelay: `${i * 8}ms` }}
          />
        ))}
      </div>
      {/* Mileage bars + majors */}
      <div className="flex w-[38%] flex-col justify-end gap-2">
        <div className="flex h-12 items-end gap-[3px]">
          {BARS.map((h, i) => (
            <span
              key={i}
              className="flex-1 origin-bottom rounded-t-[2px] bg-gradient-to-t from-accent-2 to-accent-soft transition-transform duration-500 group-hover:scale-y-110"
              style={{ height: `${h}%`, transitionDelay: `${i * 30}ms` }}
            />
          ))}
        </div>
        <div className="flex items-center justify-between">
          {Array.from({ length: 7 }, (_, i) => (
            <span
              key={i}
              className={`size-2 rounded-full ${i === 0 ? "bg-accent shadow-[0_0_6px_var(--accent-2)]" : i === 1 ? "border border-dashed border-accent-2" : "bg-border-strong"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
