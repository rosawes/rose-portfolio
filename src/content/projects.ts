/**
 * ─────────────────────────────────────────────────────────────
 *  PROJECTS
 * ─────────────────────────────────────────────────────────────
 * Every project on the site comes from this list. To add one:
 *   1. Copy an existing object below.
 *   2. Give it a unique `slug` (this becomes /projects/<slug>).
 *   3. Pick an honest `status` — the site displays it as a stamp.
 * The homepage, /projects and the case-study page update automatically.
 *
 * Writing rule: only describe what actually happened. Keep employer
 * and client details generalized.
 */

export type ProjectStatus =
  | "live" // live product people can use
  | "case-study" // finished work, written up
  | "in-progress" // being built right now
  | "design-concept" // designed, not built
  | "coming-soon"; // planned, not started

export const statusMeta: Record<
  ProjectStatus,
  { label: string; description: string }
> = {
  live: {
    label: "Live",
    description: "Live and in use.",
  },
  "case-study": {
    label: "Case study",
    description: "Shipped work, written up.",
  },
  "in-progress": {
    label: "In progress",
    description: "Currently being built.",
  },
  "design-concept": {
    label: "Design concept",
    description: "Designed and prototyped, not built.",
  },
  "coming-soon": {
    label: "Coming soon",
    description: "Planned. Nothing shipped yet.",
  },
};

export type Accent = "rose" | "blush" | "amber";

export type ProjectSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type ProjectLink = {
  label: string;
  href: string; // use "#" as a placeholder until the link exists
};

export type Project = {
  slug: string;
  title: string;
  /** One line, shown on cards. */
  tagline: string;
  status: ProjectStatus;
  accent: Accent;
  /** Short label for the context, e.g. "Work", "Class project", "Side project". */
  context: string;
  role: string;
  timeframe: string;
  /** Tools used, or areas of focus if tools aren't public/decided. */
  stack: string[];
  /** Optional headline number. Only use real, verifiable figures. */
  metric?: { before?: string; after: string; label: string };
  /** A short note shown in a callout box at the top of the case study. */
  note?: string;
  sections: ProjectSection[];
  links?: ProjectLink[];
  /** Set to true to show on the homepage. */
  featured?: boolean;
  /** Link the card somewhere other than /projects/<slug> (e.g. a live app). */
  href?: string;
  /** Custom visual for the card header instead of the default gradient. */
  preview?: "running-archive";
};

export const projects: Project[] = [
  {
    slug: "operations-hub",
    title: "Operations Hub & Onboarding Automation",
    tagline:
      "An internal operations hub and automated onboarding flow for a 200+ person team.",
    status: "case-study",
    accent: "rose",
    context: "Work",
    role: "Builder", // TODO(Rose): refine your role, e.g. "Designer & developer"
    timeframe: "TBD", // TODO(Rose): add when you built it, e.g. "2025"
    // TODO(Rose): swap these focus areas for the actual tools you used,
    // if you're comfortable sharing them.
    stack: ["Process design", "Workflow automation", "Internal tooling"],
    metric: {
      before: "~20 min",
      after: "~3 min",
      label: "onboarding time per person",
    },
    note: "Details are generalized to respect employer and client confidentiality. No confidential information is shared here.",
    sections: [
      {
        heading: "The problem",
        paragraphs: [
          "Getting a new person set up on a 200+ person team took about 20 minutes each time. With a team that size, those minutes add up.",
          // TODO(Rose): add 1–2 sentences on what made onboarding slow (without confidential detail).
        ],
      },
      {
        heading: "What I built",
        paragraphs: [
          "An internal operations hub that puts the team's operational resources in one place, plus an onboarding automation that handles the repetitive setup steps.",
        ],
        bullets: [
          // TODO(Rose): replace these with the real components of what you built.
          "A central hub for team operations resources",
          "An automated onboarding workflow",
        ],
      },
      {
        heading: "Outcome",
        paragraphs: [
          "Onboarding time dropped from about 20 minutes to about 3 minutes per person.",
          // TODO(Rose): add any other real outcomes (adoption, feedback, time saved over a quarter, etc.).
        ],
      },
      {
        heading: "What I learned",
        paragraphs: [
          // TODO(Rose): write your own reflection here.
          "Reflection coming soon.",
        ],
      },
    ],
    featured: true,
  },
  {
    slug: "sustainable-resale-app",
    title: "Sustainable Clothing Resale App",
    tagline:
      "An app concept for buying and selling secondhand clothing, designed in Figma.",
    status: "design-concept",
    accent: "blush",
    context: "Class project",
    role: "Product designer",
    timeframe: "TBD", // TODO(Rose): add the semester, e.g. "Spring 2024"
    stack: ["Figma", "UX design", "Prototyping"],
    note: "This is a design concept created for a computer science class. It was designed and prototyped in Figma, not built as a working app.",
    sections: [
      {
        heading: "The idea",
        paragraphs: [
          "An app for buying and selling secondhand clothes, designed with sustainability in mind.",
          // TODO(Rose): add the specific problem or user you designed for.
        ],
      },
      {
        heading: "Design process",
        paragraphs: [
          "Designed in Figma as part of a computer science course.",
        ],
        bullets: [
          // TODO(Rose): replace with your real process steps and key screens.
          "Key screens: add yours here",
          "Design decisions: add yours here",
        ],
      },
      {
        heading: "If I built it next",
        paragraphs: [
          // TODO(Rose): optional — what would you change or build first?
          "Notes coming soon.",
        ],
      },
    ],
    // TODO(Rose): add your Figma prototype link (set it to view-only first).
    links: [{ label: "View Figma prototype", href: "#" }],
    featured: true,
  },
  {
    slug: "running-archive",
    title: "The Running Archive",
    tagline:
      "An interactive running and fundraising app tracking my training, marathon goals, and charitable impact.",
    status: "live",
    accent: "rose",
    context: "Side project",
    role: "Builder",
    timeframe: "2026",
    stack: ["Next.js", "TypeScript", "Supabase", "PostgreSQL"],
    sections: [],
    href: "/running",
    preview: "running-archive",
    featured: true,
  },
];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}

export function getAdjacentProject(slug: string) {
  const i = projects.findIndex((p) => p.slug === slug);
  return projects[(i + 1) % projects.length];
}

export function projectNumber(slug: string) {
  const i = projects.findIndex((p) => p.slug === slug);
  return String(i + 1).padStart(2, "0");
}
