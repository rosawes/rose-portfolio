"use client";

import { useActionState } from "react";
import { MAJORS } from "../../domain/majors";
import { RACE_STATUSES } from "../../domain/types";
import { formatDuration } from "../../domain/units";
import { saveRace } from "../../server/actions";
import { type AdminRaceRow } from "../../server/rows";
import { Checkbox, Field, fieldProps, FormMessage, initialState, inputClass, SubmitButton } from "./form-kit";

const STATUS_LABELS: Record<string, string> = {
  planned: "Planned",
  registered: "Registered",
  completed: "Completed",
  dns: "Did not start",
  dnf: "Did not finish",
};

function distanceKey(m: number | string | undefined): string {
  const d = Number(m ?? 42195);
  if (d < 6000) return "5k";
  if (d < 15000) return "10k";
  if (d < 30000) return "half";
  return "marathon";
}

export function RaceForm({ race }: { race?: AdminRaceRow }) {
  const [state, action] = useActionState(saveRace, initialState);
  const e = state.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-5">
      {race ? <input type="hidden" name="id" value={race.id} /> : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Race name" name="name" error={e.name} className="sm:col-span-2">
          <input {...fieldProps("name", state, race?.name)} required className={inputClass} placeholder="Chicago Marathon" />
        </Field>
        <Field label="World Major" name="major" error={e.major}>
          <select {...fieldProps("major", state, race?.major ?? "")} className={inputClass}>
            <option value="">Not a Major</option>
            {MAJORS.map((m) => (
              <option key={m.slug} value={m.slug}>
                {m.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Year" name="year" error={e.year}>
          <input {...fieldProps("year", state, race?.race_year ?? new Date().getFullYear())} inputMode="numeric" required className={inputClass} />
        </Field>
        <Field label="Date" name="date" error={e.date} hint="Leave blank if not set yet.">
          <input {...fieldProps("date", state, race?.race_date)} type="date" className={inputClass} />
        </Field>
        <Field label="City" name="city" error={e.city}>
          <input {...fieldProps("city", state, race?.city)} className={inputClass} />
        </Field>
        <Field label="Distance" name="distance" error={e.distance}>
          <select {...fieldProps("distance", state, distanceKey(race?.distance_m))} className={inputClass}>
            <option value="marathon">Marathon</option>
            <option value="half">Half marathon</option>
            <option value="10k">10K</option>
            <option value="5k">5K</option>
          </select>
        </Field>
        <Field label="Status" name="status" error={e.status}>
          <select {...fieldProps("status", state, race?.status ?? "planned")} className={inputClass}>
            {RACE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Official finish time" name="officialTime" error={e.officialTime} hint="Completed races only, h:mm:ss.">
          <input {...fieldProps("officialTime", state, race?.official_time_s ? formatDuration(race.official_time_s) : "")} placeholder="3:58:00" className={inputClass} />
        </Field>
        <Field label="Goal time" name="goalTime" error={e.goalTime}>
          <input {...fieldProps("goalTime", state, race?.goal_time_s ? formatDuration(race.goal_time_s) : "")} placeholder="3:50:00" className={inputClass} />
        </Field>
      </div>
      <Field label="Race story" name="story" error={e.story} hint="Shown publicly on the Majors map.">
        <textarea {...fieldProps("story", state, race?.story)} rows={5} className={inputClass} />
      </Field>
      <div className="space-y-3">
        <Checkbox
          name="timeIsPlaceholder"
          label="Finish time is approximate"
          hint="Shows as ~3:58 until you enter the official time."
          defaultChecked={race?.time_is_placeholder ?? false}
          state={state}
        />
        <Checkbox name="isPublic" label="Show publicly" defaultChecked={race?.is_public ?? true} state={state} />
      </div>
      <FormMessage state={state} />
      <SubmitButton>{race ? "Save race" : "Add race"}</SubmitButton>
    </form>
  );
}
