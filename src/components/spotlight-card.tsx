"use client";

/** A surface with a soft light + glowing border that follow the cursor. */
export function SpotlightCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--x", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--y", `${e.clientY - r.top}px`);
  }
  return (
    <div onPointerMove={onMove} className={`spotlight ${className}`}>
      {children}
    </div>
  );
}
