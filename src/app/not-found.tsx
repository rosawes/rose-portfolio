import Link from "next/link";
import { Container } from "@/components/container";

export default function NotFound() {
  return (
    <Container className="py-36 text-center">
      <p className="font-mono text-xs tracking-[0.2em] text-accent uppercase">404</p>
      <h1 className="mt-6 text-5xl font-medium tracking-[-0.04em] sm:text-6xl">
        <span className="text-fade">Page not </span>
        <span className="text-fade">found.</span>
      </h1>
      <Link href="/" className="mt-10 inline-block rounded-xl bg-accent px-5 py-3 text-sm font-medium text-white hover:bg-accent/90">
        Back home
      </Link>
    </Container>
  );
}
