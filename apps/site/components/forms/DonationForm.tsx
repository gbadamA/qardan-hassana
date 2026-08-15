"use client";

import { useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, HeartHandshake, Loader2, Lock, Printer } from "lucide-react";
import {
  MIN_AMOUNT,
  PAYMENT_METHODS,
  PROGRAMS,
  SUGGESTED_AMOUNTS,
  formatMoney,
  impactTierOf,
  isProgramSlug,
  localePath,
  translateError,
  type Dictionary,
  type Locale,
} from "@qardan/shared";
import type { SiteUi } from "@/content";
import { submitDonation } from "@/lib/actions";
import { INITIAL_FORM_STATE } from "@/lib/form-state";
import { Field, OptionCard, TextArea, TextInput, Toggle } from "./fields";

/**
 * Formulaire de don — mobile-first (la majorité des visiteurs sont sur téléphone) :
 * montants en gros boutons, un seul écran, récapitulatif collant à droite sur grand écran.
 *
 * ⚠️ Aucun encaissement en ligne : le don est une intention + une preuve (voir
 * `manualTransferGateway` dans `lib/actions.ts`). Le texte de l'écran final le dit
 * explicitement au donateur — il ne doit jamais croire avoir payé.
 */
export function DonationForm({
  locale,
  dict,
  ui,
}: {
  locale: Locale;
  dict: Dictionary;
  ui: SiteUi;
}) {
  const params = useSearchParams();
  const preselected = params.get("programme");
  const t = ui.donate.form;

  const [state, formAction, pending] = useActionState(submitDonation, INITIAL_FORM_STATE);
  const [amount, setAmount] = useState<number>(5000);
  const [customAmount, setCustomAmount] = useState<string>("");

  const effectiveAmount = customAmount ? Number(customAmount) || 0 : amount;
  const errs = state.errors ?? {};
  const err = (field: string) => (errs[field] ? translateError(dict, errs[field]) : undefined);

  // ══════════════ Écran de confirmation ══════════════
  if (state.status === "success" && state.receipt) {
    const { receipt } = state;
    const program = receipt.intent.program ? dict.programs[receipt.intent.program] : null;

    return (
      <div className="card overflow-hidden">
        <div className="bg-emerald p-8 text-center text-white">
          <CheckCircle2 className="mx-auto h-14 w-14 text-accent" aria-hidden />
          <h2 className="mt-4 font-display text-h1">
            {t.thanks}, {receipt.intent.donorName}.
          </h2>
          <p className="mt-2 text-white/80">{t.registered}</p>
          <p className="ltr-nums mt-6 rounded-full border border-white/25 bg-white/10 px-5 py-2 font-mono text-lg font-bold tracking-wider">
            {receipt.reference}
          </p>
        </div>

        <div className="p-8">
          <div className="rounded-md border border-warning/40 bg-warning/10 p-5 text-[0.92rem] leading-relaxed text-warning">
            <strong className="font-semibold">{t.notPaid}</strong>{" "}
            {dict.paymentInstructions[receipt.intent.method]}
          </div>

          <dl className="mt-7 divide-y divide-light-border dark:divide-dark-border">
            {[
              [t.amount, formatMoney(receipt.intent.amount, locale)],
              [t.program, program ? program.name : t.generalRecap],
              [t.frequency, receipt.intent.frequency === "mensuel" ? t.monthly : t.oneOff],
              [t.method, dict.paymentMethods[receipt.intent.method].label],
              [t.phone, receipt.intent.donorPhone],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-4 py-3">
                <dt className="text-caption text-light-muted dark:text-dark-muted">{k}</dt>
                <dd className="text-end text-[0.95rem] font-semibold text-light-text dark:text-dark-text">
                  {v}
                </dd>
              </div>
            ))}
          </dl>

          <p className="mt-6 text-caption leading-relaxed text-light-muted dark:text-dark-muted">
            {t.keepRef}
          </p>

          <div className="mt-7 flex flex-wrap gap-3 print:hidden">
            <button type="button" onClick={() => window.print()} className="btn-ghost">
              <Printer className="h-4 w-4" />
              {ui.common.print}
            </button>
            <a href={localePath(locale, "/don")} className="btn-primary">
              {t.again}
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════ Formulaire ══════════════
  return (
    <form action={formAction} className="grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-start">
      <div className="space-y-9">
        {/* 1 — Montant */}
        <fieldset>
          <legend className="mb-4 font-display text-h2 text-light-text dark:text-dark-text">
            <span className="me-2 text-leaf">1.</span> {t.step1}
          </legend>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {SUGGESTED_AMOUNTS.map((value) => {
              const active = !customAmount && amount === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setAmount(value);
                    setCustomAmount("");
                  }}
                  aria-pressed={active}
                  className={`ltr-nums rounded-md border px-4 py-4 text-center font-display text-h3 font-bold transition-all ${
                    active
                      ? "border-accent bg-accent/12 text-accent-hover shadow-sun"
                      : "border-light-border bg-light-surface text-light-text hover:border-accent/60 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
                  }`}
                >
                  {formatMoney(value, locale)}
                </button>
              );
            })}

            <div className="relative">
              <input
                type="number"
                inputMode="numeric"
                min={MIN_AMOUNT}
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder={t.other}
                aria-label={t.freeAmountAria}
                className={`h-full w-full rounded-md border bg-light-surface px-4 py-4 text-center font-display text-h3 font-bold outline-none transition-colors dark:bg-dark-surface ${
                  customAmount
                    ? "border-accent bg-accent/10 text-accent-hover"
                    : "border-light-border text-light-text dark:border-dark-border dark:text-dark-text"
                }`}
              />
            </div>
          </div>

          {/* Le montant réellement soumis — synchronisé avec les boutons ci-dessus. */}
          <input type="hidden" name="amount" value={effectiveAmount || ""} />

          {err("amount") && (
            <p role="alert" className="mt-3 text-caption font-medium text-danger">
              {err("amount")}
            </p>
          )}

          <p className="mt-4 rounded-md bg-leaf/8 px-4 py-3 text-[0.92rem] text-primary dark:text-leaf">
            <strong className="font-semibold">{t.impactPrefix}</strong>{" "}
            {dict.impact[impactTierOf(effectiveAmount)]}.
          </p>
        </fieldset>

        {/* 2 — Affectation */}
        <fieldset>
          <legend className="mb-4 font-display text-h2 text-light-text dark:text-dark-text">
            <span className="me-2 text-leaf">2.</span> {t.step2}
          </legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <OptionCard
              type="radio"
              name="program"
              value="general"
              label={t.general}
              hint={t.generalHint}
              defaultChecked={!preselected || !isProgramSlug(preselected)}
            />
            {PROGRAMS.map((p) => (
              <OptionCard
                key={p.slug}
                type="radio"
                name="program"
                value={p.slug}
                label={dict.programs[p.slug].name}
                hint={dict.programs[p.slug].tagline}
                accentColor={p.color}
                defaultChecked={preselected === p.slug}
              />
            ))}
          </div>
        </fieldset>

        {/* 3 — Fréquence + moyen */}
        <fieldset>
          <legend className="mb-4 font-display text-h2 text-light-text dark:text-dark-text">
            <span className="me-2 text-leaf">3.</span> {t.step3}
          </legend>

          <div className="mb-5 grid gap-3 sm:grid-cols-2">
            <OptionCard
              type="radio"
              name="frequency"
              value="ponctuel"
              label={t.oneOff}
              hint={t.oneOffHint}
              defaultChecked
            />
            <OptionCard
              type="radio"
              name="frequency"
              value="mensuel"
              label={t.monthly}
              hint={t.monthlyHint}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {PAYMENT_METHODS.map((m, i) => (
              <OptionCard
                key={m.id}
                type="radio"
                name="method"
                value={m.id}
                label={dict.paymentMethods[m.id].label}
                hint={dict.paymentMethods[m.id].hint}
                defaultChecked={i === 0}
              />
            ))}
          </div>
          {err("method") && (
            <p role="alert" className="mt-3 text-caption font-medium text-danger">
              {err("method")}
            </p>
          )}
        </fieldset>

        {/* 4 — Coordonnées */}
        <fieldset>
          <legend className="mb-4 font-display text-h2 text-light-text dark:text-dark-text">
            <span className="me-2 text-leaf">4.</span> {t.step4}
          </legend>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label={dict.fields.fullName}
              htmlFor="donorName"
              required
              error={err("donorName")}
            >
              <TextInput
                id="donorName"
                autoComplete="name"
                placeholder={dict.fields.fullNamePlaceholder}
                error={err("donorName")}
              />
            </Field>

            <Field
              label={dict.fields.phone}
              htmlFor="donorPhone"
              required
              error={err("donorPhone")}
              hint={t.phoneHint}
            >
              <TextInput
                id="donorPhone"
                type="tel"
                dir="ltr"
                autoComplete="tel"
                placeholder={dict.fields.phonePlaceholder}
                error={err("donorPhone")}
              />
            </Field>

            <Field
              label={dict.fields.emailOptional}
              htmlFor="donorEmail"
              error={err("donorEmail")}
              hint={t.emailHint}
              className="sm:col-span-2"
            >
              <TextInput
                id="donorEmail"
                type="email"
                dir="ltr"
                autoComplete="email"
                placeholder={dict.fields.emailPlaceholder}
                error={err("donorEmail")}
              />
            </Field>

            <Field
              label={t.messageOptional}
              htmlFor="message"
              error={err("message")}
              className="sm:col-span-2"
            >
              <TextArea
                id="message"
                rows={3}
                placeholder={t.messagePlaceholder}
                error={err("message")}
              />
            </Field>

            <div className="sm:col-span-2">
              <Toggle
                id="anonymous"
                name="anonymous"
                label={t.anonymous}
                hint={t.anonymousHint}
              />
            </div>
          </div>
        </fieldset>
      </div>

      {/* Récapitulatif — collant sur grand écran */}
      <aside className="lg:sticky lg:top-24">
        <div className="card overflow-hidden">
          <div className="bg-emerald-deep p-6 text-white">
            <p className="text-caption uppercase tracking-[0.16em] text-white/60">{t.recapTitle}</p>
            <p className="ltr-nums mt-2 font-display text-[2.2rem] font-extrabold leading-none text-accent">
              {effectiveAmount > 0 ? formatMoney(effectiveAmount, locale) : "—"}
            </p>
          </div>

          <div className="p-6">
            {state.status === "error" && state.messageKey && (
              <p
                role="alert"
                className="mb-4 rounded-md border border-danger/40 bg-danger/10 px-4 py-3 text-caption font-medium text-danger"
              >
                {translateError(dict, state.messageKey)}
              </p>
            )}

            <button type="submit" disabled={pending} className="btn-accent w-full">
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t.submitting}
                </>
              ) : (
                <>
                  <HeartHandshake className="h-4 w-4" />
                  {t.submit}
                </>
              )}
            </button>

            <p className="mt-4 flex items-start gap-2 text-caption leading-relaxed text-light-muted dark:text-dark-muted">
              <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-leaf" aria-hidden />
              {t.security}
            </p>
          </div>
        </div>
      </aside>
    </form>
  );
}
