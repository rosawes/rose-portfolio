export function SectionHeading({
  id,
  index,
  kicker,
  title,
  children,
}: {
  id: string;
  index: string;
  kicker: string;
  title: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="max-w-3xl">
      <p className="flex items-center gap-3 font-mono text-xs tracking-[0.2em] text-accent uppercase">
        <span className="grid size-7 place-items-center rounded-full bg-accent text-[11px] font-semibold tracking-normal text-white">
          {index}
        </span>
        {kicker}
      </p>
      <h2 id={id} className="mt-5 text-4xl font-medium tracking-[-0.035em] text-fade sm:text-5xl">
        {title}
      </h2>
      {children ? <div className="mt-4 text-lg leading-relaxed text-muted">{children}</div> : null}
    </div>
  );
}
