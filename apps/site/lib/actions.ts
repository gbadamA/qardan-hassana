"use server";

import {
  contactMessageSchema,
  donationIntentSchema,
  volunteerApplicationSchema,
  type DonationIntent,
  type DonationReceipt,
  type PaymentGateway,
} from "@qardan/shared";
import { getSubmissionStore } from "./store";
import type { FormState } from "./form-state";

/**
 * Actions serveur des formulaires publics.
 *
 * Règle : la validation Zod est rejouée ICI, côté serveur. La validation côté client
 * n'existe que pour le confort — elle ne protège de rien.
 *
 * ⚠️ **Le serveur ne connaît pas la langue du visiteur, et n'a pas à la connaître.**
 * Il renvoie des CLÉS d'erreur (`errors.phone.invalid`) que le composant client traduit
 * avec le dictionnaire de la page. C'est ce qui permet à la même action de servir le
 * site français, le site arabe et, demain, l'application mobile.
 *
 * ⚠️ Un module `"use server"` ne peut exporter que des fonctions asynchrones :
 * le type `FormState` et `INITIAL_FORM_STATE` vivent dans `lib/form-state.ts`.
 */

/** Aplati les erreurs Zod en `{ champ: "clé" }` — un seul message par champ suffit. */
function flattenErrors(issues: { path: (string | number)[]; message: string }[]) {
  const out: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "_");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

/**
 * Enveloppe une écriture de soumission.
 * Toute panne du stockage (Supabase injoignable, disque en lecture seule sur un
 * hébergement sans FS persistant) devient un `FormState` d'erreur traduisible, au lieu
 * d'une exception qui afficherait un écran d'erreur au visiteur juste après sa saisie.
 */
async function saveOrFail(
  kind: "contact" | "benevole" | "don",
  payload: unknown,
): Promise<{ reference: string } | FormState> {
  try {
    return await getSubmissionStore().save(kind, payload);
  } catch (e) {
    const key = e instanceof Error && e.message.startsWith("errors.") ? e.message : "errors.submitFailed";
    return { status: "error", messageKey: key };
  }
}

/**
 * Passerelle de paiement par PREUVE — implémentation actuelle du port `PaymentGateway`.
 * Elle n'encaisse rien : elle enregistre une intention. La marche à suivre affichée au
 * donateur vient du dictionnaire de sa langue (`dict.paymentInstructions`), côté client.
 *
 * ➜ Le jour où un compte marchand CinetPay / Orange Money existe, on écrit une seconde
 *   implémentation de cette interface et on change UNE ligne dans `submitDonation`.
 */
const manualTransferGateway: PaymentGateway = {
  id: "manual-transfer",

  async createIntent(intent: DonationIntent): Promise<DonationReceipt> {
    const saved = await saveOrFail("don", intent);
    if ("status" in saved) throw new Error(saved.messageKey ?? "errors.submitFailed");
    const { reference } = saved;
    return {
      reference,
      status: "en_attente",
      createdAt: new Date().toISOString(),
      intent,
    };
  },
};

export async function submitDonation(_prev: FormState, formData: FormData): Promise<FormState> {
  const programRaw = String(formData.get("program") ?? "");

  const parsed = donationIntentSchema.safeParse({
    amount: Number(formData.get("amount")),
    program: programRaw === "" || programRaw === "general" ? null : programRaw,
    frequency: String(formData.get("frequency") ?? "ponctuel"),
    method: String(formData.get("method") ?? ""),
    donorName: String(formData.get("donorName") ?? ""),
    donorPhone: String(formData.get("donorPhone") ?? ""),
    donorEmail: String(formData.get("donorEmail") ?? ""),
    anonymous: formData.get("anonymous") === "on",
    message: String(formData.get("message") ?? ""),
  });

  if (!parsed.success) {
    return {
      status: "error",
      messageKey: "errors.form",
      errors: flattenErrors(parsed.error.issues),
    };
  }

  try {
    const receipt = await manualTransferGateway.createIntent(parsed.data);
    return { status: "success", reference: receipt.reference, receipt };
  } catch (e) {
    const key =
      e instanceof Error && e.message.startsWith("errors.") ? e.message : "errors.submitFailed";
    return { status: "error", messageKey: key };
  }
}

export async function submitContact(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = contactMessageSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    subject: String(formData.get("subject") ?? "autre"),
    message: String(formData.get("message") ?? ""),
  });

  if (!parsed.success) {
    return {
      status: "error",
      messageKey: "errors.form",
      errors: flattenErrors(parsed.error.issues),
    };
  }

  const saved = await saveOrFail("contact", parsed.data);
  if ("status" in saved) return saved;
  return { status: "success", reference: saved.reference };
}

export async function submitVolunteer(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = volunteerApplicationSchema.safeParse({
    fullName: String(formData.get("fullName") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    email: String(formData.get("email") ?? ""),
    city: String(formData.get("city") ?? ""),
    birthYear: Number(formData.get("birthYear")),
    programs: formData.getAll("programs").map(String),
    availability: formData.getAll("availability").map(String),
    skills: String(formData.get("skills") ?? ""),
    motivation: String(formData.get("motivation") ?? ""),
    wantsMembership: formData.get("wantsMembership") === "on",
  });

  if (!parsed.success) {
    return {
      status: "error",
      messageKey: "errors.form",
      errors: flattenErrors(parsed.error.issues),
    };
  }

  const saved = await saveOrFail("benevole", parsed.data);
  if ("status" in saved) return saved;
  return { status: "success", reference: saved.reference };
}
