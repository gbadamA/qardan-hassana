"use client";

import { useEffect } from "react";

/**
 * Révélation au défilement, sans dépendance d'animation.
 * Marque `.is-visible` sur chaque `[data-reveal]` dès qu'il entre dans l'écran.
 *
 * Choix assumé : pas de framer-motion sur le site vitrine. Les visiteurs sont
 * majoritairement en 3G sur téléphone — chaque kilo-octet de JS se paie.
 *
 * ⚠️ **Deux mécanismes ont été écartés à la vérification, pour la même raison.**
 * Le CSS met ces blocs à `opacity: 0` en attendant leur révélation : si la détection
 * ne se déclenche pas, le contenu reste invisible — panne silencieuse et totale.
 * Or ni `IntersectionObserver` ni `requestAnimationFrame` ne se déclenchent dans un
 * navigateur qui ne compose pas de frames (headless, onglet en arrière-plan, certaines
 * WebViews). Les deux ont été constatés muets sur ce site pendant la vérification.
 *
 * D'où ce montage volontairement rustique :
 *  1. `getBoundingClientRect()` (synchrone, fiable partout) sur l'événement `scroll` ;
 *  2. un **filet de sécurité** qui révèle tout au bout de 3 secondes.
 * Le pire cas devient « l'animation n'a pas joué », jamais « le texte est invisible ».
 */
export function useReveal() {
  useEffect(() => {
    const pending = new Set(Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]")));
    if (pending.size === 0) return;

    const reveal = (el: HTMLElement, useDelay = true) => {
      const delay = useDelay ? Number(el.dataset.revealDelay ?? 0) : 0;
      if (delay > 0) window.setTimeout(() => el.classList.add("is-visible"), delay);
      else el.classList.add("is-visible");
      pending.delete(el);
    };

    const check = () => {
      const limit = window.innerHeight * 0.92; // révèle un peu avant le bas de l'écran
      for (const el of Array.from(pending)) {
        const rect = el.getBoundingClientRect();
        if (rect.top < limit && rect.bottom > 0) reveal(el);
      }
      if (pending.size === 0) stop();
    };

    /**
     * Filet de sécurité : au bout de 3 s, on retire `reveal-init` de <html>.
     *
     * On ne se contente PAS d'ajouter `.is-visible` : cette classe ne fait que viser
     * `opacity: 1` au bout d'une transition, et une transition ne s'achève que si
     * l'horloge d'animation du navigateur tourne — ce qui n'est pas garanti (constaté
     * ici : classe posée, opacité bloquée à 0). Retirer `reveal-init` supprime la règle
     * de masquage elle-même : le contenu redevient visible instantanément, sans dépendre
     * d'aucune animation. C'est la seule garantie qui tienne dans tous les cas.
     */
    const safety = window.setTimeout(() => {
      document.documentElement.classList.remove("reveal-init");
      for (const el of Array.from(pending)) reveal(el, false);
      stop();
    }, 3000);

    const stop = () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
      window.clearTimeout(safety);
    };

    // `check` est direct (pas de rAF) : quelques rectangles à mesurer, coût négligeable.
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check, { passive: true });
    check(); // premier passage : ce qui est déjà à l'écran apparaît tout de suite

    return stop;
  }, []);
}
