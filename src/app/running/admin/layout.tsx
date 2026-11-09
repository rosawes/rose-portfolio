import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/container";
import { signOut } from "@/running/server/actions";

export const metadata: Metadata = {
  title: "Admin · Running Archive",
  robots: { index: false, follow: false },
};

const LINKS = [
  { href: "/running/admin", label: "Overview" },
  { href: "/running/admin/activities", label: "Runs" },
  { href: "/running/admin/races", label: "Races" },
  { href: "/running/admin/campaigns", label: "Fundraising" },
];

export default function AdminLayout({ children }: LayoutProps<"/running/admin">) {
  return (
    <Container className="pt-12 pb-8 sm:pt-16">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <p className="font-mono text-xs tracking-[0.2em] text-accent uppercase">Private admin</p>
          <nav aria-label="Admin" className="mt-2 flex flex-wrap gap-1">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="rounded-lg px-3 py-1.5 text-sm text-muted hover:bg-surface-2 hover:text-text">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/running" className="rounded-xl border border-border px-3 py-1.5 text-sm hover:bg-surface-2">
            View public page ↗
          </Link>
          <form action={signOut}>
            <button type="submit" className="rounded-xl px-3 py-1.5 text-sm text-muted hover:bg-surface-2 hover:text-text">
              Sign out
            </button>
          </form>
        </div>
      </div>
      {children}
    </Container>
  );
}
