import type { Metadata, Viewport } from "next";
import { Inter, Noto_Kufi_Arabic, Noto_Naskh_Arabic, Plus_Jakarta_Sans } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import {
  LOCALES,
  LOCALE_DIR,
  LOCALE_TAGS,
  ORG,
  getDictionary,
  isLocale,
  type Locale,
} from "@qardan/shared";
import { getUi } from "@/content";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DemoBanner } from "@/components/DemoBanner";
import { RevealProvider } from "@/components/Reveal";
import { ThemeProvider } from "@/lib/theme";
import { themeBootstrapScript } from "@/lib/theme-script";
import { SITE_URL, organizationJsonLd } from "@/lib/seo";

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

  const dict = getDictionary(locale);
  const ui = getUi(locale);
  const dir = LOCALE_DIR[locale];

  const fontVars = `${displayLatin.variable} ${bodyLatin.variable} ${displayArabic.variable} ${bodyArabic.variable}`;

  return (
    <html
      lang={LOCALE_TAGS[locale]}
      dir={dir}
      suppressHydrationWarning
      className={`${fontVars} ${locale === "ar" ? "locale-ar" : "locale-fr"}`}
    >
      <head>
        {/* Applique le thème AVANT le premier rendu : sinon un écran clair clignote une frame. */}
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd(locale)) }}
        />
      </head>
      <body className="min-h-screen bg-light-bg text-light-text antialiased dark:bg-dark-bg dark:text-dark-text">
        <ThemeProvider>
          <a
            href="#contenu"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:z-[60] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-white focus:ltr:left-4 focus:rtl:right-4"
          >
            {ui.common.skipToContent}
          </a>
          <DemoBanner ui={ui} />
          <Header locale={locale} ui={ui} dict={dict} />
          <main id="contenu">{children}</main>
          <Footer locale={locale} ui={ui} dict={dict} />
          <RevealProvider />
        </ThemeProvider>
      </body>
    </html>
  );
}
