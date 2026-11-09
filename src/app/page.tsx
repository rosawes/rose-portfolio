import Link from "next/link";
import { AICore } from "@/components/ai-core";
import { Container } from "@/components/container";
import { ProjectCard } from "@/components/project-card";
import { Reveal } from "@/components/reveal";
import { SpotlightCard } from "@/components/spotlight-card";
import { projects } from "@/content/projects";

// TODO(Rose): keep this current. Rows with an href become links.
const currently: { label: string; value: string; href?: string }[] = [
  { label: "Current role", value: "Technology & strategy consulting at PwC" },
  { label: "Currently building", value: "The Running Archive", href: "/running" },
  { label: "Interested in", value: "Software engineering & product design" },
];

const focus = [
  {
    icon: "◇",
    title: "Strategy",
    body: "Economics and consulting taught me to understand a problem well before deciding what to build.",
  },
  {
    icon: "⌘",
    title: "Engineering",
    body: "I studied Computer Science and enjoy building useful applications and automations, from internal tools to The Running Archive.",
  },
  {
    icon: "✦",
    title: "AI",
    body: "I'm interested in using AI to build better products and improve the tools people already rely on.",
  },
];

export default function Home() {
  const featured = projects.filter((p) => p.featured);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative">
        <Container className="grid items-center gap-12 pt-20 pb-24 sm:pt-28 lg:grid-cols-[1.25fr_1fr] lg:gap-6">
          <div>
            <Reveal>
              <Link
                href="/running"
                className="group glass inline-flex items-center gap-2 rounded-full py-1.5 pr-3.5 pl-3 text-xs text-muted transition hover:border-accent-soft hover:text-text"
              >
                <span aria-hidden className="size-1.5 animate-pulse rounded-full bg-accent-2 shadow-[0_0_8px_var(--accent-2)]" />
                Currently building:
                <span className="font-medium text-accent">The Running Archive</span>
                <span aria-hidden className="text-accent transition group-hover:translate-x-0.5">→</span>
              </Link>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="mt-7 text-[clamp(3rem,8vw,6rem)] leading-[0.98] font-medium tracking-[-0.045em]">
                <span className="text-fade">Hi, I&rsquo;m </span>
                <span className="text-fade">Rose.</span>
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted">
                I studied Computer Science and Economics at Wellesley and now work in technology and strategy
                consulting at PwC. I like finding problems, figuring out how to solve them, and building things
                along the way.
              </p>
            </Reveal>
            <Reveal delay={240} className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/projects"
                className="group inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-medium text-white shadow-[0_0_40px_-8px_rgb(236_72_153/0.45)] transition hover:shadow-[0_0_50px_-6px_rgb(244_114_182/0.7)]"
              >
                See my projects
                <span aria-hidden className="transition group-hover:translate-x-0.5">→</span>
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center rounded-xl border border-border bg-surface px-5 py-3 text-sm font-medium transition hover:border-border-strong hover:bg-surface-2"
              >
                About me
              </Link>
            </Reveal>
            <Reveal delay={300} className="mt-6">
              <Link
                href="/running"
                className="group inline-flex items-center gap-1.5 text-sm font-medium text-accent"
              >
                <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-300 group-hover:bg-[length:100%_1px]">
                  Explore my Running Archive
                </span>
                <span aria-hidden className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5">↗</span>
              </Link>
            </Reveal>
          </div>

          <Reveal delay={200} className="relative mx-auto w-full max-w-[460px]">
            <AICore />
            <div className="glass relative z-10 mx-auto -mt-16 w-[92%] rounded-2xl p-4 shadow-[0_20px_60px_-20px_rgb(0_0_0/0.12)] sm:w-[84%]">
              <p className="flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] text-muted uppercase">
                <span className="size-1.5 animate-pulse rounded-full bg-accent-2 shadow-[0_0_8px_var(--accent-2)]" aria-hidden />
                Currently
              </p>
              <dl className="mt-3 space-y-2">
                {currently.map((c) => (
                  <div key={c.label} className="flex items-baseline justify-between gap-4 text-sm">
                    <dt className="shrink-0 text-muted">{c.label}</dt>
                    <dd className="text-right text-text">
                      {c.href ? (
                        <Link href={c.href} className="text-accent underline decoration-accent-soft underline-offset-4 transition hover:decoration-accent">
                          {c.value}
                        </Link>
                      ) : (
                        c.value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* ── Divider: three pink diamonds ─────────────────────── */}
      <section aria-hidden className="border-y border-border bg-surface/50">
        <Container className="flex items-center justify-center gap-8 py-6">
          {[0, 1, 2].map((i) => (
            <span key={i} className="text-accent-2">✦</span>
          ))}
        </Container>
      </section>

      {/* ── What I work on ───────────────────────────────────── */}
      <section className="py-28" aria-labelledby="focus-heading">
        <Container>
          <Reveal className="max-w-2xl">
            <p className="font-mono text-xs tracking-[0.2em] text-accent uppercase">Background</p>
            <h2 id="focus-heading" className="mt-4 text-4xl font-medium tracking-[-0.03em] sm:text-5xl">
              <span className="text-fade">The background I bring to projects.</span>
            </h2>
          </Reveal>
          <ul className="mt-14 grid gap-5 md:grid-cols-3">
            {focus.map((c, i) => (
              <Reveal as="li" key={c.title} delay={i * 100}>
                <SpotlightCard className="glass h-full rounded-3xl p-7">
                  <span aria-hidden className="grid size-11 place-items-center rounded-xl border border-border bg-gradient-to-br from-accent-2/15 to-accent-soft/20 text-lg text-accent">
                    {c.icon}
                  </span>
                  <h3 className="mt-6 text-lg font-medium">{c.title}</h3>
                  <p className="mt-2 leading-relaxed text-muted">{c.body}</p>
                </SpotlightCard>
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>

      {/* ── Projects ─────────────────────────────────────────── */}
      <section className="pb-8" aria-labelledby="work-heading">
        <Container>
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="font-mono text-xs tracking-[0.2em] text-accent uppercase">Projects</p>
              <h2 id="work-heading" className="mt-4 text-4xl font-medium tracking-[-0.03em] sm:text-5xl">
                <span className="text-fade">A few things I&rsquo;ve </span>
                <span className="text-fade">worked on.</span>
              </h2>
            </div>
            <Link href="/projects" className="group text-sm text-muted transition hover:text-text">
              See all <span aria-hidden className="inline-block transition group-hover:translate-x-0.5">→</span>
            </Link>
          </Reveal>

          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((project, i) => (
              <Reveal as="li" key={project.slug} delay={i * 100}>
                <ProjectCard project={project} />
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
