import type { Metadata } from "next";
import { Inter, Noto_Kufi_Arabic, Noto_Naskh_Arabic, Plus_Jakarta_Sans } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import { LOCALES, LOCALE_DIR, LOCALE_TAGS, ORG, isLocale, type Locale } from "@qardan/shared";
import { getDashUi } from "@/content";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider, themeBootstrapScript } from "@/lib/theme";

const displayLatin = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display-latin",
  display: "swap",
});
const bodyLatin = Inter({ subsets: ["latin"], variable: "--font-body-latin", display: "swap" });
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
  const ui = getDashUi(locale);

  return {
    title: { default: `${ui.app.name} — ${ORG.shortName}`, template: `%s — ${ui.app.name}` },
    description: ui.login.lead,
    // Un back-office n'a rien à faire dans un moteur de recherche.
    robots: { index: false, follow: false },
    icons: { icon: "/logo-qardan-hassana.jpg" },
  };
}

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

  const fonts = `${displayLatin.variable} ${bodyLatin.variable} ${displayArabic.variable} ${bodyArabic.variable}`;

  return (
    <html
      lang={LOCALE_TAGS[locale]}
      dir={LOCALE_DIR[locale]}
      suppressHydrationWarning
      className={`${fonts} ${locale === "ar" ? "locale-ar" : "locale-fr"}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
      </head>
      <body className="min-h-screen bg-light-bg text-light-text antialiased dark:bg-dark-bg dark:text-dark-text">
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
