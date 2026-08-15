import { z } from "zod";
import { PROGRAM_SLUGS } from "./programs";

/**
 * Dons — schémas et contrat de paiement.
 *
 * ⚠️ Décision d'architecture (identique au projet mosquee-fitia) : **le don est une PREUVE,
 * pas un appel d'API**. Tant qu'aucun compte marchand Orange Money / CinetPay n'est ouvert,
 * le donateur déclare son versement (montant + opérateur + n° de transaction), l'intention
 * est enregistrée en statut `en_attente`, et le Trésorier valide au back-office.
 *
 * ⚠️ **Bilingue** : aucun texte affichable ici. Les libellés d'opérateurs et les messages
 * d'erreur sont des CLÉS, traduites au moment de l'affichage par le dictionnaire de la
 * locale courante. Une validation qui se déroule sur le serveur ne connaît pas — et ne
 * doit pas connaître — la langue du visiteur.
 */

export const PAYMENT_METHODS = [
  { id: "orange-money", ussd: "#144#", priority: 1 },
  { id: "mtn-momo", ussd: "*133#", priority: 2 },
  { id: "moov-money", ussd: "*155#", priority: 3 },
  { id: "wave", ussd: null, priority: 4 },
  { id: "especes", ussd: null, priority: 5 },
  { id: "virement", ussd: null, priority: 6 },
] as const;

export type PaymentMethodId = (typeof PAYMENT_METHODS)[number]["id"];

export const paymentMethodIds = PAYMENT_METHODS.map((m) => m.id) as [
  PaymentMethodId,
  ...PaymentMethodId[],
];

/** Montants proposés en un clic (FCFA). Le montant libre reste possible. */
export const SUGGESTED_AMOUNTS = [2000, 5000, 10000, 25000, 50000] as const;

/** Montant minimum accepté — en dessous, les frais Mobile Money mangent le don. */
export const MIN_AMOUNT = 500;

/**
 * Numéro ivoirien à 10 chiffres, avec ou sans indicatif +225 et séparateurs libres.
 * Partagé par tous les formulaires publics.
 */
export const PHONE_CI_REGEX =
  /^(\+?225)?[\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?\d{2}$/;

export const donationIntentSchema = z.object({
  amount: z
    .number({ message: "errors.amount.required" })
    .int("errors.amount.integer")
    .min(MIN_AMOUNT, "errors.amount.min")
    .max(50_000_000, "errors.amount.max"),
  /** `null` = don général, réparti par le Conseil d'Administration. */
  program: z.enum(PROGRAM_SLUGS).nullable(),
  frequency: z.enum(["ponctuel", "mensuel"]),
  method: z.enum(paymentMethodIds),
  donorName: z.string().trim().min(2, "errors.name.min").max(120, "errors.tooLong"),
  donorPhone: z.string().trim().regex(PHONE_CI_REGEX, "errors.phone.invalid"),
  donorEmail: z.string().trim().email("errors.email.invalid").optional().or(z.literal("")),
  /** Le donateur peut demander que son nom n'apparaisse dans aucune publication. */
  anonymous: z.boolean(),
  message: z.string().trim().max(500, "errors.tooLong").optional().or(z.literal("")),
});

export type DonationIntent = z.infer<typeof donationIntentSchema>;

export type DonationReceipt = {
  /** Référence lisible communiquée au donateur : DON-2026-0001. */
  reference: string;
  status: "en_attente" | "valide" | "rejete";
  createdAt: string;
  intent: DonationIntent;
};

/**
 * Port de paiement — le site n'appelle QUE cette interface.
 * Implémentations : `ManualTransferGateway` (aujourd'hui), `CinetPayGateway` (plus tard).
 */
export interface PaymentGateway {
  readonly id: string;
  createIntent(intent: DonationIntent): Promise<DonationReceipt>;
}

/** Numérotation lisible et croissante : DON-2026-0001. */
export function formatDonationReference(year: number, sequence: number): string {
  return `DON-${year}-${String(sequence).padStart(4, "0")}`;
}

/**
 * Palier d'impact correspondant à un montant — renvoie une CLÉ, traduite à l'affichage.
 * ⚠️ Les équivalences sont des ORDRES DE GRANDEUR à valider par la Direction Exécutive
 * avant mise en ligne — ne pas les présenter comme des engagements chiffrés.
 */
export type ImpactTier = "min" | "t2000" | "t5000" | "t10000" | "t25000" | "t50000";

export function impactTierOf(amount: number): ImpactTier {
  if (amount >= 50_000) return "t50000";
  if (amount >= 25_000) return "t25000";
  if (amount >= 10_000) return "t10000";
  if (amount >= 5_000) return "t5000";
  if (amount >= 2_000) return "t2000";
  return "min";
}
