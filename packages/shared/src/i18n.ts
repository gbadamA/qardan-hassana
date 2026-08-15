/**
 * Internationalisation — socle partagé site / dashboard / mobile.
 *
 * Décision produit (2026-08-07) : **français par défaut, arabe en option.**
 * Le français reste la langue de travail de l'ONG et des documents officiels ;
 * l'arabe sert les publics arabophones du contexte cultuel et associatif.
 *
 * Règles :
 *  - la locale est TOUJOURS explicite dans l'URL (`/fr/…`, `/ar/…`) — sans quoi
 *    Google indexe une seule version et le SEO local s'effondre ;
 *  - le sens de lecture vient d'ici, jamais d'un `if (langue === "ar")` éparpillé ;
 *  - une chaîne manquante en arabe retombe sur le français (voir `getDictionary`),
 *    jamais sur une clé technique affichée à l'écran.
 */

export const LOCALES = ["fr", "ar"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "fr";

/** Nom de la langue dans sa propre langue — c'est ainsi qu'on étiquette un sélecteur. */
export const LOCALE_NAMES: Record<Locale, string> = {
  fr: "Français",
  ar: "العربية",
};

/** Étiquette courte pour les sélecteurs compacts (mobile, en-tête). */
export const LOCALE_SHORT: Record<Locale, string> = {
  fr: "FR",
  ar: "ع",
};

export const LOCALE_DIR: Record<Locale, "ltr" | "rtl"> = {
  fr: "ltr",
  ar: "rtl",
};

/** Étiquette de langue HTML complète (attribut `lang`, `hreflang`, JSON-LD). */
export const LOCALE_TAGS: Record<Locale, string> = {
  fr: "fr-CI",
  ar: "ar",
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

export function isRtl(locale: Locale): boolean {
  return LOCALE_DIR[locale] === "rtl";
}

/**
 * ⚠️ **Les nombres suivent la convention MONÉTAIRE ivoirienne, pas la langue de lecture.**
 *
 * Deux écueils évités ici :
 *  1. `Intl` en arabe rendrait « ١٢٤٠ » (chiffres arabes orientaux). Or en Côte d'Ivoire
 *     les montants en FCFA, les numéros de téléphone et les références de dons s'écrivent
 *     en chiffres occidentaux, y compris dans un document en arabe : un reçu « ٥٠٠٠ فرنك »
 *     ne se rapproche d'aucun relevé Mobile Money.
 *  2. `ar-u-nu-latn` corrige les chiffres mais groupe les milliers par une virgule
 *     (« 1,240 »), alors que tout ce que le donateur voit par ailleurs — SMS Orange Money,
 *     reçus, affiches — groupe par une espace (« 1 240 »).
 *
 * D'où le même formatage numérique dans les deux langues. Seule l'unité est traduite.
 */
const NUMBER_LOCALE: Record<Locale, string> = {
  fr: "fr-FR",
  ar: "fr-FR",
};

const DATE_LOCALE: Record<Locale, string> = {
  fr: "fr-FR",
  ar: "ar-u-nu-latn-ca-gregory", // calendrier grégorien : l'agenda de l'ONG est civil
};

export function formatNumber(value: number, locale: Locale): string {
  return value.toLocaleString(NUMBER_LOCALE[locale]);
}

/** Nom de la monnaie dans la langue courante — utile seul, pour étiqueter un champ. */
const CURRENCY: Record<Locale, string> = {
  fr: "FCFA",
  ar: "فرنك",
};

export function currencyLabel(locale: Locale): string {
  return CURRENCY[locale];
}

/** Format monétaire : « 25 000 FCFA ». Chiffres occidentaux dans les deux langues. */
export function formatMoney(amount: number, locale: Locale): string {
  return `${formatNumber(amount, locale)} ${CURRENCY[locale]}`;
}

export function formatDate(
  iso: string,
  locale: Locale,
  options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" },
): string {
  return new Date(iso).toLocaleDateString(DATE_LOCALE[locale], options);
}

export function formatTime(iso: string, locale: Locale): string {
  return new Date(iso).toLocaleTimeString(DATE_LOCALE[locale], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Préfixe une route interne de sa locale : `/don` → `/ar/don`. */
export function localePath(locale: Locale, path: string): string {
  const clean = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${clean}`;
}

/**
 * Remplace la locale dans un chemin déjà préfixé — utilisé par le sélecteur de langue,
 * qui doit rester sur la page courante au lieu de renvoyer à l'accueil.
 */
export function switchLocalePath(currentPath: string, next: Locale): string {
  const segments = currentPath.split("/").filter(Boolean);
  if (segments.length > 0 && isLocale(segments[0] as string)) segments[0] = next;
  else segments.unshift(next);
  return `/${segments.join("/")}`;
}
