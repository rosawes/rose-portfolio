/** Soft, slowly drifting color glows behind the top of every page. Pure CSS. */
export function Aurora() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[900px] overflow-hidden">
      <div className="absolute -top-64 left-1/2 h-[640px] w-[900px] -translate-x-[70%] animate-aurora rounded-full bg-accent-2/15 blur-[140px]" />
      <div className="absolute -top-40 left-1/2 h-[520px] w-[720px] -translate-x-[5%] animate-aurora rounded-full bg-accent-soft/30 blur-[140px] [animation-delay:-6s]" />
      <div className="absolute top-40 left-1/2 h-[380px] w-[520px] -translate-x-1/2 animate-aurora rounded-full bg-accent-soft/20 blur-[120px] [animation-delay:-12s]" />
      <div className="absolute top-10 left-1/2 h-[320px] w-[420px] translate-x-[10%] animate-aurora rounded-full bg-accent-2/10 blur-[120px] [animation-delay:-9s]" />
      {/* Fade into the page background. */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-bg" />
    </div>
  );
}
