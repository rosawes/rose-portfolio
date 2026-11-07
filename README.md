# Rose Weseley: Portfolio

Personal portfolio built with Next.js 16 (App Router), TypeScript and Tailwind CSS v4.
Design: clean white background with pink accents. Soft glows, frosted-glass cards with cursor-following light,
an animated "AI core" hero visual, a typing prompt bar, scroll reveals, and honest status
badges on every project. Colors live in `src/app/globals.css`.

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

| Command         | What it does                         |
| --------------- | ------------------------------------ |
| `npm run dev`   | Dev server with hot reload           |
| `npm run build` | Production build (catches errors)    |
| `npm run start` | Serve the production build           |
| `npm run lint`  | ESLint                               |

## Where things live

```
src/
  content/
    site.ts        ← your name, bio, GitHub/LinkedIn/email links
    projects.ts    ← every project (add new ones here)
  app/
    page.tsx               ← homepage (incl. the "Currently" note)
    about/page.tsx         ← About page
    projects/page.tsx      ← project index with status filters
    projects/[slug]/page.tsx ← case-study template
    globals.css            ← colors and fonts
  components/      ← cards, stamps, header, footer, etc.
```

## Add a project

1. Open `src/content/projects.ts`.
2. Copy an existing object in the `projects` array and edit it.
3. Choose an honest `status`: `case-study`, `in-progress`, `design-concept`, or `coming-soon`.
4. Set `featured: true` to show it on the homepage.

The homepage, `/projects`, and `/projects/<slug>` update automatically.

## Before publishing: fill in placeholders

Search the project for `TODO(Rose)` and `YOUR-`:

- GitHub, LinkedIn, and email URLs in `src/content/site.ts`
- Resume link (`site.links.resume`; the resume link stays hidden until set)
- Figma prototype link and project timeframes/roles in `projects.ts`
- Personal paragraphs on the About page

Placeholder project links (`href: "#"`) render as "(link coming)" instead of a broken link.

## Notes

- `package.json` pins `magic-string` to `0.30.21` via `overrides`. Newer magic-string
  releases are ESM-only and break Tailwind's Turbopack loader. Remove the override once
  `@tailwindcss/turbopack` is updated.
- Recommended Node.js: the current LTS (v22.12+ or v24). The project builds on v21.6.2,
  but that version is end-of-life.
