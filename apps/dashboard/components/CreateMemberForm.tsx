"use client";

import { useState } from "react";
import { CheckCircle2, UserPlus } from "lucide-react";
import { PROGRAMS, ROLES, type Dictionary, type Role } from "@qardan/shared";
import { getSupabase } from "@qardan/supabase";
import type { DashUi } from "@/content";
import { Section } from "./ui";

/**
 * Création d'un compte du back-office, via l'Edge Function `create-member`.
 *
 * ⚠️ Ce formulaire n'écrit RIEN directement : créer un utilisateur exige la clé
 * `service_role`, qui ne doit jamais atteindre un navigateur. Il poste au serveur,
 * qui revérifie le rôle de l'appelant avant d'agir.
 *
 * `functions.invoke` joint automatiquement le jeton de la session courante — c'est
 * ce jeton que la fonction relit pour savoir qui appelle.
 */
export function CreateMemberForm({
  ui,
  dict,
  onCreated,
}: {
  ui: DashUi;
  dict: Dictionary;
  onCreated: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [role, setRole] = useState<Role>("resp_programme");

  const needsProgram = role === "resp_programme";

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    setBusy(true);
    setError(null);
    setSuccess(false);

    const { data, error: fnError } = await getSupabase().functions.invoke("create-member", {
      body: {
        email: String(fd.get("email")),
        password: String(fd.get("password")),
        full_name: String(fd.get("full_name")),
        role,
        program: needsProgram ? String(fd.get("program")) : null,
        phone: String(fd.get("phone") ?? "") || null,
      },
    });

    setBusy(false);

    if (fnError) {
      // L'Edge Function renvoie un code métier dans le corps ; le SDK, lui, ne donne
      // qu'un message HTTP générique. On tente de lire le corps pour afficher la
      // vraie raison plutôt qu'un « Edge Function returned a non-2xx status code ».
      let code = "generic";
      try {
        const body = await (fnError as { context?: Response }).context?.json();
        if (body?.error) code = String(body.error);
      } catch {
        /* corps illisible : on garde le message générique */
      }
      // `noUncheckedIndexedAccess` : même `messages.generic` est `string | undefined`.
      const messages = ui.administration.errors as Record<string, string | undefined>;
      setError(messages[code] ?? messages.generic ?? ui.common.error);
      return;
    }

    if (data?.id) {
      setSuccess(true);
      form.reset();
      onCreated();
    }
  }

  return (
    <Section title={ui.administration.createTitle} lead={ui.administration.createLead}>
      <form onSubmit={submit} className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label htmlFor="full_name" className="field-label">
            {dict.fields.fullName}
          </label>
          <input id="full_name" name="full_name" required className="field-input" />
        </div>

        <div>
          <label htmlFor="email" className="field-label">
            {ui.administration.createEmail}
          </label>
          <input id="email" name="email" type="email" dir="ltr" required className="field-input" />
        </div>

        <div>
          <label htmlFor="phone" className="field-label">
            {dict.fields.phoneOptional}
          </label>
          <input
            id="phone"
            name="phone"
            dir="ltr"
            placeholder={dict.fields.phonePlaceholder}
            className="field-input"
          />
        </div>

        <div>
          <label htmlFor="password" className="field-label">
            {ui.administration.createPassword}
          </label>
          <input
            id="password"
            name="password"
            type="text"
            dir="ltr"
            minLength={8}
            required
            className="field-input"
          />
          <p className="mt-1.5 text-caption text-light-muted dark:text-dark-muted">
            {ui.administration.createPasswordHint}
          </p>
        </div>

        <div>
          <label htmlFor="role" className="field-label">
            {ui.administration.role}
          </label>
          <select
            id="role"
            name="role"
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="field-input"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {dict.roles[r]}
              </option>
            ))}
          </select>
        </div>

        {needsProgram && (
          <div>
            <label htmlFor="program" className="field-label">
              {ui.administration.assignedProgram}
            </label>
            <select id="program" name="program" required className="field-input">
              {PROGRAMS.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {dict.programs[p.slug].name}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-caption text-light-muted dark:text-dark-muted">
              {ui.administration.programRequired}
            </p>
          </div>
        )}

        {error && (
          <p role="alert" className="text-caption font-medium text-danger sm:col-span-2 lg:col-span-3">
            {error}
          </p>
        )}

        {success && (
          <p className="inline-flex items-center gap-2 text-caption font-medium text-success sm:col-span-2 lg:col-span-3">
            <CheckCircle2 className="h-4 w-4" aria-hidden />
            {ui.administration.created}
          </p>
        )}

        <div className="sm:col-span-2 lg:col-span-3">
          <button type="submit" disabled={busy} className="btn-primary">
            <UserPlus className="h-4 w-4" />
            {busy ? ui.common.saving : ui.administration.createSubmit}
          </button>
        </div>
      </form>
    </Section>
  );
}
