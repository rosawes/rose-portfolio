import type { Metadata } from "next";
import { Container } from "@/components/container";
import { ProjectBoard } from "@/components/project-board";
import { Reveal } from "@/components/reveal";
import { projects } from "@/content/projects";

export const metadata: Metadata = {
  title: "Work",
  description: "Projects by Rose Weseley: work, school and side projects."
};

export default function ProjectsPage() {
  return (
    <section>
      <Container className="pt-20 pb-8 sm:pt-28">
        <Reveal>
          <p className="font-mono text-xs tracking-[0.2em] text-accent uppercase">Work</p>
          <h1 className="mt-5 max-w-3xl text-[clamp(2.5rem,6vw,4.75rem)] leading-[1.02] font-medium tracking-[-0.04em]">
            <span className="text-fade">Things I&rsquo;ve </span>
            <span className="text-fade">worked on.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted">
            A mix of work, school, and side projects. Each one is labeled so you can see what&rsquo;s finished
            and what&rsquo;s still in progress.
          </p>
        </Reveal>
        <Reveal delay={150} className="mt-12">
          <ProjectBoard projects={projects} />
        </Reveal>
      </Container>
    </section>
  );
}
