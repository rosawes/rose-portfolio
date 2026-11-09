"use client";

import { useActionState } from "react";
import { signIn } from "../../server/actions";
import { Field, fieldProps, FormMessage, initialState, inputClass, SubmitButton } from "./form-kit";

export function LoginForm() {
  const [state, action] = useActionState(signIn, initialState);
  return (
    <form action={action} className="space-y-4">
      <Field label="Email" name="email" error={state.fieldErrors?.email}>
        <input {...fieldProps("email", state)} type="email" autoComplete="email" required className={inputClass} />
      </Field>
      <Field label="Password" name="password" error={state.fieldErrors?.password}>
        <input id="password" name="password" type="password" autoComplete="current-password" required className={inputClass} />
      </Field>
      <FormMessage state={state} />
      <SubmitButton pendingText="Signing in…">Sign in</SubmitButton>
    </form>
  );
}
