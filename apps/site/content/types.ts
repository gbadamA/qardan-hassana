import type { ProgramSlug } from "@qardan/shared";

/**
 * Formes du contenu éditorial du site. Déclarées une seule fois, remplies une fois par
 * langue dans `content/fr/` et `content/ar/`.
 *
 * ⚠️ Les DONNÉES INVARIANTES (dates ISO, slugs, couleurs, pourcentages, drapeau
 * `available`) ne doivent exister qu'une fois — elles sont donc rangées dans
 * `content/shared.ts`, pas dupliquées par langue. Un article ne peut pas avoir deux
 * dates de publication selon la langue de lecture.
 */

export type KeyFigure = {
  value: number;
  suffix?: string;
  label: string;
  detail: string;
};

export type Value = { title: string; text: string; icon: string };

export type Milestone = { year: string; title: string; text: string };

export type Testimony = { quote: string; author: string; role: string };

/** Partie traduisible d'un article ; la date et le programme viennent de `shared.ts`. */
export type ArticleText = {
  title: string;
  excerpt: string;
  author: string;
  /** Corps en paragraphes ; les sous-titres commencent par `## `. */
  body: readonly string[];
};

export type EventText = {
  title: string;
  place: string;
  city: string;
  description: string;
};

export type ReportText = {
  title: string;
  summary: string;
};

export type ProgramDetail = {
  /** Accroche affichée dans le hero de la page. */
  intro: string;
  /** Le problème, tel qu'il se pose sur le terrain. */
  context: readonly string[];
  /** Chaque action statutaire, expliquée concrètement. */
  actionDetails: readonly { title: string; text: string }[];
  stats: readonly { value: string; label: string }[];
  /** Ce dont le programme a besoin — sert d'appel au don ciblé. */
  needs: readonly string[];
};

export type Commitment = { title: string; text: string; icon: string };

export type SiteContent = {
  keyFigures: readonly KeyFigure[];
  values: readonly Value[];
  milestones: readonly Milestone[];
  testimonies: readonly Testimony[];
  commitments: readonly Commitment[];
  /** Clé = slug d'article (voir `content/shared.ts`). */
  articles: Record<string, ArticleText>;
  /** Clé = slug d'événement. */
  events: Record<string, EventText>;
  /** Clé = identifiant de rapport. */
  reports: Record<string, ReportText>;
  programDetails: Record<ProgramSlug, ProgramDetail>;
};
