import type { Metadata } from "next";
import { CONTACTS, ORG, getDictionary, type Locale } from "@qardan/shared";

/**
 * SEO — visibilité locale Côte d'Ivoire / Abidjan (exigence §6 du cahier des charges).
 * L'URL canonique vient de l'environnement : elle change entre la préprod et la prod.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://qardanhassana.ci";

/**
 * Métadonnées d'une page, avec ses **alternates `hreflang`**.
 * C'est la pièce qui dit à Google que `/fr/don` et `/ar/don` sont la même page en deux
 * langues, et non deux pages concurrentes en contenu dupliqué. Sans elle, le bilinguisme
 * dégrade le référencement au lieu de l'élargir.
 */
export function pageMetadata(input: {
  locale: Locale;
  title: string;
  description: string;
  /** Chemin SANS préfixe de langue : `/don`, `/programmes/social`. */
  path: string;
  keywords?: string[];
}): Metadata {
  const url = `${SITE_URL}/${input.locale}${input.path}`;

  return {
    title: input.title,
    description: input.description,
    keywords: input.keywords,
    alternates: {
      canonical: url,
      languages: {
        "fr-CI": `${SITE_URL}/fr${input.path}`,
        ar: `${SITE_URL}/ar${input.path}`,
        "x-default": `${SITE_URL}/fr${input.path}`,
      },
    },
    openGraph: {
      title: `${input.title} — ${ORG.name}`,
      description: input.description,
      url,
      siteName: ORG.name,
      locale: input.locale === "ar" ? "ar" : "fr_CI",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${input.title} — ${ORG.name}`,
      description: input.description,
    },
  };
}

/** JSON-LD `NGO` — aide Google à comprendre qu'il s'agit d'une organisation caritative locale. */
export function organizationJsonLd(locale: Locale) {
  const dict = getDictionary(locale);

  return {
    "@context": "https://schema.org",
    "@type": "NGO",
    name: ORG.name,
    alternateName: [ORG.shortName, ORG.nameArabic],
    slogan: dict.org.slogan,
    url: `${SITE_URL}/${locale}`,
    logo: `${SITE_URL}/logo-qardan-hassana.jpg`,
    email: ORG.email,
    inLanguage: ["fr", "ar"],
    address: {
      "@type": "PostalAddress",
      addressLocality: dict.org.city,
      addressCountry: "CI",
    },
    contactPoint: CONTACTS.map((c) => ({
      "@type": "ContactPoint",
      contactType: dict.contactRoles[c.role].short,
      name: c.name,
      telephone: c.phone,
      areaServed: "CI",
      availableLanguage: ["fr", "ar"],
    })),
    foundingLocation: { "@type": "Place", name: dict.org.country },
    description: dict.org.legal,
  };
}
