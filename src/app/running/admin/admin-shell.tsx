import { Suspense } from "react";

/** Admin pages read login cookies, so they render inside Suspense with a loading state. */
export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div aria-busy="true" className="space-y-4">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-surface-2" />
          <div className="h-64 animate-pulse rounded-3xl bg-surface-2" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

export function AdminCard({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="glass rounded-3xl p-5 sm:p-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-medium tracking-tight">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
