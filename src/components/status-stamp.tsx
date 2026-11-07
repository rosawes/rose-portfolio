import { statusMeta, type ProjectStatus } from "@/content/projects";

const dot: Record<ProjectStatus, string> = {
  "case-study": "bg-emerald shadow-[0_0_10px_var(--emerald)]",
  "in-progress": "bg-accent-soft shadow-[0_0_10px_var(--accent-soft)] animate-pulse",
  "design-concept": "bg-accent-2 shadow-[0_0_10px_var(--accent-2)]",
  "coming-soon": "bg-amber shadow-[0_0_10px_var(--amber)] animate-pulse",
};

/** A status pill with a glowing indicator so project status is always clear. */
export function StatusStamp({
  status,
  className = "",
}: {
  status: ProjectStatus;
  className?: string;
}) {
  return (
    <span
      title={statusMeta[status].description}
      className={`inline-flex items-center gap-2 rounded-full border border-border bg-surface px-2.5 py-1 font-mono text-[11px] tracking-wide text-text/90 uppercase backdrop-blur ${className}`}
    >
      <span aria-hidden className={`size-1.5 rounded-full ${dot[status]}`} />
      {statusMeta[status].label}
    </span>
  );
}
