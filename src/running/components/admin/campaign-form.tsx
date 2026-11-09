"use client";

import { useActionState } from "react";
import { CAMPAIGN_STATUSES } from "../../domain/types";
import { saveCampaign } from "../../server/actions";
import { type AdminCampaignRow } from "../../server/rows";
import { Checkbox, Field, fieldProps, FormMessage, initialState, inputClass, SubmitButton } from "./form-kit";

const dollars = (cents: number | string | null | undefined) =>
  cents == null ? "" : (Number(cents) / 100).toFixed(Number(cents) % 100 === 0 ? 0 : 2);

export function CampaignForm({
  campaign,
  races,
}: {
  campaign?: AdminCampaignRow;
  races: { id: string; name: string; race_year: number }[];
}) {
  const [state, action] = useActionState(saveCampaign, initialState);
  const e = state.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-5">
      {campaign ? <input type="hidden" name="id" value={campaign.id} /> : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Title" name="title" error={e.title}>
          <input {...fieldProps("title", state, campaign?.title)} required className={inputClass} placeholder="Chicago Marathon 2028" />
        </Field>
        <Field label="Race" name="raceId" error={e.raceId}>
          <select {...fieldProps("raceId", state, campaign?.race_id ?? "")} className={inputClass}>
            <option value="">No race</option>
            {races.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} {r.race_year}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Status" name="status" error={e.status}>
          <select {...fieldProps("status", state, campaign?.status ?? "planned")} className={inputClass}>
            {CAMPAIGN_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s[0].toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Charity" name="charityName" error={e.charityName}>
          <input {...fieldProps("charityName", state, campaign?.charity_name)} className={inputClass} />
        </Field>
        <Field label="Charity team" name="charityTeam" error={e.charityTeam}>
          <input {...fieldProps("charityTeam", state, campaign?.charity_team)} className={inputClass} placeholder="Fred's Team" />
        </Field>
        <Field label="Official donation page" name="donationUrl" error={e.donationUrl} hint="Optional https:// link.">
          <input {...fieldProps("donationUrl", state, campaign?.donation_url)} type="url" className={inputClass} />
        </Field>
        <Field label="Goal ($)" name="goal" error={e.goal}>
          <input {...fieldProps("goal", state, dollars(campaign?.goal_cents))} inputMode="decimal" required className={inputClass} placeholder="5,000" />
        </Field>
        <Field label="Total raised ($)" name="reportedRaised" error={e.reportedRaised} hint="Leave blank to add up the donations below.">
          <input {...fieldProps("reportedRaised", state, dollars(campaign?.reported_raised_cents))} inputMode="decimal" className={inputClass} />
        </Field>
      </div>
      <Field label="Campaign story" name="story" error={e.story}>
        <textarea {...fieldProps("story", state, campaign?.story)} rows={4} className={inputClass} />
      </Field>
      <div className="space-y-3">
        <Checkbox
          name="raisedIsMinimum"
          label="Total is a minimum (show as “$7,000+”)"
          defaultChecked={campaign?.raised_is_minimum ?? false}
          state={state}
        />
        <Checkbox name="isConfirmed" label="Participation is confirmed" defaultChecked={campaign?.is_confirmed ?? false} state={state} />
        <Checkbox name="isPublic" label="Show publicly" defaultChecked={campaign?.is_public ?? true} state={state} />
      </div>
      <FormMessage state={state} />
      <SubmitButton>{campaign ? "Save campaign" : "Create campaign"}</SubmitButton>
    </form>
  );
}
