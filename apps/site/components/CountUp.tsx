"use client";

import { useEffect, useRef, useState } from "react";
import { formatNumber, type Locale } from "@qardan/shared";

/**
 * Compteur qui s'incrémente quand le chiffre entre dans l'écran.
 *
 * ⚠️ Même précaution que `lib/reveal.ts` : le compteur part de 0, donc si le déclencheur
 * ne se déclenche jamais (navigateur sans compositing, WebView restreinte — où ni
 * `IntersectionObserver` ni `requestAnimationFrame` ne tournent), le visiteur lirait
 * « 0 bénéficiaires accompagnés ». Un chiffre faux est pire qu'une animation manquée.
 *
 * Trois garde-fous :
 *  - le rendu serveur porte la valeur FINALE → lisible sans JavaScript et pour les moteurs ;
 *  - `prefers-reduced-motion: reduce` n'anime pas du tout ;
 *  - un filet de sécurité pose la valeur finale au bout de 3 s quoi qu'il arrive.
 */
export function CountUp({
  to,
  locale,
  suffix = "",
  durationMs = 1400,
  className = "",
}: {
  to: number;
  locale: Locale;
  suffix?: string;
  durationMs?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(to);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let started = false;
    setValue(0); // on ne repart de 0 qu'une fois sûr de pouvoir animer

    const finish = () => {
      started = true;
      setValue(to);
      cleanup();
    };

    const animate = () => {
      started = true;
      cleanup();

      // `requestAnimationFrame` ne tourne pas partout : on garde `setInterval` en secours.
      const t0 = Date.now();
      const step = () => {
        const p = Math.min(1, (Date.now() - t0) / durationMs);
        // easeOutCubic : rapide au début, se pose doucement sur la valeur finale.
        setValue(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p >= 1) window.clearInterval(timer);
      };
      const timer = window.setInterval(step, 32);
    };

    const check = () => {
      if (started) return;
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.95 && rect.bottom > 0) animate();
    };

    const safety = window.setTimeout(() => {
      if (!started) finish();
    }, 3000);

    function cleanup() {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
      window.clearTimeout(safety);
    }

    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check, { passive: true });
    check();

    return cleanup;
  }, [to, durationMs]);

  // `ltr-nums` : un nombre reste lu de gauche à droite même dans une page arabe.
  return (
    <span ref={ref} className={`ltr-nums tabular-nums ${className}`}>
      {formatNumber(value, locale)}
      {suffix}
    </span>
  );
}
