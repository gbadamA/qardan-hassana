import type { ProgramSlug } from "@qardan/shared";

/**
 * Données éditoriales **invariantes par langue** : dates, slugs, rattachements,
 * pourcentages, disponibilité des fichiers. Un article ne peut pas avoir deux dates de
 * publication selon la langue de lecture — d'où ce fichier unique.
 *
 * ⚠️⚠️ CONTENUS DE DÉMONSTRATION — aucun n'a été fourni par l'ONG (cf. §9 du cahier des
 * charges). Le drapeau `IS_DEMO_CONTENT` affiche un bandeau d'avertissement sur le site
 * tant qu'il est à `true`. En Phase 1, tout ceci vient du back-office.
 */

export const IS_DEMO_CONTENT = true;

export type ArticleMeta = {
  slug: string;
  program: ProgramSlug;
  /** ISO — format stable, mis en forme selon la locale à l'affichage. */
  date: string;
  readingMinutes: number;
};

export const ARTICLE_METAS: readonly ArticleMeta[] = [
  { slug: "journee-de-salubrite-au-cimetiere", program: "environnement", date: "2026-07-19", readingMinutes: 3 },
  { slug: "prise-en-charge-popb-cinq-enfants", program: "social", date: "2026-06-28", readingMinutes: 4 },
  { slug: "tournoi-inter-quartiers-sante-par-le-sport", program: "sante-sport", date: "2026-05-31", readingMinutes: 3 },
  { slug: "remise-de-kits-scolaires-et-memorisation", program: "education", date: "2026-04-14", readingMinutes: 2 },
  { slug: "assistance-aux-familles-endeuillees", program: "social", date: "2026-03-09", readingMinutes: 3 },
  { slug: "reinsertion-des-jeunes-desoeuvres", program: "social", date: "2026-02-02", readingMinutes: 3 },
];

export type EventMeta = {
  slug: string;
  program: ProgramSlug;
  /** ISO date-time local (Abidjan, UTC+0). */
  startsAt: string;
  endsAt?: string;
  /** Inscription requise pour l'organisation (repas, kits, arbitres…). */
  registration: boolean;
};

export const EVENT_METAS: readonly EventMeta[] = [
  {
    slug: "journee-salubrite-trimestrielle",
    program: "environnement",
    startsAt: "2026-08-22T06:30:00",
    endsAt: "2026-08-22T12:00:00",
    registration: true,
  },
  {
    slug: "consultation-foraine-sante",
    program: "sante-sport",
    startsAt: "2026-09-05T08:00:00",
    endsAt: "2026-09-05T15:00:00",
    registration: false,
  },
  {
    slug: "remise-kits-scolaires-rentree",
    program: "education",
    startsAt: "2026-09-14T09:00:00",
    endsAt: "2026-09-14T12:00:00",
    registration: false,
  },
  {
    slug: "tournoi-inter-quartiers",
    program: "sante-sport",
    startsAt: "2026-10-11T15:00:00",
    endsAt: "2026-10-12T18:00:00",
    registration: true,
  },
  {
    slug: "seance-sensibilisation-hygiene",
    program: "environnement",
    startsAt: "2026-11-08T09:00:00",
    registration: false,
  },
];

export type ReportMeta = {
  id: string;
  kind: "rapport-activite" | "rapport-financier" | "statut" | "pv";
  year: number;
  fileUrl: string;
  /** `false` tant que le PDF n'a pas été fourni : on affiche « en cours de publication »
   *  plutôt qu'un lien mort. */
  available: boolean;
};

export const REPORT_METAS: readonly ReportMeta[] = [
  {
    id: "ra-2025",
    kind: "rapport-activite",
    year: 2025,
    fileUrl: "/rapports/rapport-activite-2025.pdf",
    available: false,
  },
  {
    id: "rf-2025",
    kind: "rapport-financier",
    year: 2025,
    fileUrl: "/rapports/rapport-financier-2025.pdf",
    available: false,
  },
  {
    id: "ra-2024",
    kind: "rapport-activite",
    year: 2024,
    fileUrl: "/rapports/rapport-activite-2024.pdf",
    available: false,
  },
  {
    id: "statuts",
    kind: "statut",
    year: 1960,
    fileUrl: "/rapports/statuts-qardan-hassana.pdf",
    available: false,
  },
];

/** Répartition indicative des emplois de fonds — page Transparence. */
export const FUND_ALLOCATION: readonly { program: ProgramSlug; share: number; color: string }[] = [
  { program: "social", share: 38, color: "#0F5C2E" },
  { program: "sante-sport", share: 26, color: "#C2410C" },
  { program: "education", share: 22, color: "#1D4E89" },
  { program: "environnement", share: 14, color: "#2E9B4F" },
];

/** Tri antéchronologique — le plus récent d'abord. */
export function sortedArticleMetas(): ArticleMeta[] {
  return [...ARTICLE_METAS].sort((a, b) => b.date.localeCompare(a.date));
}

export function getArticleMeta(slug: string): ArticleMeta | undefined {
  return ARTICLE_METAS.find((a) => a.slug === slug);
}

export function upcomingEventMetas(now = new Date()): EventMeta[] {
  return EVENT_METAS.filter((e) => new Date(e.startsAt) >= now).sort((a, b) =>
    a.startsAt.localeCompare(b.startsAt),
  );
}

export function pastEventMetas(now = new Date()): EventMeta[] {
  return EVENT_METAS.filter((e) => new Date(e.startsAt) < now).sort((a, b) =>
    b.startsAt.localeCompare(a.startsAt),
  );
}
