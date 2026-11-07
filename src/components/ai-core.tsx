/**
 * The hero visual: an abstract "AI core": orbiting rings with nodes around a glowing center.
 * Pure SVG + CSS animation, no images.
 */
export function AICore({ className = "" }: { className?: string }) {
  const nodes = (r: number, n: number, offset = 0) =>
    Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2 + offset;
      return { x: 200 + r * Math.cos(a), y: 200 + r * Math.sin(a) };
    });

  return (
    <div aria-hidden className={`relative aspect-square ${className}`}>
      {/* Core glow */}
      <div className="absolute inset-[30%] rounded-full bg-gradient-to-br from-accent-2 via-accent-soft to-accent-soft opacity-40 blur-3xl" />

      <svg viewBox="0 0 400 400" className="absolute inset-0 size-full">
        <defs>
          <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ec4899" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#f9a8d4" stopOpacity="0.2" />
          </linearGradient>
          <radialGradient id="center">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#f9a8d4" />
            <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer ring */}
        <g className="origin-center animate-spin-slower">
          <circle cx="200" cy="200" r="180" fill="none" stroke="rgb(17 17 20 / 0.08)" />
          <circle cx="200" cy="200" r="180" fill="none" stroke="url(#ring)" strokeWidth="1.2" strokeDasharray="2 10" />
          {nodes(180, 6).map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="3" fill={["#f9a8d4", "#db2777", "#f472b6"][i % 3]} />
          ))}
        </g>

        {/* Middle ring with connecting lines */}
        <g className="origin-center animate-spin-slow">
          <circle cx="200" cy="200" r="122" fill="none" stroke="rgb(17 17 20 / 0.1)" />
          {nodes(122, 8, 0.3).map((p, i, arr) => {
            const q = arr[(i + 3) % arr.length];
            return (
              <g key={i}>
                <line x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke="rgb(236 72 153 / 0.22)" />
                <circle cx={p.x} cy={p.y} r="4" fill="#ffffff" stroke="#db2777" strokeWidth="1.5" />
              </g>
            );
          })}
        </g>

        {/* Inner ring */}
        <g className="origin-center animate-spin-slower">
          <circle cx="200" cy="200" r="66" fill="none" stroke="url(#ring)" strokeWidth="1.5" />
          {nodes(66, 4, 0.8).map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#f9a8d4" />
          ))}
        </g>

        {/* Center */}
        <circle cx="200" cy="200" r="34" fill="url(#center)" />
        <circle cx="200" cy="200" r="10" fill="#fff" />
      </svg>
    </div>
  );
}
