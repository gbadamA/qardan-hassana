import type { Locale } from "@qardan/shared";
import { uiFr, type SiteUi } from "./fr/ui";
import { uiAr } from "./ar/ui";
import { contentFr } from "./fr/content";
import { contentAr } from "./ar/content";
import type { SiteContent } from "./types";

export type { SiteUi, SiteContent };
export * from "./shared";
export * from "./types";

const UI: Record<Locale, SiteUi> = { fr: uiFr, ar: uiAr };
const CONTENT: Record<Locale, SiteContent> = { fr: contentFr, ar: contentAr };

/** Textes d'interface du site pour la locale courante. */
export function getUi(locale: Locale): SiteUi {
  return UI[locale] ?? uiFr;
}

/** Contenu éditorial du site pour la locale courante. */
export function getContent(locale: Locale): SiteContent {
  return CONTENT[locale] ?? contentFr;
}
