import Link from "next/link";
import { Mail, MapPin, Phone, Smartphone } from "lucide-react";
import {
  CONTACTS,
  ORG,
  PROGRAMS,
  localePath,
  type Dictionary,
  type Locale,
} from "@qardan/shared";
import type { SiteUi } from "@/content";
import { LogoMark } from "./Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Footer({
  locale,
  ui,
  dict,
}: {
  locale: Locale;
  ui: SiteUi;
  dict: Dictionary;
}) {
  const siteLinks = [
    { href: "/a-propos", label: ui.nav.about },
    { href: "/programmes", label: ui.nav.programs },
    { href: "/actualites", label: ui.nav.news },
    { href: "/evenements", label: ui.nav.events },
    { href: "/transparence", label: ui.nav.transparency },
    { href: "/benevole", label: ui.nav.volunteer },
    { href: "/application", label: ui.nav.app },
    { href: "/contact", label: ui.nav.contact },
  ];

  return (
    <footer className="relative mt-24 overflow-hidden bg-emerald-deep text-white print:hidden">
      <div className="pattern-weave absolute inset-0 opacity-60" aria-hidden />

      <div className="container-content relative py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          {/* Identité */}
          <div>
            <div className="flex items-center gap-3">
              <LogoMark size={52} />
              <div>
                <p className="font-display text-h3 font-extrabold uppercase leading-tight">
                  Qardan Hassana
                </p>
                <p className="text-caption italic text-white/70">{dict.org.slogan}</p>
              </div>
            </div>
            <p className="mt-5 max-w-sm text-[0.9rem] leading-relaxed text-white/70">
              {dict.org.legal}
            </p>
            <p className="arabic mt-4 text-2xl text-accent/90">{ORG.nameArabic}</p>
            <div className="mt-6">
              <LanguageSwitcher locale={locale} label={ui.common.changeLanguage} onDark />
            </div>
          </div>

          {/* Navigation */}
          <nav aria-label={ui.nav.sitemap}>
            <h2 className="mb-4 text-caption font-bold uppercase tracking-[0.16em] text-accent">
              {ui.footer.site}
            </h2>
            <ul className="space-y-2.5">
              {siteLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={localePath(locale, l.href)}
                    className="text-[0.9rem] text-white/75 transition-colors hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Programmes */}
          <nav aria-label={ui.footer.programs}>
            <h2 className="mb-4 text-caption font-bold uppercase tracking-[0.16em] text-accent">
              {ui.footer.programs}
            </h2>
            <ul className="space-y-2.5">
              {PROGRAMS.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={localePath(locale, `/programmes/${p.slug}`)}
                    className="inline-flex items-center gap-2 text-[0.9rem] text-white/75 transition-colors hover:text-white"
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: p.color }}
                      aria-hidden
                    />
                    {dict.programs[p.slug].name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contacts */}
          <div>
            <h2 className="mb-4 text-caption font-bold uppercase tracking-[0.16em] text-accent">
              {ui.footer.reach}
            </h2>
            <ul className="space-y-3.5">
              {CONTACTS.map((c) => (
                <li key={c.phone}>
                  <a
                    href={`tel:${c.phone}`}
                    className="group flex items-start gap-2.5 text-[0.9rem] text-white/75 transition-colors hover:text-white"
                  >
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    <span>
                      <span className="block font-medium text-white">{c.name}</span>
                      <span className="block text-caption text-white/60">
                        {dict.contactRoles[c.role].short}
                      </span>
                      <span className="ltr-nums block tabular-nums">{c.phoneDisplay}</span>
                    </span>
                  </a>
                </li>
              ))}
              <li className="flex items-start gap-2.5 text-[0.9rem] text-white/75">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                {dict.org.address}
              </li>
              <li>
                <a
                  href={`mailto:${ORG.email}`}
                  className="flex items-start gap-2.5 text-[0.9rem] text-white/75 transition-colors hover:text-white"
                >
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span className="ltr-nums">{ORG.email}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bandeau application mobile */}
        <div className="mt-14 flex flex-col items-start justify-between gap-5 rounded-lg border border-white/15 bg-white/5 p-6 backdrop-blur sm:flex-row sm:items-center">
          <div className="flex items-start gap-4">
            <Smartphone className="mt-0.5 h-6 w-6 shrink-0 text-accent" />
            <div>
              <p className="font-display text-h3 font-bold">{ui.footer.appTitle}</p>
              <p className="text-[0.9rem] text-white/70">{ui.footer.appText}</p>
            </div>
          </div>
          <Link href={localePath(locale, "/application")} className="btn-on-dark shrink-0">
            {ui.footer.appCta}
          </Link>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/15 pt-6 text-caption text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {ORG.name}. {ui.common.allRights}
          </p>
          <p>
            {dict.org.law} — {dict.org.city}, {dict.org.country}
          </p>
        </div>
      </div>
    </footer>
  );
}
