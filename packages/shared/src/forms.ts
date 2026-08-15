import { z } from "zod";
import { PHONE_CI_REGEX } from "./donation";
import { PROGRAM_SLUGS } from "./programs";

/**
 * Formulaires publics (site + app mobile) — un seul jeu de règles de validation,
 * appliqué côté client pour l'ergonomie ET côté serveur pour la sécurité.
 *
 * ⚠️ Bilingue : les messages sont des CLÉS de dictionnaire, jamais du texte.
 */

const phoneCI = z.string().trim().regex(PHONE_CI_REGEX, "errors.phone.invalid");

export const CONTACT_SUBJECTS = [
  "don",
  "benevolat",
  "partenariat",
  "beneficiaire",
  "presse",
  "autre",
] as const;

export type ContactSubject = (typeof CONTACT_SUBJECTS)[number];

export const contactMessageSchema = z.object({
  name: z.string().trim().min(2, "errors.name.min").max(120, "errors.tooLong"),
  email: z.string().trim().email("errors.email.invalid"),
  phone: phoneCI.optional().or(z.literal("")),
  subject: z.enum(CONTACT_SUBJECTS),
  message: z.string().trim().min(10, "errors.message.min").max(2000, "errors.tooLong"),
});

export type ContactMessage = z.infer<typeof contactMessageSchema>;

export const AVAILABILITIES = ["semaine", "week-end", "vacances", "ponctuel"] as const;

export type Availability = (typeof AVAILABILITIES)[number];

export const volunteerApplicationSchema = z.object({
  fullName: z.string().trim().min(2, "errors.name.min").max(120, "errors.tooLong"),
  phone: phoneCI,
  email: z.string().trim().email("errors.email.invalid").optional().or(z.literal("")),
  city: z.string().trim().min(2, "errors.city.min").max(80, "errors.tooLong"),
  birthYear: z
    .number()
    .int()
    .min(1930, "errors.birthYear.invalid")
    .max(new Date().getFullYear() - 15, "errors.birthYear.tooYoung"),
  /** Au moins un programme : un bénévole s'engage sur un terrain précis. */
  programs: z.array(z.enum(PROGRAM_SLUGS)).min(1, "errors.programs.min"),
  availability: z.array(z.enum(AVAILABILITIES)).min(1, "errors.availability.min"),
  skills: z.string().trim().max(500, "errors.tooLong").optional().or(z.literal("")),
  motivation: z.string().trim().min(20, "errors.motivation.min").max(1500, "errors.tooLong"),
  /** Adhésion en tant que membre cotisant, en plus du bénévolat. */
  wantsMembership: z.boolean(),
});

export type VolunteerApplication = z.infer<typeof volunteerApplicationSchema>;

/**
 * Port de stockage des soumissions publiques. Le site ne connaît que cette interface.
 * Implémentations : Supabase (cible) et fichier JSONL (secours de développement).
 */
export interface SubmissionStore {
  readonly id: string;
  save(kind: "contact" | "benevole" | "don", payload: unknown): Promise<{ reference: string }>;
}
