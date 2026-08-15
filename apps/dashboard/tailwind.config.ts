import type { Config } from "tailwindcss";
// Même preset que le site : une seule DA pour les trois briques.
import preset from "@qardan/design-tokens/tailwind-preset";

const config: Config = {
  presets: [preset],
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./content/**/*.{ts,tsx}",
    "../../packages/**/src/**/*.{ts,tsx}",
  ],
};

export default config;
