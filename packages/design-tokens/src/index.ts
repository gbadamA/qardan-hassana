/**
 * Source de vérité visuelle — consommée par le site vitrine (Tailwind), le dashboard
 * (Tailwind) et plus tard le mobile (NativeWind). Aucune couleur en dur ailleurs.
 *
 * DA « Vert d'entraide » — ONG Qardan Hassana.
 * Palette lue directement sur le logo : anneau vert vif, cœur vert profond dégradé,
 * silhouettes blanche et noire. Le blanc et l'encre noire portent la typographie ;
 * le vert porte l'identité ; un sable doré rare marque UNIQUEMENT le don et les chiffres clés.
 */

/** Dégradé signature (135°) : hero, bandeaux de section, cartes de programme. */
export const gradient = {
  /** Le cœur du logo : vert profond → vert vif. */
  emerald: ["#062B18", "#0F5C2E", "#2E9B4F"] as const,
  /** Variante sobre pour les grandes surfaces de texte. */
  deep: ["#052316", "#0C4425"] as const,
  /** Accent don (rare, jamais en fond de page). */
  sun: ["#B9761B", "#E0A33E"] as const,
  angle: 135,
};

/**
 * Couleurs de marque.
 * ⚠️ Contraste : `accent` (sable) ne porte QUE du texte encre (`palette.light.text`).
 *    Le vert `primary` ne porte QUE du texte blanc.
 */
export const brand = {
  primary: "#0F5C2E", // vert profond — actions, liens
  primaryHover: "#0B4523",
  leaf: "#2E9B4F", // vert vif du logo — surlignes, icônes, états actifs
  leafHover: "#26833F",
  accent: "#E0A33E", // sable doré — don, chiffres clés, badges
  accentHover: "#C4881F",
  ink: "#0B1410", // noir de la silhouette
  success: "#12B76A",
  warning: "#F59E0B",
  danger: "#DC2626",
};

/** Une couleur par programme — sert aux pastilles, cartes, filtres d'actualités. */
export const programColors = {
  social: "#0F5C2E", // entraide — vert profond
  environnement: "#2E9B4F", // vert vif
  education: "#1D4E89", // bleu encre — savoir
  "sante-sport": "#C2410C", // cuivre — vitalité
} as const;

/** Neutres par thème — très légèrement teintés vert pour l'unité chromatique. */
export const palette = {
  light: {
    bg: "#F7FAF7",
    surface: "#FFFFFF",
    surfaceAlt: "#EDF3EE",
    border: "#DBE7DE",
    text: "#0B1410",
    textMuted: "#566A5E",
  },
  dark: {
    bg: "#06120C",
    surface: "#0D2016",
    surfaceAlt: "#132B1E",
    border: "#20422F",
    text: "#E9F2EB",
    textMuted: "#8DA697",
  },
} as const;

export const radii = {
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  full: 999,
};

/** Espacement en base 4. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
  "3xl": 80,
};

export const typography = {
  fonts: {
    display: "Plus Jakarta Sans", // titres — humaniste, chaleureuse
    body: "Inter", // texte courant
    arabic: "Noto Naskh Arabic", // « قرض حسن », citations, interface arabe
  },
  sizes: {
    hero: 56,
    display: 40,
    h1: 32,
    h2: 24,
    h3: 19,
    body: 16,
    caption: 13,
  },
  weights: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
  },
} as const;

/** Ombres douces teintées vert plutôt que noires pures. */
export const shadows = {
  card: "0 10px 30px rgba(15, 92, 46, 0.10)",
  lifted: "0 20px 45px rgba(15, 92, 46, 0.18)",
  glow: "0 0 24px rgba(46, 155, 79, 0.35)",
  sun: "0 10px 28px rgba(224, 163, 62, 0.30)",
};

export type ThemeName = keyof typeof palette;
export type ProgramColorKey = keyof typeof programColors;
