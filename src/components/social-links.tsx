import { isPlaceholderLink, site } from "@/content/site";

const items = [
  { key: "github", label: "GitHub", href: site.links.github },
  { key: "linkedin", label: "LinkedIn", href: site.links.linkedin },
  { key: "email", label: "Email", href: site.links.email },
] as const;

/** Profile links. Any link left blank in site.ts is simply not shown. */
export function SocialLinks({ className = "" }: { className?: string }) {
  const visible = items.filter((item) => !isPlaceholderLink(item.href));
  return (
    <ul className={`flex flex-wrap gap-2 ${className}`}>
      {visible.map((item) => {
        const external = item.href.startsWith("http");
        return (
          <li key={item.key}>
            <a
              href={item.href}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="group inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-4 py-2 text-sm text-text transition hover:border-border-strong hover:bg-surface-2"
            >
              {item.label}
              <span aria-hidden className="text-muted transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent">↗</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
