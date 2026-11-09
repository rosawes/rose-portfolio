import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/container";
import { Reveal } from "@/components/reveal";
import { SocialLinks } from "@/components/social-links";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "About",
  description: `About ${site.name}: Wellesley Computer Science and Economics, technology & strategy consulting at PwC, and The Running Archive.`,
};

// TODO(Rose): add years if you'd like.
const path: {
  marker: string;
  title: string;
  body: string;
  items?: string[];
  href?: string;
}[] = [
  {
    marker: "Then",
    title: "Wellesley College",
    body: "B.A. in Computer Science and Economics",
    items: [
      "President, Wellesley Asset Management and Finance",
      "Treasurer, Google Developer Student Club",
      "Member, Wellesley in Business",
      "Varsity Field Hockey, starting center midfielder",
    ],
  },
  {
    marker: "Now",
    title: "PwC · Technology & strategy consulting",
    body: "Working on technology and strategy projects, and building internal tools for my team when I see a way to save people time.",
  },
  {
    marker: "Side project",
    title: "The Running Archive",
    body: "Developing an interactive application to track running, marathon goals, and charitable fundraising, with plans to expand it for other runners.",
    href: "/running",
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
                <span className="text-fade">About me.</span>
              </h1>
            </Reveal>
            <Reveal delay={120} className="mt-8 max-w-2xl space-y-5 text-lg leading-relaxed text-muted">
              <p>
                I&rsquo;m a Wellesley College graduate where I double majored in Computer Science and Economics,
                and I currently work in technology and strategy consulting at PwC.
              </p>
              <p>
                I like figuring out why something is slow or confusing, then building something that works better.
                I&rsquo;m especially interested in AI and how it&rsquo;s changing the way we create and use technology.
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
                    i > 0
                      ? "border-accent-soft/40 bg-bg text-accent shadow-[0_0_20px_-4px_var(--accent-soft)]"
                      : "border-border bg-bg text-muted"
                  }`}
                >
                  <span aria-hidden className={`size-1.5 rounded-full ${i > 0 ? "bg-accent-2" : "bg-muted"}`} />
                  {step.marker}
                </span>
                {step.href ? (
                  <Link
                    href={step.href}
                    className="group glass mt-5 block rounded-3xl p-6 transition hover:-translate-y-0.5 hover:border-accent-soft"
                  >
                    <h3 className="text-lg font-medium tracking-tight">
                      Building <span className="text-accent">{step.title}</span>
                    </h3>
                    <p className="mt-2 leading-relaxed text-muted">{step.body}</p>
                    <p className="mt-4 text-sm font-medium text-accent">
                      Explore it{" "}
                      <span aria-hidden className="inline-block transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                        ↗
                      </span>
                    </p>
                  </Link>
                ) : (
                  <div className="glass mt-5 rounded-3xl p-6">
                    <h3 className="text-lg font-medium tracking-tight">{step.title}</h3>
                    <p className="mt-2 leading-relaxed text-muted">{step.body}</p>
                    {step.items ? (
                      <ul className="mt-4 space-y-2 border-t border-border pt-4 text-sm text-muted">
                        {step.items.map((item) => (
                          <li key={item} className="flex gap-2.5">
                            <span aria-hidden className="mt-[0.5em] size-1.5 shrink-0 rounded-full bg-accent-2" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                )}
              </Reveal>
            ))}
          </ol>
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
              <p className="mt-3 text-xs text-muted">More projects and code are being added to GitHub.</p>
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
