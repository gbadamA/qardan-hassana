import type { DonationReceipt } from "@qardan/shared";

/**
 * État partagé entre les Server Actions et les formulaires clients.
 *
 * ⚠️ Ce fichier est volontairement SÉPARÉ de `lib/actions.ts` : un module marqué
 * `"use server"` ne peut exporter QUE des fonctions asynchrones. Y laisser
 * `INITIAL_FORM_STATE` (une constante) casse le build de Next.
 *
 * ⚠️ Bilingue : `messageKey` et les valeurs de `errors` sont des CLÉS de dictionnaire,
 * pas du texte. Le serveur ignore la langue de la page ; c'est le composant client qui
 * traduit avec `translateError`.
 */
export type FormState = {
  status: "idle" | "success" | "error";
  /** Clé de message global, ex. `errors.form`. */
  messageKey?: string;
  /** Référence lisible rendue à l'utilisateur : DON-2026-0001, MSG-2026-0004… */
  reference?: string;
  /** Clés d'erreur par champ, pour un affichage sous chaque saisie. */
  errors?: Record<string, string>;
  /** Renseigné uniquement par `submitDonation` : alimente l'écran de confirmation. */
  receipt?: DonationReceipt;
};

export const INITIAL_FORM_STATE: FormState = { status: "idle" };
