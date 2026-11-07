import Link from "next/link";
import { Suspense } from "react";
import { site } from "@/content/site";
import { NavLinks, NavLinksFallback } from "./nav-links";

/** A floating frosted-glass nav bar. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 px-4 pt-4">
      <div className="glass mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 rounded-2xl pr-2 pl-3 shadow-[0_8px_40px_-12px_rgb(0_0_0/0.08)]">
        <Link href="/" className="group flex items-center gap-2.5" aria-label={`${site.name}, home`}>
          <span className="relative grid size-8 place-items-center rounded-lg bg-gradient-to-br from-accent-2 to-accent-soft text-[11px] font-semibold tracking-wide text-white shadow-[0_0_20px_-4px_rgb(236_72_153/0.6)] transition group-hover:shadow-[0_0_28px_-2px_rgb(236_72_153/0.8)]">
            {site.initials}
          </span>
          <span className="hidden text-sm font-medium tracking-tight sm:inline">{site.name}</span>
        </Link>
        <nav aria-label="Main" className="flex items-center gap-1">
          <Suspense fallback={<NavLinksFallback />}>
            <NavLinks />
          </Suspense>
          <a
            href={site.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 inline-flex items-center gap-1.5 rounded-xl bg-accent px-3.5 py-1.5 text-sm font-medium text-white transition hover:bg-accent/90"
          >
            <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="currentColor">
              <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
            </svg>
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}
