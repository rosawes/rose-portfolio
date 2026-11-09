"use client";

import { useEffect, useState } from "react";

/**
 * Today's date in the VISITOR's time zone, as "YYYY-MM-DD".
 * Returns null during server rendering / first paint so cached HTML never
 * bakes in a stale "today" (and React doesn't see a hydration mismatch).
 */
export function useToday(): string | null {
  const [today, setToday] = useState<string | null>(null);
  useEffect(() => {
    const d = new Date();
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const t = setTimeout(() => setToday(iso), 0);
    return () => clearTimeout(t);
  }, []);
  return today;
}

/** True after the first client render, used to trigger entrance animations. */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return mounted;
}
