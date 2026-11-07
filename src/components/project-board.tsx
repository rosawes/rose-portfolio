"use client";

import { useState } from "react";
import { type Project, type ProjectStatus, statusMeta } from "@/content/projects";
import { ProjectCard } from "./project-card";

type Filter = "all" | ProjectStatus;

/** The full project grid with status filters. */
export function ProjectBoard({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  const statuses = Array.from(new Set(projects.map((p) => p.status)));
  const visible = filter === "all" ? projects : projects.filter((p) => p.status === filter);

  const chips: { value: Filter; label: string; count: number }[] = [
    { value: "all", label: "All", count: projects.length },
    ...statuses.map((s) => ({
      value: s,
      label: statusMeta[s].label,
      count: projects.filter((p) => p.status === s).length,
    })),
  ];

  return (
    <div>
      <div role="group" aria-label="Filter projects by status" className="glass inline-flex flex-wrap gap-1 rounded-2xl p-1">
        {chips.map((chip) => {
          const active = filter === chip.value;
          return (
            <button
              key={chip.value}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(chip.value)}
              className={`rounded-xl px-3.5 py-1.5 text-sm transition ${
                active ? "bg-accent text-white" : "text-muted hover:bg-surface-2 hover:text-text"
              }`}
            >
              {chip.label} <span className="ml-0.5 font-mono text-xs opacity-60">{chip.count}</span>
            </button>
          );
        })}
      </div>

      <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((project) => (
          <li key={project.slug}>
            <ProjectCard project={project} />
          </li>
        ))}
      </ul>
    </div>
  );
}
