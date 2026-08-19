import type { Metadata, Viewport } from "next";
import { Inter, Noto_Kufi_Arabic, Noto_Naskh_Arabic, Plus_Jakarta_Sans } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import { getUi } from "@/content";
import {
  LOCALES,
  LOCALE_DIR,
  LOCALE_TAGS,
  ORG,
  getDictionary,
  isLocale,
  type Locale,
} from "@qardan/shared";
import { SITE_URL } from "@/lib/seo";

/**
 * Layout RACINE (il porte `<html>`), sous le segment `[locale]` : c'est la seule façon de
 * poser `lang` et `dir` côté serveur, donc sans clignotement ni saut de mise en page au
 * chargement d'une page arabe. Le middleware garantit qu'aucune URL n'échappe au segment.
 */

// `display: swap` : le texte s'affiche immédiatement avec la police système puis bascule.
// Sur une connexion 3G ivoirienne, attendre la police, c'est attendre la page.
const displayLatin = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display-latin",
  display: "swap",
});

const bodyLatin = Inter({
  subsets: ["latin"],
  variable: "--font-body-latin",
  display: "swap",
});

/**
 * Polices arabes dédiées. Inter et Plus Jakarta Sans n'ont **aucun glyphe arabe** : sans
 * elles, le navigateur retomberait sur une police système au rendu imprévisible, souvent
 * trop petite et mal espacée. Kufi pour les titres (géométrique, proche de la personnalité
 * de Plus Jakarta Sans), Naskh pour le texte courant (c'est la forme qu'on lit sans effort).
 */
const displayArabic = Noto_Kufi_Arabic({
  subsets: ["arabic"],
  weight: ["600", "700", "800"],
  variable: "--font-display-arabic",
  display: "swap",
});

const bodyArabic = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body-arabic",
  display: "swap",
});

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);
  const ui = getUi(locale);

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${ORG.name} — ${dict.org.slogan}`,
      template: `%s — ${ORG.name}`,
    },
    description: ui.home.metaDescription,
    keywords:
      locale === "ar"
        ? [
            "منظمة غير حكومية كوت ديفوار",
            "جمعية خيرية أبيدجان",
            "تبرع عبر الإنترنت كوت ديفوار",
            "قرض حسن",
          ]
        : [
            "ONG Côte d'Ivoire",
            "association humanitaire Abidjan",
            "don en ligne Côte d'Ivoire",
            "aide sociale Abidjan",
            "bénévolat Côte d'Ivoire",
            "POPB",
            "Qardan Hassana",
          ],
    authors: [{ name: ORG.name }],
    robots: { index: true, follow: true },
    icons: { icon: "/logo-qardan-hassana.jpg", apple: "/logo-qardan-hassana.jpg" },
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages: {
        "fr-CI": `${SITE_URL}/fr`,
        ar: `${SITE_URL}/ar`,
        "x-default": `${SITE_URL}/fr`,
      },
    },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7FAF7" },
    { media: "(prefers-color-scheme: dark)", color: "#06120C" },
  ],
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;

  const dir = LOCALE_DIR[locale];
  const fontVars = `${displayLatin.variable} ${bodyLatin.variable} ${displayArabic.variable} ${bodyArabic.variable}`;

  // ⚠️ TEMPORAIRE — bissection : mise en page réduite. Les scripts de <head> et les cinq
  // composants (ThemeProvider, DemoBanner, Header, Footer, RevealProvider) sont retirés.
  // `generateMetadata` et les polices restent.
  return (
    <html lang={LOCALE_TAGS[locale]} dir={dir} suppressHydrationWarning className={fontVars}>
      <body>{children}</body>
    </html>
  );
}
