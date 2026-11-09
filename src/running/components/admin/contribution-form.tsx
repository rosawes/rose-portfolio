"use client";

import { useActionState, useEffect, useRef } from "react";
import { CONTRIBUTION_CATEGORIES, CONTRIBUTION_CATEGORY_LABELS } from "../../domain/types";
import { saveContribution } from "../../server/actions";
import { type AdminContributionRow } from "../../server/rows";
import { Checkbox, fieldProps, FormMessage, initialState, inputClass, SubmitButton } from "./form-kit";

/** One row: edit an existing contribution, or add a new one (no `contribution`). */
export function ContributionForm({ campaignId, contribution }: { campaignId: string; contribution?: AdminContributionRow }) {
  const [state, action] = useActionState(saveContribution, initialState);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.status === "success" && !contribution) ref.current?.reset();
  }, [state, contribution]);

  const suffix = contribution ? `-${contribution.id.slice(0, 8)}` : "-new";
  const e = state.fieldErrors ?? {};
  const fp = (name: string, v?: string | number | null) => ({ ...fieldProps(name, state, v), id: `${name}${suffix}` });

  return (
    <form ref={ref} action={action} className="grid gap-3 rounded-2xl border border-border bg-white p-4 sm:grid-cols-12 sm:items-end">
      <input type="hidden" name="campaignId" value={campaignId} />
      {contribution ? <input type="hidden" name="id" value={contribution.id} /> : null}
      <label className="text-xs text-muted sm:col-span-2">
        Amount ($)
        <input {...fp("amount", contribution ? Number(contribution.amount_cents) / 100 : "")} inputMode="decimal" required className={`${inputClass} mt-1`} />
        {e.amount ? <span className="text-red-600">{e.amount}</span> : null}
      </label>
      <label className="text-xs text-muted sm:col-span-3">
        Category
        <select {...fp("category", contribution?.category ?? "donations")} className={`${inputClass} mt-1`}>
          {CONTRIBUTION_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CONTRIBUTION_CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
      </label>
      <label className="text-xs text-muted sm:col-span-4">
        Public label (optional)
        <input {...fp("label", contribution?.label)} placeholder="Alfajor bake sale" className={`${inputClass} mt-1`} />
      </label>
      <label className="text-xs text-muted sm:col-span-3">
        Date (optional)
        <input {...fp("occurredOn", contribution?.occurred_on)} type="date" className={`${inputClass} mt-1`} />
        {e.occurredOn ? <span className="text-red-600">{e.occurredOn}</span> : null}
      </label>
      <label className="text-xs text-muted sm:col-span-8">
        Private note (optional, never public)
        <input {...fp("note", contribution?.note)} className={`${inputClass} mt-1`} />
      </label>
      <div className="flex flex-wrap items-center gap-3 sm:col-span-4 sm:justify-end">
        <Checkbox name="isApproximate" label="Approximate" defaultChecked={contribution?.is_approximate ?? false} state={state} />
        <SubmitButton>{contribution ? "Save" : "Add"}</SubmitButton>
      </div>
      {state.message ? (
        <div className="sm:col-span-12">
          <FormMessage state={state} />
        </div>
      ) : null}
    </form>
  );
}
