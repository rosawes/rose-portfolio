"use client";

/** A delete form that asks for confirmation first. */
export function DeleteButton({
  action,
  fields,
  label = "Delete",
  confirmText,
}: {
  action: (formData: FormData) => Promise<void>;
  fields: Record<string, string>;
  label?: string;
  confirmText: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(confirmText)) e.preventDefault();
      }}
    >
      {Object.entries(fields).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <button type="submit" className="rounded-xl border border-red-200 px-4 py-2 text-sm text-red-700 transition hover:bg-red-50">
        {label}
      </button>
    </form>
  );
}
