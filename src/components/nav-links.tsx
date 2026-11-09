"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const navItems = [
  { href: "/projects", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/resume", label: "Resume" },
  { href: "/running", label: "Running" },
] as const;

const base = "rounded-xl px-1.5 py-1.5 text-[13px] sm:px-3 sm:text-sm text-muted transition-colors hover:bg-surface-2 hover:text-text";

export function NavLinks() {
  const pathname = usePathname();
  return (
    <>
      {navItems.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`${base} ${active ? "bg-surface-2 text-text" : ""}`}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}

/** Same links without active state, used while the pathname is resolving. */
export function NavLinksFallback() {
  return (
    <>
      {navItems.map((item) => (
        <Link key={item.href} href={item.href} className={base}>
          {item.label}
        </Link>
      ))}
    </>
  );
}
