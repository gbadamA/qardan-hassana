import type { Locale } from "@qardan/shared";
import { dashFr, type DashUi } from "./fr";
import { dashAr } from "./ar";

export type { DashUi };

const UI: Record<Locale, DashUi> = { fr: dashFr, ar: dashAr };

export function getDashUi(locale: Locale): DashUi {
  return UI[locale] ?? dashFr;
}
