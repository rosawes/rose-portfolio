/** A big number with a label: the building block of the dashboard. */
export function Stat({
  label,
  value,
  unit,
  hint,
  className = "",
}: {
  label: string;
  value: string;
  unit?: string;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={`glass rounded-2xl p-5 ${className}`}>
      <p className="font-mono text-[11px] tracking-[0.16em] text-muted uppercase">{label}</p>
      <p className="mt-2 text-3xl font-medium tracking-[-0.03em] tabular-nums sm:text-4xl">
        {value}
        {unit ? <span className="ml-1 text-base font-normal text-muted">{unit}</span> : null}
      </p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}
