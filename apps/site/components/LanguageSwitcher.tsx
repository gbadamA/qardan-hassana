"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Languages } from "lucide-react";
import { LOCALES, LOCALE_NAMES, LOCALE_SHORT, switchLocalePath, type Locale } from "@qardan/shared";

/**
 * Sélecteur de langue.
 *
 * Trois partis pris :
 *  1. **Des liens, pas un menu déroulant** — deux langues seulement, autant les montrer
 *     toutes les deux. Un `<select>` obligerait à ouvrir pour découvrir qu'il y a de
 *     l'arabe, et ne serait pas indexable.
 *  2. **On reste sur la page courante** (`switchLocalePath`) : basculer en arabe depuis
 *     la page « Faire un don » doit mener à la page de don en arabe, pas à l'accueil.
 *  3. **Chaque langue est écrite dans sa propre langue** — « العربية », pas « Arabe ».
 *     Quelqu'un qui ne lit pas le français doit pouvoir se reconnaître.
 */
export function LanguageSwitcher({
  locale,
  label,
  onDark = false,
  compact = false,
}: {
  locale: Locale;
  label: string;
  onDark?: boolean;
  compact?: boolean;
}) {
  const pathname = usePathname();

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full border p-0.5 ${
        onDark ? "border-white/25" : "border-light-border dark:border-dark-border"
      }`}
      role="group"
      aria-label={label}
    >
      <Languages
        className={`ms-2 h-3.5 w-3.5 shrink-0 ${onDark ? "text-white/60" : "text-light-muted dark:text-dark-muted"}`}
        aria-hidden
      />
      {LOCALES.map((l) => {
        const active = l === locale;
        return (
          <Link
            key={l}
            href={switchLocalePath(pathname, l)}
            hrefLang={l}
            lang={l}
            aria-current={active ? "true" : undefined}
            title={LOCALE_NAMES[l]}
            className={`rounded-full px-2.5 py-1 text-caption font-semibold transition-colors ${
              active
                ? "bg-primary text-white"
                : onDark
                  ? "text-white/70 hover:text-white"
                  : "text-light-muted hover:text-primary dark:text-dark-muted dark:hover:text-leaf"
            }`}
          >
            {compact ? LOCALE_SHORT[l] : LOCALE_NAMES[l]}
          </Link>
        );
      })}
    </div>
  );
}
