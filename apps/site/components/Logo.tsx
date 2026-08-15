import Image from "next/image";
import Link from "next/link";
import { ORG, localePath, type Locale } from "@qardan/shared";

/**
 * Marque de l'ONG.
 *
 * Le logo fourni est un JPEG à fond blanc : il est donc systématiquement posé dans une
 * pastille blanche circulaire, ce qui le rend lisible aussi bien sur fond clair que sur
 * fond vert foncé. ➜ Demander au client le logo en PNG à fond transparent (ou en SVG)
 * pour supprimer cette contrainte (§9 du cahier des charges).
 */
export function LogoMark({ size = 44, className = "" }: { size?: number; className?: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-black/5 ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src="/logo-qardan-hassana.jpg"
        alt=""
        width={size}
        height={size}
        priority
        className="h-full w-full object-cover"
      />
    </span>
  );
}

export function Logo({
  locale,
  slogan,
  homeAria,
  variant = "light",
  size = 44,
}: {
  locale: Locale;
  slogan: string;
  homeAria: string;
  /** `light` = posé sur fond clair ; `onDark` = posé sur le vert du hero ou du pied de page. */
  variant?: "light" | "onDark";
  size?: number;
}) {
  const onDark = variant === "onDark";

  /**
   * Le nom de l'organisation n'est PAS traduit : « Qardan Hassana » est sa raison
   * sociale déposée, et c'est ce qui figure sur le logo. On l'écrit à l'identique
   * dans les deux langues — comme le font les organisations bilingues.
   */
  return (
    <Link
      href={localePath(locale, "/")}
      className="group inline-flex items-center gap-3"
      aria-label={`${ORG.name} — ${homeAria}`}
    >
      <LogoMark size={size} className="transition-transform duration-300 group-hover:scale-105" />
      <span className="flex flex-col leading-none">
        <span
          className={`font-display text-[0.95rem] font-extrabold uppercase tracking-tight ${
            onDark ? "text-white" : "text-light-text dark:text-dark-text"
          }`}
        >
          Qardan Hassana
        </span>
        <span
          className={`mt-1 text-[0.68rem] font-medium italic ${
            onDark ? "text-white/70" : "text-light-muted dark:text-dark-muted"
          }`}
        >
          {slogan}
        </span>
      </span>
    </Link>
  );
}
