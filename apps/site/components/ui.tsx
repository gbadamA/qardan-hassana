import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { localePath, type Locale } from "@qardan/shared";

/**
 * Primitives de mise en page.
 *
 * ⚠️ RTL : toutes les marges et bordures directionnelles utilisent les propriétés
 * LOGIQUES de Tailwind (`ms-`/`me-`, `ps-`/`pe-`, `start-`/`end-`, `text-start`) plutôt
 * que `ml-`/`mr-`/`left-`. Elles suivent automatiquement le sens de lecture, ce qui évite
 * de maintenir deux jeux de classes. Les chevrons, eux, doivent être retournés
 * explicitement (`rtl:rotate-180`) : une flèche « suivant » pointe à gauche en arabe.
 */

export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "start",
  onDark = false,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  align?: "start" | "center";
  onDark?: boolean;
}) {
  return (
    <div
      className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}
      data-reveal
    >
      {eyebrow && (
        <p className={`eyebrow mb-3 ${onDark ? "!text-accent" : ""}`}>
          <span className="h-px w-6 bg-current" aria-hidden />
          {eyebrow}
        </p>
      )}
      <h2
        className={`font-display text-display ${
          onDark ? "text-white" : "text-light-text dark:text-dark-text"
        }`}
      >
        {title}
      </h2>
      {lead && (
        <p
          className={`mt-4 text-lead ${
            onDark ? "text-white/75" : "text-light-muted dark:text-dark-muted"
          }`}
        >
          {lead}
        </p>
      )}
    </div>
  );
}

/** En-tête de page intérieure — bandeau vert, trame, fil d'Ariane. */
export function PageHero({
  locale,
  homeLabel,
  breadcrumbLabel,
  eyebrow,
  title,
  lead,
  breadcrumb,
  accentColor,
  children,
}: {
  locale: Locale;
  homeLabel: string;
  breadcrumbLabel: string;
  eyebrow?: string;
  title: string;
  lead?: string;
  breadcrumb?: { href: string; label: string }[];
  /** Couleur de programme : teinte le bandeau pour identifier la page d'un coup d'œil. */
  accentColor?: string;
  children?: React.ReactNode;
}) {
  return (
    <section
      className="relative overflow-hidden bg-emerald-deep text-white"
      style={
        accentColor
          ? { backgroundImage: `linear-gradient(135deg, #052316 0%, ${accentColor} 190%)` }
          : undefined
      }
    >
      <div className="pattern-weave absolute inset-0" aria-hidden />
      <div
        className="absolute -top-24 h-72 w-72 rounded-full blur-3xl ltr:-right-24 rtl:-left-24"
        style={{ backgroundColor: `${accentColor ?? "#2E9B4F"}33` }}
        aria-hidden
      />
      <div className="container-content relative py-16 sm:py-20">
        {breadcrumb && breadcrumb.length > 0 && (
          <nav aria-label={breadcrumbLabel} className="mb-6">
            <ol className="flex flex-wrap items-center gap-1 text-caption text-white/60">
              <li>
                <Link href={localePath(locale, "/")} className="transition-colors hover:text-white">
                  {homeLabel}
                </Link>
              </li>
              {breadcrumb.map((b) => (
                <li key={b.href} className="flex items-center gap-1">
                  <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden />
                  <Link
                    href={localePath(locale, b.href)}
                    className="transition-colors hover:text-white"
                  >
                    {b.label}
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
        )}
        {eyebrow && <p className="eyebrow mb-3 !text-accent">{eyebrow}</p>}
        <h1 className="max-w-4xl font-display text-display text-white">{title}</h1>
        {lead && <p className="mt-5 max-w-2xl text-lead text-white/80">{lead}</p>}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}

/** Pastille de programme (couleur + libellé). */
export function ProgramBadge({
  name,
  color,
  className = "",
}: {
  name: string;
  color: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-caption font-semibold ${className}`}
      style={{ backgroundColor: `${color}1A`, color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} aria-hidden />
      {name}
    </span>
  );
}

/** Lien fléché discret, utilisé en bas des cartes et des sections. */
export function ArrowLink({
  href,
  children,
  onDark = false,
}: {
  href: string;
  children: React.ReactNode;
  onDark?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-1.5 text-[0.92rem] font-semibold transition-colors ${
        onDark ? "text-accent hover:text-white" : "text-primary hover:text-leaf dark:text-leaf"
      }`}
    >
      {children}
      <ChevronRight
        className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
        aria-hidden
      />
    </Link>
  );
}
