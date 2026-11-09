"use client";
/** Small, consistent form building blocks for the admin. */
import { useFormStatus } from "react-dom";
import { type FormState } from "../../server/actions";

export const inputClass =
  "w-full rounded-xl border border-border-strong bg-white px-3 py-2 text-sm text-text outline-none transition placeholder:text-muted/70 focus:border-accent focus:ring-2 focus:ring-accent/20 aria-[invalid=true]:border-red-500";

export function Field({
  label,
  name,
  error,
  hint,
  children,
  className = "",
}: {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${name}-error`} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1 text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

/** Props that wire an input to its label and error message. */
export function fieldProps(name: string, state: FormState, defaultValue?: string | number | null) {
  const err = state.fieldErrors?.[name];
  return {
    id: name,
    name,
    defaultValue: state.values?.[name] ?? (defaultValue == null ? "" : String(defaultValue)),
    "aria-invalid": err ? true : undefined,
    "aria-describedby": err ? `${name}-error` : undefined,
  };
}

export function Checkbox({
  name,
  label,
  defaultChecked,
  state,
  hint,
}: {
  name: string;
  label: string;
  defaultChecked: boolean;
  state: FormState;
  hint?: string;
}) {
  const checked = state.values ? state.values[name] === "on" : defaultChecked;
  return (
    <label className="flex items-start gap-2.5 text-sm">
      <input type="checkbox" name={name} defaultChecked={checked} className="mt-0.5 size-4 accent-[var(--accent)]" />
      <span>
        {label}
        {hint ? <span className="block text-xs text-muted">{hint}</span> : null}
      </span>
    </label>
  );
}

export function SubmitButton({ children, pendingText = "Saving…" }: { children: React.ReactNode; pendingText?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent/90 disabled:cursor-wait disabled:opacity-60"
    >
      {pending ? pendingText : children}
    </button>
  );
}

export function FormMessage({ state }: { state: FormState }) {
  if (!state.message) return null;
  const styles = {
    error: "border-red-200 bg-red-50 text-red-700",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    idle: "",
  }[state.status];
  return (
    <p role={state.status === "error" ? "alert" : "status"} className={`rounded-xl border px-3 py-2 text-sm ${styles}`}>
      {state.message}
    </p>
  );
}

export const initialState: FormState = { status: "idle" };
