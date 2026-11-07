/**
 * Site-wide settings. Edit these values to update your name, bio and links
 * everywhere on the site at once.
 *
 * Leave a link as "" to hide it. Links are only shown once they're filled in.
 */
export const site = {
  name: "Rose Weseley",
  shortName: "Rose",
  initials: "RW",
  // Shown in the browser tab and in link previews.
  description:
    "Rose Weseley studied Computer Science and Economics at Wellesley and works in technology and strategy consulting at PwC.",
  interests: ["AI", "Software engineering", "Startups", "Product design", "Automation", "Strategy"],
  photo: {
    src: "/rose.jpg",
    alt: "Portrait of Rose Weseley",
  },
  links: {
    github: "https://github.com/rosawes",
    // TODO(Rose): add your LinkedIn URL, e.g. "https://www.linkedin.com/in/…"
    linkedin: "",
    // TODO(Rose): add the email you want public, as "mailto:you@example.com"
    email: "",
    // TODO(Rose): add a resume PDF to /public and set this to e.g. "/resume.pdf"
    resume: "",
  },
} as const;

export function isPlaceholderLink(href: string) {
  return href === "" || href === "#" || href.includes("YOUR-");
}
