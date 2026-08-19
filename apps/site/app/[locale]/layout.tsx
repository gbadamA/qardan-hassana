import { Inter, Noto_Kufi_Arabic, Noto_Naskh_Arabic, Plus_Jakarta_Sans } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import {
  LOCALES,
  LOCALE_DIR,
  LOCALE_TAGS,
  isLocale,
  type Locale,
} from "@qardan/shared";

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

// ⚠️ TEMPORAIRE — bissection : `generateMetadata` et `viewport` retirés.

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
