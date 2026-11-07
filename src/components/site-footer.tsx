import Link from "next/link";
import { site } from "@/content/site";
import { Container } from "./container";
import { SocialLinks } from "./social-links";

export function SiteFooter() {
  return (
    <footer className="relative mt-32 overflow-hidden">
      <div className="glow-line" aria-hidden />
      {/* Soft glow rising from the bottom edge */}
      <div aria-hidden className="pointer-events-none absolute -bottom-40 left-1/2 h-72 w-[700px] -translate-x-1/2 rounded-full bg-accent-soft/30 blur-[120px]" />
      <Container className="relative flex flex-col gap-10 py-16 md:flex-row md:items-end md:justify-between">
        <div className="max-w-md">
          <p className="text-3xl font-medium tracking-tight sm:text-4xl">
            <span className="text-fade">Thanks for </span>
            <span className="text-fade">stopping by.</span>
          </p>
          <SocialLinks className="mt-6" />
        </div>
        <div className="flex flex-col gap-3 font-mono text-xs text-muted md:items-end">
          <nav aria-label="Footer" className="flex gap-5">
            <Link href="/" className="hover:text-text">Home</Link>
            <Link href="/projects" className="hover:text-text">Work</Link>
            <Link href="/about" className="hover:text-text">About</Link>
            <Link href="/resume" className="hover:text-text">Resume</Link>
          </nav>
          <p>© {site.name} · Built with Next.js, TypeScript &amp; Tailwind</p>
        </div>
      </Container>
    </footer>
  );
}
