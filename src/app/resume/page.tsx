import type { Metadata } from "next";
import { Container } from "@/components/container";
import { Reveal } from "@/components/reveal";
import { type ResumeEntry, resume } from "@/content/resume";
import { isPlaceholderLink, site } from "@/content/site";

export const metadata: Metadata = {
  title: "Resume",
  description: `Resume of ${resume.name}: education, experience, leadership, and skills.`,
};

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="mt-3 space-y-2">
      {items.map((b) => (
        <li key={b} className="flex gap-3 leading-relaxed text-muted">
          <span aria-hidden className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-accent-2" />
          <span>{b}</span>
        </li>
      ))}
    </ul>
  );
}

/** Dates and location, right-aligned on desktop and stacked under the title on mobile. */
function Meta({ dates, location }: { dates?: string; location?: string }) {
  if (!dates && !location) return null;
  return (
    <p className="shrink-0 font-mono text-xs text-muted sm:text-right">
      {dates}
      {dates && location ? <span aria-hidden> · </span> : null}
      {location}
    </p>
  );
}

function Entry({ entry }: { entry: ResumeEntry }) {
  return (
    <div className="py-6 first:pt-0 last:pb-0">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
        <h3 className="text-lg leading-snug font-medium tracking-tight">
          {entry.org}
          {entry.detail ? <span className="font-normal text-muted"> · {entry.detail}</span> : null}
        </h3>
        <Meta dates={entry.dates} location={entry.location} />
      </div>

      {entry.lines?.map((line) => (
        <p key={line} className="mt-1 text-muted">
          {line}
        </p>
      ))}

      {entry.bullets ? <Bullets items={entry.bullets} /> : null}

      {entry.roles?.map((role) => (
        <div key={role.title} className="mt-5 border-l-2 border-accent-soft pl-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
            <h4 className="font-medium text-accent">{role.title}</h4>
            <Meta dates={role.dates} />
          </div>
          <Bullets items={role.bullets} />
        </div>
      ))}
    </div>
  );
}

function SectionLabel({ children, id }: { children: React.ReactNode; id: string }) {
  return (
    <h2 id={id} className="font-mono text-xs tracking-[0.2em] text-accent uppercase lg:sticky lg:top-28">
      {children}
    </h2>
  );
}

function Chips({ items }: { items: string[] }) {
  return (
    <ul className="mt-3 flex flex-wrap gap-2">
      {items.map((item) => (
        <li key={item} className="rounded-lg border border-border bg-surface px-3 py-1 text-sm">
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function ResumePage() {
  return (
    <>
      {/* ── Header ───────────────────────────────────────────── */}
      <section>
        <Container className="pt-20 pb-12 sm:pt-28">
          <Reveal>
            <p className="font-mono text-xs tracking-[0.2em] text-accent uppercase">Resume</p>
            <h1 className="mt-5 text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.02] font-medium tracking-[-0.04em] text-fade">
              {resume.name}
            </h1>
          </Reveal>
          <Reveal delay={120} className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href={site.links.resume}
              download="Frances Rose Weseley Resume.pdf"
              className="group inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-medium text-white shadow-[0_0_40px_-8px_rgb(236_72_153/0.45)] transition hover:bg-accent/90"
            >
              <DownloadIcon />
              Download Resume
            </a>
            {!isPlaceholderLink(site.links.linkedin) ? (
              <a
                href={site.links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-5 py-3 text-sm font-medium transition hover:border-border-strong hover:bg-surface-2"
              >
                LinkedIn <span aria-hidden className="text-muted">↗</span>
              </a>
            ) : null}
          </Reveal>
        </Container>
      </section>

      {/* ── Sections ─────────────────────────────────────────── */}
      <Container className="space-y-6">
        {resume.sections.map((section) => (
          <Reveal key={section.id} as="section" className="glass grid gap-6 rounded-3xl p-6 sm:p-8 lg:grid-cols-[13rem_1fr] lg:gap-10">
            <div>
              <SectionLabel id={section.id}>{section.title}</SectionLabel>
            </div>
            <div className="divide-y divide-border" aria-labelledby={section.id}>
              {section.entries.map((entry) => (
                <Entry key={entry.org + (entry.detail ?? "")} entry={entry} />
              ))}
            </div>
          </Reveal>
        ))}

        <Reveal as="section" className="glass grid gap-6 rounded-3xl p-6 sm:p-8 lg:grid-cols-[13rem_1fr] lg:gap-10">
          <div>
            <SectionLabel id="skills">Skills &amp; Interests</SectionLabel>
          </div>
          <div className="space-y-6" aria-labelledby="skills">
            <div>
              <h3 className="font-medium">Skills</h3>
              <Chips items={resume.skills} />
            </div>
            <div>
              <h3 className="font-medium">Languages</h3>
              <Chips items={resume.languages} />
            </div>
            <div>
              <h3 className="font-medium">Interests</h3>
              <Chips items={resume.interests} />
            </div>
          </div>
        </Reveal>
      </Container>
    </>
  );
}

function DownloadIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v12m0 0-4-4m4 4 4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </svg>
  );
}
