"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search } from "lucide-react";
import { DEFAULT_LOCALE, isLocale, localePath, type Locale } from "@qardan/shared";
import { getUi } from "@/content";
import { LogoMark } from "@/components/Logo";

/**
 * Page 404 du segment de langue.
 *
 * ⚠️ `not-found.tsx` ne reçoit PAS `params` — c'est une limite de Next, pas un oubli.
 * On retrouve donc la langue depuis l'URL courante, ce qui impose un composant client.
 * Sans ça, un visiteur arabophone tomberait sur une page d'erreur en français.
 */
export default function NotFound() {
  const pathname = usePathname();
  const segment = pathname.split("/")[1] ?? "";
  const locale: Locale = isLocale(segment) ? segment : DEFAULT_LOCALE;
  const ui = getUi(locale);

  return (
    <section className="container-content flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <LogoMark size={72} />
      <p className="ltr-nums mt-8 font-display text-[4rem] font-extrabold leading-none text-leaf/30">
        404
      </p>
      <h1 className="mt-2 font-display text-display text-light-text dark:text-dark-text">
        {ui.notFound.title}
      </h1>
      <p className="mt-4 max-w-md text-lead text-light-muted dark:text-dark-muted">
        {ui.notFound.text}
      </p>
      <div className="mt-9 flex flex-wrap justify-center gap-3">
        <Link href={localePath(locale, "/")} className="btn-primary">
          <Home className="h-4 w-4" />
          {ui.notFound.home}
        </Link>
        <Link href={localePath(locale, "/programmes")} className="btn-ghost">
          <Search className="h-4 w-4" />
          {ui.notFound.programs}
        </Link>
      </div>
    </section>
  );
}
