/**
 * Identité de l'ONG — source unique. Le site, le dashboard et le mobile lisent d'ici :
 * aucun numéro de téléphone ni nom de responsable en dur dans une page.
 *
 * ⚠️ **Les coordonnées des personnes viennent de l'ENVIRONNEMENT, jamais du code.**
 * Le dépôt est public : y figer les noms et numéros de trois personnes réelles les
 * exposerait durablement, y compris après suppression (miroirs, caches, forks). Ce sont
 * certes les contacts que le site affiche par conception, mais les afficher sur le site
 * de l'ONG et les inscrire dans un dépôt public indexé ne sont pas le même geste.
 * ➜ Valeurs réelles dans `.env.local` (ignoré par git) et dans les variables du
 *   fournisseur d'hébergement. Modèle : `.env.example`.
 *
 * ⚠️ Chaque variable est lue par une référence LITTÉRALE `process.env.NEXT_PUBLIC_…`.
 * C'est indispensable : Next et Metro remplacent ces expressions au moment du build par
 * leur valeur. Un accès dynamique (`process.env[clé]`) n'est PAS remplacé et vaudrait
 * `undefined` dans le navigateur — d'où la répétition assumée ci-dessous.
 *
 * ⚠️ Orthographe du nom : le cahier des charges écrit « Qardan Hassana », le logo officiel
 * écrit « QARDANE HASSANA ». À trancher avec le client — un seul endroit à changer (`name`).
 */

/** Placeholders affichés tant que l'environnement n'est pas renseigné. */
const PLACEHOLDER_NAME = "Responsable à renseigner";
const PLACEHOLDER_PHONE = "+2250000000000";

const ENV = {
  pcaName: process.env.NEXT_PUBLIC_CONTACT_PCA_NAME ?? process.env.EXPO_PUBLIC_CONTACT_PCA_NAME,
  pcaPhone: process.env.NEXT_PUBLIC_CONTACT_PCA_PHONE ?? process.env.EXPO_PUBLIC_CONTACT_PCA_PHONE,
  secretaireName:
    process.env.NEXT_PUBLIC_CONTACT_SECRETAIRE_NAME ??
    process.env.EXPO_PUBLIC_CONTACT_SECRETAIRE_NAME,
  secretairePhone:
    process.env.NEXT_PUBLIC_CONTACT_SECRETAIRE_PHONE ??
    process.env.EXPO_PUBLIC_CONTACT_SECRETAIRE_PHONE,
  tresorierName:
    process.env.NEXT_PUBLIC_CONTACT_TRESORIER_NAME ??
    process.env.EXPO_PUBLIC_CONTACT_TRESORIER_NAME,
  tresorierPhone:
    process.env.NEXT_PUBLIC_CONTACT_TRESORIER_PHONE ??
    process.env.EXPO_PUBLIC_CONTACT_TRESORIER_PHONE,
  email: process.env.NEXT_PUBLIC_ORG_EMAIL ?? process.env.EXPO_PUBLIC_ORG_EMAIL,
};

/**
 * `true` quand les six coordonnées sont renseignées.
 * Sert au bandeau d'avertissement : mieux vaut dire « à renseigner » que laisser croire
 * qu'un numéro de démonstration est celui de l'ONG.
 */
export const CONTACTS_CONFIGURED = Boolean(
  ENV.pcaName &&
    ENV.pcaPhone &&
    ENV.secretaireName &&
    ENV.secretairePhone &&
    ENV.tresorierName &&
    ENV.tresorierPhone,
);

export const ORG = {
  name: "ONG Qardan Hassana",
  shortName: "Qardan Hassana",
  /** « Prêt sans intérêt, prêt bienfaisant » — racine du nom de l'ONG. */
  nameArabic: "قرض حسن",
  law: "n° 60-315",
  lawDate: "1960-09-21",
  email: ENV.email ?? "contact@example.org",
  social: {
    facebook: process.env.NEXT_PUBLIC_ORG_FACEBOOK ?? "https://facebook.com/",
    /** Construit depuis le numéro du PCA : un lien de moins à tenir à jour. */
    whatsapp: `https://wa.me/${(ENV.pcaPhone ?? PLACEHOLDER_PHONE).replace(/\D/g, "")}`,
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
  /** Format d'affichage local, DÉRIVÉ de `phone` : une seule valeur à saisir. */
  phoneDisplay: string;
};

/**
 * Le « + » n'est pas stocké par Supabase Auth (leçon du projet mosquee-fitia).
 * Helper d'affichage : 2250102030405 → 01 02 03 04 05.
 */
export function formatPhoneCI(raw: string): string {
  const digits = raw.replace(/\D/g, "").replace(/^225/, "");
  if (digits.length !== 10) return raw;
  return digits.replace(/(\d{2})(?=\d)/g, "$1 ").trim();
}

function contact(role: ContactRole, name?: string, phone?: string): OrgContact {
  const resolved = phone ?? PLACEHOLDER_PHONE;
  return {
    role,
    name: name ?? PLACEHOLDER_NAME,
    phone: resolved,
    phoneDisplay: formatPhoneCI(resolved),
  };
}

export const CONTACTS: readonly OrgContact[] = [
  contact("pca", ENV.pcaName, ENV.pcaPhone),
  contact("secretaire", ENV.secretaireName, ENV.secretairePhone),
  contact("tresorier", ENV.tresorierName, ENV.tresorierPhone),
] as const;
