import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Container } from "@/components/container";
import { accentGradient } from "@/components/project-card";
import { Reveal } from "@/components/reveal";
import { StatusStamp } from "@/components/status-stamp";
import {
  getAdjacentProject,
  getProject,
  projectNumber,
  projects,
  statusMeta,
} from "@/content/projects";
import { isPlaceholderLink } from "@/content/site";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return { title: project.title, description: project.tagline };
}

export default function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  // Known projects are fully prerendered; the fallback only shows for unknown URLs.
  return (
    <Suspense fallback={<Container className="py-32 font-mono text-sm text-muted">Loading…</Container>}>
      <ProjectContent params={params} />
    </Suspense>
  );
}

async function ProjectContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const next = getAdjacentProject(project.slug);
  const meta = [
    { k: "Context", v: project.context },
    { k: "Role", v: project.role },
    { k: "When", v: project.timeframe },
    { k: "Status", v: statusMeta[project.status].label },
  ];

  return (
    <article>
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="relative">
        <div
          aria-hidden
          className={`pointer-events-none absolute top-0 right-0 -z-10 size-[520px] rounded-full bg-gradient-to-br ${accentGradient[project.accent]} opacity-20 blur-[120px]`}
        />
        <Container className="pt-16 sm:pt-20">
          <Reveal>
            <Link href="/projects" className="group inline-flex items-center gap-1.5 text-sm text-muted hover:text-text">
              <span aria-hidden className="transition group-hover:-translate-x-0.5">←</span> All work
            </Link>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <span className="font-mono text-sm text-muted">{projectNumber(project.slug)}</span>
              <StatusStamp status={project.status} />
            </div>
            <h1 className="mt-6 max-w-4xl text-[clamp(2.4rem,6vw,4.5rem)] leading-[1.02] font-medium tracking-[-0.04em] text-fade">
              {project.title}
            </h1>
            <p className="mt-6 max-w-2xl text-xl leading-relaxed text-muted">{project.tagline}</p>
          </Reveal>

          <Reveal delay={120}>
            <dl className="glass mt-12 grid grid-cols-2 gap-6 rounded-2xl p-6 md:grid-cols-4">
              {meta.map((m) => (
                <div key={m.k}>
                  <dt className="font-mono text-[11px] tracking-wider text-muted uppercase">{m.k}</dt>
                  <dd className="mt-1.5 text-sm">{m.v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </Container>
      </header>

      <Container className="grid gap-12 py-16 lg:grid-cols-[1fr_17rem] lg:gap-20">
        {/* ── Body ─────────────────────────────────────────── */}
        <div className="min-w-0">
          {project.note ? (
            <Reveal className="mb-12 flex gap-3 rounded-2xl border border-amber/25 bg-amber/5 p-5 text-sm leading-relaxed text-text/90">
              <span aria-hidden className="text-amber">ⓘ</span>
              <p>{project.note}</p>
            </Reveal>
          ) : null}

          {project.metric ? (
            <Reveal className="relative mb-16 overflow-hidden rounded-3xl border border-border bg-surface p-8 sm:p-10">
              <div aria-hidden className={`absolute -right-20 -bottom-24 size-80 rounded-full bg-gradient-to-br ${accentGradient[project.accent]} opacity-40 blur-3xl`} />
              <p className="relative font-mono text-xs tracking-[0.2em] text-muted uppercase">Impact</p>
              <p className="relative mt-5 flex flex-wrap items-baseline gap-x-5 gap-y-2 text-[clamp(2.75rem,8vw,5rem)] leading-none font-medium tracking-[-0.04em]">
                {project.metric.before ? (
                  <>
                    <span className="text-muted/60 line-through decoration-2">{project.metric.before}</span>
                    <span aria-hidden className="text-[0.5em] text-muted">→</span>
                  </>
                ) : null}
                <span className="text-gradient">{project.metric.after}</span>
              </p>
              <p className="relative mt-4 text-lg text-muted">{project.metric.label}</p>
            </Reveal>
          ) : null}

          <div className="space-y-16">
            {project.sections.map((section, i) => (
              <Reveal as="section" key={section.heading}>
                <h2 className="flex items-baseline gap-4 text-2xl font-medium tracking-tight sm:text-3xl">
                  <span className="font-mono text-sm text-gradient">{String(i + 1).padStart(2, "0")}</span>
                  {section.heading}
                </h2>
                <div className="mt-5 space-y-4 text-lg leading-relaxed text-muted">
                  {section.paragraphs?.map((p) => <p key={p}>{p}</p>)}
                </div>
                {section.bullets?.length ? (
                  <ul className="mt-5 space-y-3">
                    {section.bullets.map((b) => (
                      <li key={b} className="flex gap-3 text-lg leading-relaxed text-text/90">
                        <span aria-hidden className={`mt-[11px] size-1.5 shrink-0 rounded-full bg-gradient-to-br ${accentGradient[project.accent]}`} />
                        {b}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </Reveal>
            ))}
          </div>
        </div>

        {/* ── Sidebar ──────────────────────────────────────── */}
        <aside className="space-y-8 lg:sticky lg:top-28 lg:self-start">
          <div className="glass rounded-2xl p-5">
            <h2 className="font-mono text-[11px] tracking-wider text-muted uppercase">
              {project.status === "coming-soon" ? "Planned focus" : "Tools & focus"}
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {project.stack.map((s) => (
                <li key={s} className="rounded-lg border border-border bg-surface px-2.5 py-1 text-sm">
                  {s}
                </li>
              ))}
            </ul>
          </div>
          {project.links?.length ? (
            <div className="glass rounded-2xl p-5">
              <h2 className="font-mono text-[11px] tracking-wider text-muted uppercase">Links</h2>
              <ul className="mt-4 space-y-2.5 text-sm">
                {project.links.map((l) =>
                  isPlaceholderLink(l.href) ? (
                    <li key={l.label} className="text-muted">
                      {l.label} <span className="font-mono text-xs opacity-70">(link coming)</span>
                    </li>
                  ) : (
                    <li key={l.label}>
                      <a href={l.href} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                        {l.label} ↗
                      </a>
                    </li>
                  ),
                )}
              </ul>
            </div>
          ) : null}
        </aside>
      </Container>

      {/* ── Next project ───────────────────────────────────── */}
      {next.slug !== project.slug ? (
        <Container>
          <Link
            href={`/projects/${next.slug}`}
            className="group glass relative flex items-center justify-between gap-6 overflow-hidden rounded-3xl p-8 transition hover:border-border-strong sm:p-10"
          >
            <div aria-hidden className={`absolute -right-10 -bottom-20 size-64 rounded-full bg-gradient-to-br ${accentGradient[next.accent]} opacity-20 blur-3xl transition duration-700 group-hover:opacity-50`} />
            <div className="relative">
              <p className="font-mono text-xs tracking-[0.2em] text-muted uppercase">Next project</p>
              <p className="mt-2 text-2xl font-medium tracking-tight sm:text-3xl">{next.title}</p>
            </div>
            <span aria-hidden className="relative grid size-12 shrink-0 place-items-center rounded-2xl border border-border text-xl transition group-hover:translate-x-1 group-hover:border-accent-soft/50 group-hover:text-accent">
              →
            </span>
          </Link>
        </Container>
      ) : null}
    </article>
  );
}
