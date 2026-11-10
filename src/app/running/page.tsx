import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { Container } from "@/components/container";
import { Reveal } from "@/components/reveal";
import { site } from "@/content/site";
import { lifetimeRaised } from "@/running/domain/fundraising";
import { formatRaised } from "@/running/domain/money";
import { selectRuns, summarize } from "@/running/domain/stats";
import { type PublicArchive } from "@/running/domain/types";
import { formatMiles } from "@/running/domain/units";
import { ImpactSection } from "@/running/components/impact/impact-section";
import { MajorsExplorer } from "@/running/components/majors/majors-explorer";
import { buildWorldMap, WorldMapBackground } from "@/running/components/majors/world-map";
import { MilesSection } from "@/running/components/miles/miles-section";
import { SectionNav } from "@/running/components/section-nav";
import { EmptyState } from "@/running/components/ui/empty-state";
import { SectionHeading } from "@/running/components/ui/section-heading";
import { getPublicArchive } from "@/running/server/public-archive";

export const metadata: Metadata = {
  title: "The Running Archive",
  description: "Rose Weseley's running, marathon, and fundraising journey: miles logged, World Marathon Majors, and money raised for charity.",
};

export default function RunningPage() {
  return (
    <>
      <section>
        <Container className="pt-20 pb-10 sm:pt-28">
          <Reveal>
            <p className="font-mono text-xs tracking-[0.2em] text-accent uppercase">Running</p>
            <h1 className="mt-5 text-[clamp(2.75rem,8vw,6rem)] leading-[0.95] font-medium tracking-[-0.045em] text-fade">
              The Running Archive
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
              Tracking my miles, marathon milestones, and the impact I&rsquo;ve made along the way.
            </p>
          </Reveal>
        </Container>
      </section>
      <Suspense fallback={<ArchiveSkeleton />}>
        <ArchiveContent />
      </Suspense>
      <section aria-label="Follow along on Strava">
        <Container className="pt-24 pb-8">
          <Reveal className="border-t border-border pt-10">
            <a
              href={site.links.strava}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1.5 text-lg font-medium text-text"
            >
              <span className="underline decoration-accent decoration-2 underline-offset-4 transition group-hover:text-accent">
                Follow my runs on Strava
              </span>
              <span aria-hidden className="text-accent transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                ↗
              </span>
            </a>
          </Reveal>
        </Container>
      </section>
    </>
  );
}

async function ArchiveContent() {
  let result: Awaited<ReturnType<typeof getPublicArchive>>;
  try {
    result = await getPublicArchive();
  } catch (err) {
    console.error(err);
    // Make the error state dynamic so a temporary outage is never baked into the cached page.
    await connection();
    return (
      <Container>
        <EmptyState title="The archive is taking a breather">
          The data couldn&rsquo;t be loaded right now. Please try again in a minute.
        </EmptyState>
      </Container>
    );
  }

  if (result.status !== "ok") {
    return (
      <Container>
        <EmptyState title="Coming soon">
          {result.status === "not-configured"
            ? "The Running Archive isn't connected to its database yet."
            : "This runner's archive hasn't been published yet."}
        </EmptyState>
      </Container>
    );
  }

  return <Archive archive={result.archive} />;
}

function Archive({ archive }: { archive: PublicArchive }) {
  const runs = selectRuns(archive.activities);
  const summary = summarize(runs);
  const raised = lifetimeRaised(archive.campaigns, archive.contributions);
  const majorsDone = new Set(archive.races.filter((r) => r.major && r.status === "completed").map((r) => r.major)).size;
  const { landPath, pins } = buildWorldMap();

  return (
    <>
      <Container className="pb-10">
        <Reveal delay={100} className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <HeroStat value={formatMiles(summary.distanceM)} label="miles logged" />
          <HeroStat value={summary.runs.toLocaleString("en-US")} label="runs logged" />
          <HeroStat value={`${majorsDone}/7`} label="Majors completed" />
          <HeroStat value={formatRaised(raised.cents, raised.isMinimum)} label="raised for charity" />
        </Reveal>
      </Container>

      <SectionNav />

      <div className="space-y-28 pt-16">
        <section aria-labelledby="miles-title" id="miles" className="scroll-mt-36">
          <Container>
            <SectionHeading id="miles-title" index="1" kicker="The Miles" title="Every run, counted.">
              Mileage, pace, and consistency from my logged runs. Data imported from Strava.
            </SectionHeading>
            <div className="mt-10">
              <MilesSection activities={archive.activities} races={archive.races} />
            </div>
          </Container>
        </section>

        <section aria-labelledby="majors-title" id="majors" className="scroll-mt-36">
          <Container>
            <SectionHeading id="majors-title" index="2" kicker="The Majors" title="Seven cities, one goal.">
              I&rsquo;m working toward all seven World Marathon Majors, and running NYC every year. Tap a city to see where
              it stands.
            </SectionHeading>
            <div className="mt-10">
              <MajorsExplorer
                map={<WorldMapBackground landPath={landPath} />}
                pins={pins}
                races={archive.races}
                campaigns={archive.campaigns}
                contributions={archive.contributions}
              />
            </div>
          </Container>
        </section>

        <section aria-labelledby="impact-title" id="impact" className="scroll-mt-36">
          <Container>
            <SectionHeading id="impact-title" index="3" kicker="The Impact" title="Miles that give back.">
              For the 2026 NYC Marathon, I raised $7,160 for breast cancer research at Memorial Sloan Kettering
              Cancer Center as part of Fred&rsquo;s Team. Here&rsquo;s where it came from, and what&rsquo;s next.
            </SectionHeading>
            <div className="mt-10">
              <ImpactSection campaigns={archive.campaigns} contributions={archive.contributions} />
            </div>
          </Container>
        </section>
      </div>
    </>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="glass rounded-2xl p-5">
      <p className="text-3xl font-medium tracking-[-0.03em] tabular-nums sm:text-4xl">{value}</p>
      <p className="mt-1 text-sm text-muted">{label}</p>
    </div>
  );
}

function ArchiveSkeleton() {
  return (
    <Container>
      <div aria-busy="true" aria-label="Loading the Running Archive">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-surface-2" />
        ))}
      </div>
      <div className="mt-10 h-72 animate-pulse rounded-3xl bg-surface-2" />
      </div>
    </Container>
  );
}
