"use client";

import { useReveal } from "@/lib/reveal";

/**
 * Monté une fois par page : active l'apparition au défilement des éléments `[data-reveal]`.
 * Composant sans rendu — il ne fait qu'installer l'IntersectionObserver.
 */
export function RevealProvider() {
  useReveal();
  return null;
}
