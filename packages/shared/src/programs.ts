/**
 * Les 4 programmes d'activité de l'ONG — taxonomie partagée.
 *
 * ⚠️ Depuis le passage au bilingue (2026-08-07), ce fichier ne contient **plus aucun
 * texte affichable** : ni nom, ni accroche, ni liste d'actions. Tout cela vit dans les
 * dictionnaires (`dictionaries/fr.ts`, `dictionaries/ar.ts`), sous `programs[slug]`.
 * Ici ne restent que les invariants : l'identifiant, la couleur, l'icône, l'ordre.
 * C'est ce qui permet au dashboard de rattacher un bénéficiaire ou une dépense à un
 * programme sans jamais dépendre de la langue d'affichage.
 */

export const PROGRAM_SLUGS = ["social", "environnement", "education", "sante-sport"] as const;

export type ProgramSlug = (typeof PROGRAM_SLUGS)[number];

export type Program = {
  slug: ProgramSlug;
  /** Couleur dédiée (miroir de `programColors` des design-tokens). */
  color: string;
  /** Nom d'icône lucide-react. */
  icon: string;
};

export const PROGRAMS: readonly Program[] = [
  { slug: "social", color: "#0F5C2E", icon: "HeartHandshake" },
  { slug: "environnement", color: "#2E9B4F", icon: "Leaf" },
  { slug: "education", color: "#1D4E89", icon: "BookOpen" },
  { slug: "sante-sport", color: "#C2410C", icon: "Activity" },
] as const;

export function getProgram(slug: string): Program | undefined {
  return PROGRAMS.find((p) => p.slug === slug);
}

export function isProgramSlug(value: string): value is ProgramSlug {
  return (PROGRAM_SLUGS as readonly string[]).includes(value);
}
