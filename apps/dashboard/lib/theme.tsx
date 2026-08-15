"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "qardan-dash-theme";

/**
 * Thème clair / sombre. Clé de stockage distincte de celle du site : on peut vouloir
 * un back-office sombre et un site clair (ou l'inverse) sur le même poste.
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
})();
`;

const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: "light",
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      document.documentElement.classList.toggle("dark", next === "dark");
      document.documentElement.dataset.theme = next;
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* navigation privée */
      }
      return next;
    });
  }, []);

  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
