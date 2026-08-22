"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { HeartHandshake, Menu, Phone, X } from "lucide-react";
import { CONTACTS, localePath, type Dictionary, type Locale } from "@qardan/shared";
import type { SiteUi } from "@/content";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Header({
  locale,
  ui,
  dict,
}: {
  locale: Locale;
  ui: SiteUi;
  dict: Dictionary;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pca = CONTACTS[0];

  const nav = [
    { href: "/a-propos", label: ui.nav.about },
    { href: "/programmes", label: ui.nav.programs },
    { href: "/collectes", label: ui.nav.campaigns },
    { href: "/actualites", label: ui.nav.news },
    { href: "/evenements", label: ui.nav.events },
    { href: "/transparence", label: ui.nav.transparency },
    { href: "/benevole", label: ui.nav.volunteer },
    { href: "/contact", label: ui.nav.contact },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Refermer le menu à chaque navigation, sinon il reste ouvert par-dessus la page d'arrivée.
  useEffect(() => setOpen(false), [pathname]);

  // Menu plein écran ouvert : on bloque le défilement de la page en dessous.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) => {
    const full = localePath(locale, href);
    return pathname === full || pathname.startsWith(`${full}/`);
  };

  return (
    <>
      {/* Bandeau utilitaire — masqué sur mobile où chaque pixel compte. */}
      <div className="hidden bg-emerald-deep text-white lg:block">
        <div className="container-content flex h-9 items-center justify-between text-caption">
          <p className="text-white/80">{dict.org.legalShort}</p>
          {pca && (
            <a
              href={`tel:${pca.phone}`}
              className="inline-flex items-center gap-2 text-white/85 transition-colors hover:text-accent"
            >
              <Phone className="h-3.5 w-3.5" />
              {dict.contactRoles.pca.short} —{" "}
              <span className="ltr-nums">{pca.phoneDisplay}</span>
            </a>
          )}
        </div>
      </div>

      <header
        className={`sticky top-0 z-50 border-b transition-all duration-300 ${
          scrolled
            ? "border-light-border bg-light-surface/85 backdrop-blur-xl dark:border-dark-border dark:bg-dark-surface/85"
            : "border-transparent bg-light-bg dark:bg-dark-bg"
        }`}
      >
        <div className="container-content flex h-[72px] items-center justify-between gap-4">
          <Logo locale={locale} slogan={dict.org.slogan} homeAria={ui.common.homeAria} />

          <nav aria-label={ui.nav.main} className="hidden items-center gap-1 xl:flex">
            {nav.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={localePath(locale, item.href)}
                  aria-current={active ? "page" : undefined}
                  className={`relative rounded-full px-3.5 py-2 text-[0.9rem] font-medium transition-colors ${
                    active
                      ? "text-primary dark:text-leaf"
                      : "text-light-muted hover:text-light-text dark:text-dark-muted dark:hover:text-dark-text"
                  }`}
                >
                  {item.label}
                  {active && (
                    <span className="absolute inset-x-3.5 -bottom-0.5 h-[2px] rounded-full bg-leaf" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <LanguageSwitcher locale={locale} label={ui.common.changeLanguage} compact />
            </div>
            <ThemeToggle labels={ui.common} />
            <Link
              href={localePath(locale, "/don")}
              className="btn-accent hidden px-5 py-2.5 text-sm sm:inline-flex"
            >
              <HeartHandshake className="h-4 w-4" />
              {ui.nav.donate}
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="menu-mobile"
              aria-label={open ? ui.common.closeMenu : ui.common.openMenu}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-light-border text-light-text xl:hidden dark:border-dark-border dark:text-dark-text"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Menu mobile — plein écran, gros boutons : la majorité des visiteurs sont sur téléphone. */}
      {open && (
        <div
          id="menu-mobile"
          className="fixed inset-x-0 bottom-0 top-[72px] z-40 overflow-y-auto bg-light-bg px-5 pb-10 pt-4 xl:hidden dark:bg-dark-bg"
        >
          <div className="mb-4 flex justify-center">
            <LanguageSwitcher locale={locale} label={ui.common.changeLanguage} />
          </div>

          <nav aria-label={ui.nav.mobile} className="flex flex-col gap-1">
            {nav.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={localePath(locale, item.href)}
                  className={`rounded-md border px-4 py-4 text-h3 transition-colors ${
                    active
                      ? "border-leaf/40 bg-leaf/10 text-primary dark:text-leaf"
                      : "border-light-border text-light-text dark:border-dark-border dark:text-dark-text"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <Link href={localePath(locale, "/don")} className="btn-accent mt-5 w-full">
            <HeartHandshake className="h-4 w-4" />
            {ui.nav.donate}
          </Link>

          {pca && (
            <a href={`tel:${pca.phone}`} className="btn-ghost mt-3 w-full">
              <Phone className="h-4 w-4" />
              {ui.nav.callThe} {dict.contactRoles.pca.short}
            </a>
          )}
        </div>
      )}
    </>
  );
}
