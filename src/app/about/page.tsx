import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/container";
import { Reveal } from "@/components/reveal";
import { SocialLinks } from "@/components/social-links";
import { SpotlightCard } from "@/components/spotlight-card";
import { isPlaceholderLink, site } from "@/content/site";

export const metadata: Metadata = {
  title: "About",
  description: `About ${site.name}: Wellesley CS + Economics, technology & strategy consulting at PwC, building with AI.`,
};

// TODO(Rose): add years if you'd like.
const path = [
  {
    marker: "Then",
    title: "Wellesley College",
    body: "Studied Computer Science and Economics.",
  },
  {
    marker: "Now",
    title: "PwC · Technology & strategy consulting",
    body: "Working on technology and strategy projects, and building internal tools for my team when I see a way to save people time.",
  },
  {
    marker: "Next",
    title: "An AI side project",
    body: "Planning an AI sales intelligence app. I'll share updates here once I start building.",
  },
];

// TODO(Rose): starting points. Rewrite them in your own voice.
const principles = [
  {
    title: "Start with the real problem",
    body: "Consulting taught me to ask what's actually slowing people down before deciding what to build.",
  },
  {
    title: "Keep it simple",
    body: "A simple tool people use every day is worth more than an impressive one nobody opens.",
  },
  {
    title: "Measure what changed",
    body: "If something got better, I like being able to say by how much.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section>
        <Container className="grid gap-14 pt-20 pb-16 sm:pt-28 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <Reveal>
              <p className="font-mono text-xs tracking-[0.2em] text-accent uppercase">About</p>
              <h1 className="mt-5 max-w-3xl text-[clamp(2.5rem,6vw,4.75rem)] leading-[1.02] font-medium tracking-[-0.04em]">
                <span className="text-fade">A little </span>
                <span className="text-fade">about me.</span>
              </h1>
            </Reveal>
            <Reveal delay={120} className="mt-8 max-w-2xl space-y-5 text-lg leading-relaxed text-muted">
              <p>
                I&rsquo;m a Wellesley College graduate where I double majored in Computer Science and Economics,
                and I currently work in technology and strategy consulting at PwC.
              </p>
              <p>
                I like figuring out why something is slow or confusing, and then building something that makes it
                easier. I&rsquo;m especially interested in AI and how much easier it&rsquo;s becoming to turn an idea
                into something real.
              </p>
              <p>
                Outside of work, I love running, traveling, and finding new things to try. I recently ran my first
                NYC Marathon in under four hours while raising over $7,000 for cancer research, and now I&rsquo;m
                excited to do it all over again for the 2027 Sydney Marathon.
              </p>
            </Reveal>
          </div>

          {/* Profile photo: circular crop with a soft gradient ring. Photo lives in /public/rose.jpg. */}
          <Reveal delay={200} className="mx-auto">
            <div className="relative size-60 sm:size-72 lg:size-80">
              <div aria-hidden className="absolute -inset-6 rounded-full bg-gradient-to-br from-accent-2/30 via-accent-2/20 to-accent-soft/20 blur-2xl" />
              <div aria-hidden className="absolute -inset-[3px] animate-spin-slower rounded-full bg-[conic-gradient(from_0deg,var(--accent-2),var(--accent-2),var(--accent-soft),var(--accent-2))] opacity-90" />
              <div className="relative size-full overflow-hidden rounded-full border-4 border-bg">
                <Image
                  src={site.photo.src}
                  alt={site.photo.alt}
                  fill
                  preload
                  sizes="(min-width: 1024px) 320px, (min-width: 640px) 288px, 240px"
                  className="object-cover object-[50%_28%]"
                />
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      <section aria-labelledby="path-heading" className="py-16">
        <Container>
          <Reveal>
            <h2 id="path-heading" className="font-mono text-xs tracking-[0.2em] text-muted uppercase">
              The path so far
            </h2>
          </Reveal>
          <ol className="relative mt-10 grid gap-5 md:grid-cols-3">
            <div aria-hidden className="glow-line absolute top-[22px] right-0 left-0 hidden md:block" />
            {path.map((step, i) => (
              <Reveal as="li" key={step.title} delay={i * 120} className="relative">
                <span
                  className={`relative inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[11px] tracking-widest uppercase ${
                    i === 1
                      ? "border-accent-soft/40 bg-bg text-accent shadow-[0_0_20px_-4px_var(--accent-soft)]"
                      : "border-border bg-bg text-muted"
                  }`}
                >
                  <span aria-hidden className={`size-1.5 rounded-full ${i === 1 ? "bg-accent-soft" : "bg-muted"}`} />
                  {step.marker}
                </span>
                <div className="glass mt-5 rounded-3xl p-6">
                  <h3 className="text-lg font-medium tracking-tight">{step.title}</h3>
                  <p className="mt-2 leading-relaxed text-muted">{step.body}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </Container>
      </section>

      <section aria-labelledby="principles-heading" className="py-16">
        <Container>
          <Reveal>
            <h2 id="principles-heading" className="text-4xl font-medium tracking-[-0.03em] sm:text-5xl">
              <span className="text-fade">How I like to </span>
              <span className="text-fade">work.</span>
            </h2>
          </Reveal>
          <ul className="mt-12 grid gap-5 md:grid-cols-3">
            {principles.map((p, i) => (
              <Reveal as="li" key={p.title} delay={i * 100}>
                <SpotlightCard className="glass h-full rounded-3xl p-7">
                  <span className="font-mono text-sm text-gradient">0{i + 1}</span>
                  <h3 className="mt-5 text-lg font-medium">{p.title}</h3>
                  <p className="mt-2 leading-relaxed text-muted">{p.body}</p>
                </SpotlightCard>
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>

      <section aria-labelledby="interests-heading" className="py-16">
        <Container>
          <Reveal className="glass grid gap-12 rounded-3xl p-8 sm:p-12 lg:grid-cols-2">
            <div>
              <h2 id="interests-heading" className="font-mono text-xs tracking-[0.2em] text-muted uppercase">
                Interested in
              </h2>
              <ul className="mt-6 flex flex-wrap gap-2">
                {site.interests.map((interest) => (
                  <li key={interest} className="rounded-xl border border-border bg-surface px-4 py-2 text-sm">
                    {interest}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="font-mono text-xs tracking-[0.2em] text-muted uppercase">Find me</h2>
              <SocialLinks className="mt-6" />
              {!isPlaceholderLink(site.links.resume) ? (
                <a href={site.links.resume} className="mt-4 inline-block text-sm text-accent hover:underline">
                  Download resume (PDF) ↗
                </a>
              ) : null}
              <p className="mt-8 text-muted">
                Or see what I&rsquo;ve been{" "}
                <Link href="/projects" className="text-text underline decoration-accent decoration-2 underline-offset-4">
                  working on
                </Link>
                .
              </p>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
