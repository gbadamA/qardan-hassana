/**
 * NativeWind partage le MÊME preset que le site et le dashboard : une seule DA
 * pour les trois briques. Les tailles de police y sont exprimées en `clamp()` pour
 * le web ; côté natif, NativeWind ignore ce qu'il ne sait pas convertir, donc on
 * n'utilise que les classes de couleur, d'espacement et de rayon en RN.
 */
const preset = require("@qardan/design-tokens/tailwind-preset");

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("nativewind/preset"), preset],
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "../../packages/**/src/**/*.{ts,tsx}",
  ],
};
