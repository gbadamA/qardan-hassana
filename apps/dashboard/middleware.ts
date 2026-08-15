import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, isLocale } from "@qardan/shared";

/**
 * Le back-office est bilingue au même titre que le site : un membre du bureau
 * arabophone doit pouvoir travailler dans sa langue. Français par défaut.
 *
 * ⚠️ Ce middleware ne fait QUE du routage de langue. Il ne garde pas les pages :
 * l'authentification est vérifiée côté client (`(app)/layout.tsx`) et surtout côté
 * base par la RLS. Un middleware qui lirait la session ici donnerait une fausse
 * impression de sécurité — c'est Postgres qui décide, pas Next.
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
  matcher: ["/((?!_next|api|.*\\.[a-zA-Z0-9]+$).*)"],
};
