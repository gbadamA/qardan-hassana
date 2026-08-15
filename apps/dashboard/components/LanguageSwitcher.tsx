"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOCALES, LOCALE_NAMES, LOCALE_SHORT, switchLocalePath, type Locale } from "@qardan/shared";

/** Sélecteur de langue du back-office — reste sur l'écran courant. */
export function LanguageSwitcher({ locale, compact = true }: { locale: Locale; compact?: boolean }) {
  const pathname = usePathname();

  return (
    <div className="inline-flex items-center gap-0.5 rounded-full border border-light-border p-0.5 dark:border-dark-border">
      {LOCALES.map((l) => {
        const active = l === locale;
        return (
          <Link
            key={l}
            href={switchLocalePath(pathname, l)}
            hrefLang={l}
            lang={l}
            title={LOCALE_NAMES[l]}
            aria-current={active ? "true" : undefined}
            className={`rounded-full px-2.5 py-1 text-caption font-semibold transition-colors ${
              active
                ? "bg-primary text-white"
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
