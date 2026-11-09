"use client";

import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "miles", label: "The Miles" },
  { id: "majors", label: "The Majors" },
  { id: "impact", label: "The Impact" },
];

/** Sticky in-page navigation that highlights the section you're reading. */
export function SectionNav() {
  const [active, setActive] = useState("miles");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    for (const s of SECTIONS) {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <nav aria-label="Running Archive sections" className="sticky top-20 z-30 flex justify-center px-4">
      <ul className="glass inline-flex gap-1 rounded-2xl p-1 shadow-[0_8px_30px_-12px_rgb(0_0_0/0.15)]">
        {SECTIONS.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              aria-current={active === s.id ? "true" : undefined}
              className={`block rounded-xl px-3 py-1.5 text-sm whitespace-nowrap transition sm:px-4 ${
                active === s.id ? "bg-accent text-white" : "text-muted hover:bg-surface-2 hover:text-text"
              }`}
            >
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
