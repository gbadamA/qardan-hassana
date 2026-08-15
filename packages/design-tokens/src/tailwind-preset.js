/**
 * Preset Tailwind partagé — importé par le site vitrine, le dashboard (Tailwind) et
 * plus tard le mobile (NativeWind). Miroir des tokens de `index.ts`.
 * Une seule DA pour les trois briques.
 *
 * Usage (tailwind.config.ts) :
 *   presets: [require('@qardan/design-tokens/tailwind-preset')]
 *
 * Thème : classes `dark:` (ex. `bg-light-bg dark:bg-dark-bg`), pilotées par `class="dark"`.
 *
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  theme: {
    extend: {
      colors: {
        // Marque (indépendant du thème)
        primary: { DEFAULT: "#0F5C2E", hover: "#0B4523" },
        leaf: { DEFAULT: "#2E9B4F", hover: "#26833F" },
        accent: { DEFAULT: "#E0A33E", hover: "#C4881F" },
        ink: "#0B1410",
        success: "#12B76A",
        warning: "#F59E0B",
        danger: "#DC2626",
        // Programmes
        program: {
          social: "#0F5C2E",
          environnement: "#2E9B4F",
          education: "#1D4E89",
          sante: "#C2410C",
        },
        // Neutres — clair
        light: {
          bg: "#F7FAF7",
          surface: "#FFFFFF",
          "surface-alt": "#EDF3EE",
          border: "#DBE7DE",
          text: "#0B1410",
          muted: "#566A5E",
        },
        // Neutres — sombre
        dark: {
          bg: "#06120C",
          surface: "#0D2016",
          "surface-alt": "#132B1E",
          border: "#20422F",
          text: "#E9F2EB",
          muted: "#8DA697",
        },
      },
      borderRadius: {
        sm: "10px",
        md: "16px",
        lg: "24px",
        xl: "32px",
      },
      fontFamily: {
        display: ["var(--font-display)", "Plus Jakarta Sans", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "Inter", "system-ui", "sans-serif"],
        arabic: ["Noto Naskh Arabic", "Amiri", "Scheherazade New", "serif"],
      },
      fontSize: {
        hero: [
          "clamp(2.4rem, 6vw, 3.6rem)",
          { lineHeight: "1.05", fontWeight: "800", letterSpacing: "-0.03em" },
        ],
        display: [
          "clamp(2rem, 4.4vw, 2.6rem)",
          { lineHeight: "1.12", fontWeight: "800", letterSpacing: "-0.025em" },
        ],
        h1: [
          "clamp(1.6rem, 3.2vw, 2rem)",
          { lineHeight: "1.2", fontWeight: "700", letterSpacing: "-0.02em" },
        ],
        h2: ["1.5rem", { lineHeight: "1.3", fontWeight: "700", letterSpacing: "-0.015em" }],
        h3: ["1.185rem", { lineHeight: "1.4", fontWeight: "600" }],
        body: ["1rem", { lineHeight: "1.65" }],
        lead: ["1.125rem", { lineHeight: "1.7" }],
        caption: ["0.8125rem", { lineHeight: "1.45" }],
      },
      backgroundImage: {
        emerald: "linear-gradient(135deg, #062B18 0%, #0F5C2E 55%, #2E9B4F 100%)",
        "emerald-deep": "linear-gradient(135deg, #052316 0%, #0C4425 100%)",
        sun: "linear-gradient(135deg, #B9761B 0%, #E0A33E 100%)",
      },
      boxShadow: {
        card: "0 10px 30px rgba(15, 92, 46, 0.10)",
        lifted: "0 20px 45px rgba(15, 92, 46, 0.18)",
        glow: "0 0 24px rgba(46, 155, 79, 0.35)",
        sun: "0 10px 28px rgba(224, 163, 62, 0.30)",
      },
      maxWidth: {
        content: "1200px",
        prose: "68ch",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(18px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fade-in 0.8s ease both",
        marquee: "marquee 32s linear infinite",
      },
    },
  },
};
