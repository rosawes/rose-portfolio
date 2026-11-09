"use client";

import { useActionState, useRef, useEffect } from "react";
import { SPORT_TYPE_LABELS, SPORT_TYPES } from "../../domain/types";
import { formatDuration, metersToMiles } from "../../domain/units";
import { saveActivity } from "../../server/actions";
import { type AdminActivityRow } from "../../server/rows";
import { Checkbox, Field, fieldProps, FormMessage, initialState, inputClass, SubmitButton } from "./form-kit";

/** Add or edit a run. Pace is calculated automatically from distance and moving time. */
export function ActivityForm({ activity, today }: { activity?: AdminActivityRow; today: string }) {
  const [state, action] = useActionState(saveActivity, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  // After a successful "add", clear the form for the next run.
  useEffect(() => {
    if (state.status === "success" && !activity) formRef.current?.reset();
  }, [state, activity]);

  const miles = activity ? (Math.round(metersToMiles(Number(activity.distance_m)) * 100) / 100).toString() : "";
  const e = state.fieldErrors ?? {};

  return (
    <form ref={formRef} action={action} className="space-y-5">
      {activity ? <input type="hidden" name="id" value={activity.id} /> : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Date" name="date" error={e.date}>
          <input {...fieldProps("date", state, activity?.local_date ?? today)} type="date" required className={inputClass} />
        </Field>
        <Field label="Distance" name="distance" error={e.distance}>
          <div className="flex gap-2">
            <input
              {...fieldProps("distance", state, miles)}
              inputMode="decimal"
              placeholder="6.2"
              required
              className={inputClass}
            />
            <select {...fieldProps("unit", state, "mi")} aria-label="Distance unit" className={`${inputClass} w-20`}>
              <option value="mi">mi</option>
              <option value="km">km</option>
            </select>
          </div>
        </Field>
        <Field label="Moving time" name="duration" error={e.duration} hint="h:mm:ss or mm:ss. Used for pace.">
          <input
            {...fieldProps("duration", state, activity ? formatDuration(activity.moving_s) : "")}
            placeholder="52:30"
            required
            className={inputClass}
          />
        </Field>
        <Field label="Type" name="sportType" error={e.sportType}>
          <select {...fieldProps("sportType", state, activity?.sport_type ?? "run")} className={inputClass}>
            {SPORT_TYPES.map((t) => (
              <option key={t} value={t}>
                {SPORT_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <details className="group rounded-xl border border-border bg-surface px-4 py-3" open={Boolean(activity?.elapsed_s || activity?.name || activity?.notes || e.elapsed)}>
        <summary className="cursor-pointer text-sm font-medium">More details (optional)</summary>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Elapsed time" name="elapsed" error={e.elapsed} hint="Total time including stops.">
            <input
              {...fieldProps("elapsed", state, activity?.elapsed_s ? formatDuration(activity.elapsed_s) : "")}
              placeholder="55:10"
              className={inputClass}
            />
          </Field>
          <Field label="Name" name="name" error={e.name} hint="Private. Never shown publicly.">
            <input {...fieldProps("name", state, activity?.name)} placeholder="Easy shakeout" className={inputClass} />
          </Field>
          <Field label="Notes" name="notes" error={e.notes} hint="Private. Never shown publicly." className="sm:col-span-2">
            <textarea {...fieldProps("notes", state, activity?.notes)} rows={3} className={inputClass} />
          </Field>
        </div>
      </details>

      <Checkbox
        name="isPublic"
        label="Show on my public dashboard"
        hint="Unchecked runs are saved but left out of all public stats."
        defaultChecked={activity ? activity.visibility === "public" : true}
        state={state}
      />

      {state.status === "warning" ? <input type="hidden" name="confirmDuplicate" value="on" /> : null}
      <FormMessage state={state} />
      <SubmitButton>{state.status === "warning" ? "Save anyway" : activity ? "Save changes" : "Add run"}</SubmitButton>
    </form>
  );
}
