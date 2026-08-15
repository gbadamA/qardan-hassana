import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, LOCALES, isLocale } from "@qardan/shared";

/**
 * Toute page vit sous `/fr/…` ou `/ar/…`.
 *
 * Pourquoi la locale est dans l'URL et non dans un cookie : sans segment de langue,
 * Google n'indexe qu'une seule version du site et le référencement local — exigence
 * explicite du cahier des charges — s'effondre. C'est aussi ce qui rend une page
 * partageable dans la bonne langue par WhatsApp, canal principal ici.
 *
 * ⚠️ La langue par défaut est le FRANÇAIS : une visite sur `/don` atterrit sur `/fr/don`.
 * On ne devine PAS la langue depuis l'en-tête `Accept-Language` — un téléphone configuré
 * en arabe ne signifie pas que son propriétaire préfère lire l'arabe plutôt que le
 * français en Côte d'Ivoire, et une redirection surprise casse les liens partagés.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const firstSegment = pathname.split("/")[1] ?? "";
  if (isLocale(firstSegment)) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  /**
   * On exclut les fichiers servis tels quels et les routes de métadonnées :
   * `/sitemap.xml` et `/robots.txt` ne doivent JAMAIS être préfixés d'une langue,
   * sinon les moteurs ne les trouvent pas à l'emplacement attendu.
   */
  matcher: ["/((?!_next|api|rapports|sitemap.xml|robots.txt|.*\\.[a-zA-Z0-9]+$).*)"],
};

/** Réexporté pour les tests éventuels et la lisibilité du fichier. */
export const supportedLocales = LOCALES;
