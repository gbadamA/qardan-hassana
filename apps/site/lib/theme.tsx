"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

// La constante et le script d'amorçage vivent dans un module SERVEUR : la mise en page en a
// besoin comme valeur, or tout export d'un module client lui parviendrait comme référence.
import { THEME_STORAGE_KEY } from "./theme-script";

type Theme = "light" | "dark";

/**
 * Thème clair / sombre réellement atteignable.
 *
 * ⚠️ Leçon du projet mosquee-fitia : les tokens `light-*` y étaient câblés partout mais
 * `layout.tsx` forçait `class="dark"` — le mode clair n'a jamais pu être testé.
 * Ici le sélecteur existe dès le premier jour et la préférence système fait foi par défaut.
 */

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
        localStorage.setItem(THEME_STORAGE_KEY, next);
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
