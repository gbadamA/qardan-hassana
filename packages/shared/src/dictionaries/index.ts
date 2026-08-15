import type { Locale } from "../i18n";
import { fr, type Dictionary } from "./fr";
import { ar } from "./ar";

export type { Dictionary };

const DICTIONARIES: Record<Locale, Dictionary> = { fr, ar };

/**
 * Dictionnaire métier de la locale demandée.
 * Synchrone et sans chargement dynamique : les deux dictionnaires pèsent quelques
 * kilo-octets, un `import()` par langue coûterait plus cher en aller-retours qu'il
 * n'économise d'octets sur une connexion 3G.
 */
export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale] ?? fr;
}

/** Traduit une clé d'erreur Zod. Une clé inconnue retombe sur un message générique. */
export function translateError(dict: Dictionary, key: string): string {
  return (dict.errors as Record<string, string>)[key] ?? dict.errors["errors.form"];
}
