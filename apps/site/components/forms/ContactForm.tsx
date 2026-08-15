"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { CONTACT_SUBJECTS, translateError, type Dictionary } from "@qardan/shared";
import type { SiteUi } from "@/content";
import { submitContact } from "@/lib/actions";
import { INITIAL_FORM_STATE } from "@/lib/form-state";
import { Field, Select, TextArea, TextInput } from "./fields";

export function ContactForm({ dict, ui }: { dict: Dictionary; ui: SiteUi }) {
  const [state, formAction, pending] = useActionState(submitContact, INITIAL_FORM_STATE);
  const errs = state.errors ?? {};
  const err = (field: string) => (errs[field] ? translateError(dict, errs[field]) : undefined);

  if (state.status === "success") {
    return (
      <div className="card p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-leaf" aria-hidden />
        <h2 className="mt-4 font-display text-h1 text-light-text dark:text-dark-text">
          {ui.contact.successTitle}
        </h2>
        <p className="mt-3 text-light-muted dark:text-dark-muted">{ui.contact.successText}</p>
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
        <Field label={dict.fields.fullName} htmlFor="name" required error={err("name")}>
          <TextInput
            id="name"
            autoComplete="name"
            placeholder={dict.fields.fullNamePlaceholder}
            error={err("name")}
          />
        </Field>

        <Field label={dict.fields.email} htmlFor="email" required error={err("email")}>
          <TextInput
            id="email"
            type="email"
            dir="ltr"
            autoComplete="email"
            placeholder={dict.fields.emailPlaceholder}
            error={err("email")}
          />
        </Field>

        <Field label={dict.fields.phoneOptional} htmlFor="phone" error={err("phone")}>
          <TextInput
            id="phone"
            type="tel"
            dir="ltr"
            autoComplete="tel"
            placeholder={dict.fields.phonePlaceholder}
            error={err("phone")}
          />
        </Field>

        <Field label={dict.fields.subject} htmlFor="subject" required error={err("subject")}>
          <Select id="subject" defaultValue="autre" error={err("subject")}>
            {CONTACT_SUBJECTS.map((value) => (
              <option key={value} value={value}>
                {dict.contactSubjects[value]}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label={dict.fields.message}
          htmlFor="message"
          required
          error={err("message")}
          className="sm:col-span-2"
        >
          <TextArea
            id="message"
            rows={6}
            placeholder={dict.fields.messagePlaceholder}
            error={err("message")}
          />
        </Field>
      </div>

      {state.status === "error" && state.messageKey && (
        <p
          role="alert"
          className="mt-5 rounded-md border border-danger/40 bg-danger/10 px-4 py-3 text-caption font-medium text-danger"
        >
          {translateError(dict, state.messageKey)}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-primary mt-6 w-full sm:w-auto">
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {ui.common.sending}
          </>
        ) : (
          <>
            <Send className="h-4 w-4 rtl:-scale-x-100" />
            {ui.contact.send}
          </>
        )}
      </button>
    </form>
  );
}
