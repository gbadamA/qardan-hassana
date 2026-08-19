/**
 * Script d'amorçage du thème — module **serveur**, volontairement séparé de `theme.tsx`.
 *
 * ⚠️ Pourquoi ce fichier existe : `theme.tsx` porte la directive `"use client"`. Tous les
 * exports d'un module client deviennent, vus depuis un composant serveur, des *références*
 * de module — pas des valeurs. La mise en page, qui est un composant serveur, recevait donc
 * une référence là où elle attendait une chaîne, et l'injectait dans
 * `dangerouslySetInnerHTML`. On le voit à l'œil nu dans la charge RSC produite :
 *
 *     10:I[9212,[…],"themeBootstrapScript"]
 *
 * `I[…]` désigne une référence client. Le rendu finissait par produire le bon script, mais
 * la valeur transitait par un chemin qui n'est pas prévu pour elle.
 *
 * La constante vit désormais dans un module sans directive : elle est lisible des deux
 * côtés, et la mise en page reçoit une vraie chaîne.
 */

export const THEME_STORAGE_KEY = "qardan-theme";

/**
 * Injecté dans <head> et exécuté AVANT le premier rendu : sans ça, un écran clair
 * clignote une frame avant de passer en sombre.
 */
export const themeBootstrapScript = `
(function () {
  try {
    var stored = localStorage.getItem("${THEME_STORAGE_KEY}");
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var theme = stored === "light" || stored === "dark" ? stored : (prefersDark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.dataset.theme = theme;
  } catch (e) {}
  // Active les animations de révélation seulement si JS tourne : sans JS, tout reste visible.
  document.documentElement.classList.add("reveal-init");
})();
`;
