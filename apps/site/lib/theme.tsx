"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

/**
 * Thème clair / sombre réellement atteignable.
 *
 * ⚠️ Leçon du projet mosquee-fitia : les tokens `light-*` y étaient câblés partout mais
 * `layout.tsx` forçait `class="dark"` — le mode clair n'a jamais pu être testé.
 * Ici le sélecteur existe dès le premier jour et la préférence système fait foi par défaut.
 */

const STORAGE_KEY = "qardan-theme";

/**
 * Injecté dans <head> et exécuté AVANT le premier rendu : sans ça, un écran clair
 * clignote une frame avant de passer en sombre.
 */
export const themeBootstrapScript = `
(function () {
  try {
    var stored = localStorage.getItem("${STORAGE_KEY}");
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var theme = stored === "light" || stored === "dark" ? stored : (prefersDark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.dataset.theme = theme;
  } catch (e) {}
  // Active les animations de révélation seulement si JS tourne : sans JS, tout reste visible.
  document.documentElement.classList.add("reveal-init");
})();
`;

const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: "light",
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  // Le script de bootstrap a déjà posé la classe ; on se contente de la lire pour l'état React.
  useEffect(() => {
    const current = document.documentElement.classList.contains("dark") ? "dark" : "light";
    setTheme(current);
  }, []);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      document.documentElement.classList.toggle("dark", next === "dark");
      document.documentElement.dataset.theme = next;
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* navigation privée : on se contente de la session en cours */
      }
      return next;
    });
  }, []);

  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
