/**
 * Identité de l'ONG — source unique. Le site, le dashboard et le mobile lisent d'ici :
 * aucun numéro de téléphone ni nom de responsable en dur dans une page.
 *
 * ⚠️ Bilingue : ce fichier ne garde que les données **invariantes** (noms de personnes,
 * numéros, email, identifiants de rôle). Tout ce qui se traduit — slogan, mention légale,
 * intitulés de fonction — vit dans les dictionnaires.
 *
 * ⚠️ Orthographe du nom : le cahier des charges écrit « Qardan Hassana », le logo officiel
 * écrit « QARDANE HASSANA ». À trancher avec le client — un seul endroit à changer (`name`).
 */

export const ORG = {
  name: "ONG Qardan Hassana",
  shortName: "Qardan Hassana",
  /** « Prêt sans intérêt, prêt bienfaisant » — racine du nom de l'ONG. */
  nameArabic: "قرض حسن",
  law: "n° 60-315",
  lawDate: "1960-09-21",
  email: "contact@qardanhassana.ci",
  social: {
    facebook: "https://facebook.com/",
    whatsapp: "https://wa.me/2250747008383",
  },
} as const;

/** Identifiants de fonction — les intitulés affichés viennent du dictionnaire. */
export const CONTACT_ROLES = ["pca", "secretaire", "tresorier"] as const;

export type ContactRole = (typeof CONTACT_ROLES)[number];

export type OrgContact = {
  role: ContactRole;
  name: string;
  /** Format international, sans espaces — sert aux liens `tel:` et `wa.me`. */
  phone: string;
  /** Format d'affichage local. */
  phoneDisplay: string;
};

export const CONTACTS: readonly OrgContact[] = [
  {
    role: "pca",
    name: "Imam Traoré Yaya",
    phone: "+2250747008383",
    phoneDisplay: "07 47 00 83 83",
  },
  {
    role: "secretaire",
    name: "Sanogo Mamadou",
    phone: "+2250707302229",
    phoneDisplay: "07 07 30 22 29",
  },
  {
    role: "tresorier",
    name: "Traoré Sholly",
    phone: "+2250707941571",
    phoneDisplay: "07 07 94 15 71",
  },
] as const;

/**
 * Le « + » n'est pas stocké par Supabase Auth (leçon du projet mosquee-fitia).
 * Helper d'affichage : 2250747008383 → 07 47 00 83 83.
 */
export function formatPhoneCI(raw: string): string {
  const digits = raw.replace(/\D/g, "").replace(/^225/, "");
  if (digits.length !== 10) return raw;
  return digits.replace(/(\d{2})(?=\d)/g, "$1 ").trim();
}
