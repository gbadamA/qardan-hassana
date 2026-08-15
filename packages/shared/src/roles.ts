/**
 * RBAC de la plateforme — repris du §3 du cahier des charges.
 * Défini dès maintenant pour que le site (page « Transparence », espace donateur)
 * et le back-office parlent des mêmes rôles.
 *
 * ⚠️ Bilingue : les intitulés affichés vivent dans les dictionnaires (`roles[…]`).
 */

export const ROLES = [
  "super_admin", // PCA — accès total, vue consolidée
  "tresorier", // Trésorier Général — finances, validation des dépenses
  "commissaire", // Commissaire aux Comptes — LECTURE SEULE des finances + exports d'audit
  "direction", // Direction Exécutive — coordination des programmes
  "administratif", // Service Administratif — membres, courrier, documents
  "resp_programme", // Responsable de programme — son programme uniquement
  "donateur", // App mobile — ses propres dons
] as const;

export type Role = (typeof ROLES)[number];

/** Rôles autorisés à ouvrir le back-office (les donateurs restent sur mobile/site). */
export const DASHBOARD_ROLES: readonly Role[] = [
  "super_admin",
  "tresorier",
  "commissaire",
  "direction",
  "administratif",
  "resp_programme",
];

/** Le Commissaire aux Comptes ne doit JAMAIS pouvoir écrire — c'est la garantie d'audit. */
export const READ_ONLY_ROLES: readonly Role[] = ["commissaire"];

export function canWriteFinance(role: Role): boolean {
  return role === "tresorier" || role === "super_admin";
}

export function canAccessDashboard(role: Role): boolean {
  return DASHBOARD_ROLES.includes(role);
}
