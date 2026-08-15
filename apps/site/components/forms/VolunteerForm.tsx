"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2, UserPlus } from "lucide-react";
import {
  AVAILABILITIES,
  PROGRAMS,
  translateError,
  type Dictionary,
} from "@qardan/shared";
import type { SiteUi } from "@/content";
import { submitVolunteer } from "@/lib/actions";
import { INITIAL_FORM_STATE } from "@/lib/form-state";
import { Field, OptionCard, TextArea, TextInput, Toggle } from "./fields";

export function VolunteerForm({ dict, ui }: { dict: Dictionary; ui: SiteUi }) {
  const [state, formAction, pending] = useActionState(submitVolunteer, INITIAL_FORM_STATE);
  const errs = state.errors ?? {};
  const err = (field: string) => (errs[field] ? translateError(dict, errs[field]) : undefined);

  if (state.status === "success") {
    return (
      <div className="card p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-leaf" aria-hidden />
        <h2 className="mt-4 font-display text-h1 text-light-text dark:text-dark-text">
          {ui.volunteer.successTitle}
        </h2>
        <p className="mt-3 text-light-muted dark:text-dark-muted">{ui.volunteer.successText}</p>
        {state.reference && (
          <p className="ltr-nums mt-5 rounded-full bg-leaf/10 px-5 py-2 font-mono text-sm font-bold tracking-wider text-primary dark:text-leaf">
            {state.reference}
          </p>
        )}
      </div>
    );
  }

  return (
    <form action={formAction} className="card p-7 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={dict.fields.fullName} htmlFor="fullName" required error={err("fullName")}>
          <TextInput
            id="fullName"
            autoComplete="name"
            placeholder={dict.fields.fullNamePlaceholder}
            error={err("fullName")}
          />
        </Field>

        <Field label={dict.fields.phone} htmlFor="phone" required error={err("phone")}>
          <TextInput
            id="phone"
            type="tel"
            dir="ltr"
            autoComplete="tel"
            placeholder={dict.fields.phonePlaceholder}
            error={err("phone")}
          />
        </Field>

        <Field label={dict.fields.emailOptional} htmlFor="email" error={err("email")}>
          <TextInput id="email" type="email" dir="ltr" autoComplete="email" error={err("email")} />
        </Field>

        <Field label={dict.fields.city} htmlFor="city" required error={err("city")}>
          <TextInput id="city" placeholder={dict.fields.cityPlaceholder} error={err("city")} />
        </Field>

        <Field
          label={dict.fields.birthYear}
          htmlFor="birthYear"
          required
          error={err("birthYear")}
          hint={ui.volunteer.birthYearHint}
        >
          <TextInput
            id="birthYear"
            type="number"
            inputMode="numeric"
            dir="ltr"
            min={1930}
            max={new Date().getFullYear() - 15}
            placeholder="1998"
            error={err("birthYear")}
          />
        </Field>
      </div>

      <fieldset className="mt-8">
        <legend className="mb-3 text-caption font-semibold text-light-text dark:text-dark-text">
          {ui.volunteer.programsLegend} <span className="text-danger">*</span>
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {PROGRAMS.map((p) => (
            <OptionCard
              key={p.slug}
              type="checkbox"
              name="programs"
              value={p.slug}
              label={dict.programs[p.slug].name}
              hint={dict.programs[p.slug].tagline}
              accentColor={p.color}
            />
          ))}
        </div>
        {err("programs") && (
          <p role="alert" className="mt-3 text-caption font-medium text-danger">
            {err("programs")}
          </p>
        )}
      </fieldset>

      <fieldset className="mt-8">
        <legend className="mb-3 text-caption font-semibold text-light-text dark:text-dark-text">
          {ui.volunteer.availabilityLegend} <span className="text-danger">*</span>
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {AVAILABILITIES.map((a) => (
            <OptionCard
              key={a}
              type="checkbox"
              name="availability"
              value={a}
              label={dict.availability[a]}
            />
          ))}
        </div>
        {err("availability") && (
          <p role="alert" className="mt-3 text-caption font-medium text-danger">
            {err("availability")}
          </p>
        )}
      </fieldset>

      <div className="mt-8 grid gap-5">
        <Field
          label={dict.fields.skills}
          htmlFor="skills"
          error={err("skills")}
          hint={ui.volunteer.skillsHint}
        >
          <TextInput
            id="skills"
            placeholder={dict.fields.skillsPlaceholder}
            error={err("skills")}
          />
        </Field>

        <Field
          label={dict.fields.motivation}
          htmlFor="motivation"
          required
          error={err("motivation")}
        >
          <TextArea
            id="motivation"
            rows={5}
            placeholder={dict.fields.motivationPlaceholder}
            error={err("motivation")}
          />
        </Field>

        <Toggle
          id="wantsMembership"
          name="wantsMembership"
          label={ui.volunteer.membership}
          hint={ui.volunteer.membershipHint}
        />
      </div>

      {state.status === "error" && state.messageKey && (
        <p
          role="alert"
          className="mt-5 rounded-md border border-danger/40 bg-danger/10 px-4 py-3 text-caption font-medium text-danger"
        >
          {translateError(dict, state.messageKey)}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-primary mt-7 w-full sm:w-auto">
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {ui.common.sending}
          </>
        ) : (
          <>
            <UserPlus className="h-4 w-4" />
            {ui.volunteer.submit}
          </>
        )}
      </button>
    </form>
  );
}
