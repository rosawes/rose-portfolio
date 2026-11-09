import Link from "next/link";
import { type Accent, type Project, projectNumber } from "@/content/projects";
import { SpotlightCard } from "./spotlight-card";
import { RunningArchivePreview } from "./running-archive-preview";
import { StatusStamp } from "./status-stamp";

export const accentGradient: Record<Accent, string> = {
  rose: "from-accent to-accent-2",
  blush: "from-accent-2 to-accent-soft",
  amber: "from-amber to-accent-2",
};

/** A project as a frosted-glass card with a cursor-following glow. */
export function ProjectCard({ project }: { project: Project }) {
  return (
    <SpotlightCard className="glass h-full rounded-3xl transition duration-500 hover:-translate-y-1">
      <Link href={project.href ?? `/projects/${project.slug}`} className="group flex h-full flex-col p-6 sm:p-7">
        {/* Visual header: gradient orb that brightens on hover */}
        <div className="relative h-36 overflow-hidden rounded-2xl border border-border bg-surface">
          <div
            aria-hidden
            className={`absolute -bottom-16 left-1/2 size-56 -translate-x-1/2 rounded-full bg-gradient-to-br ${accentGradient[project.accent]} opacity-40 blur-2xl transition duration-700 group-hover:scale-110 group-hover:opacity-70`}
          />
          {project.preview ? null : (
            <div aria-hidden className="absolute inset-0 bg-[linear-gradient(to_right,rgb(0_0_0/0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgb(0_0_0/0.04)_1px,transparent_1px)] bg-[size:28px_28px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
          )}
          <div className="absolute inset-x-4 top-4 flex items-start justify-between">
            <span className="font-mono text-xs text-muted">{projectNumber(project.slug)}</span>
            <StatusStamp status={project.status} />
          </div>
          {project.preview === "running-archive" ? <RunningArchivePreview /> : null}
          {project.metric ? (
            <p className="absolute bottom-4 left-4 font-mono text-sm">
              {project.metric.before ? (
                <span className="text-muted line-through">{project.metric.before}</span>
              ) : null}{" "}
              <span className="text-muted">→</span>{" "}
              <span className="font-semibold text-text">{project.metric.after}</span>
            </p>
          ) : null}
        </div>

        <p className="mt-6 font-mono text-[11px] tracking-wider text-muted uppercase">{project.context}</p>
        <h3 className="mt-2 text-xl font-medium tracking-tight text-text">{project.title}</h3>
        <p className="mt-2.5 text-[15px] leading-relaxed text-muted">{project.tagline}</p>
        {project.status === "coming-soon" ? (
          <p className="mt-3 text-sm text-amber">Not built yet. This is a planned project.</p>
        ) : null}

        <div className="mt-auto flex items-end justify-between gap-4 pt-6">
          <ul className="flex flex-wrap gap-1.5">
            {project.stack.slice(0, 4).map((s) => (
              <li key={s} className="rounded-lg border border-border bg-surface px-2 py-0.5 text-xs text-muted">
                {s}
              </li>
            ))}
          </ul>
          <span
            aria-hidden
            className="grid size-9 shrink-0 place-items-center rounded-xl border border-border text-muted transition group-hover:border-accent-soft/50 group-hover:bg-accent-soft/10 group-hover:text-accent"
          >
            ↗
          </span>
        </div>
      </Link>
    </SpotlightCard>
  );
}
