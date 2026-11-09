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
  interests: ["Software Engineering", "Product Design", "Automation", "Creative Technology", "Running"],
  photo: {
    src: "/rose.jpg",
    alt: "Portrait of Rose Weseley",
  },
  links: {
    github: "https://github.com/rosawes",
    linkedin: "https://www.linkedin.com/in/frances-rose-weseley",
    // TODO(Rose): add the email you want public, as "mailto:you@example.com"
    email: "",
    // The PDF lives at public/resume.pdf. Replace that file to update it.
    resume: "/resume.pdf",
  },
} as const;

export function isPlaceholderLink(href: string) {
  return href === "" || href === "#" || href.includes("YOUR-");
}
