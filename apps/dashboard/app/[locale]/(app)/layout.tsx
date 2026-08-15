"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import {
  Activity,
  BarChart3,
  FolderOpen,
  HeartHandshake,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Settings,
  Users,
  X,
} from "lucide-react";
import {
  DEFAULT_LOCALE,
  ORG,
  getDictionary,
  isLocale,
  localePath,
  type Locale,
  type Role,
} from "@qardan/shared";
import { getDashUi } from "@/content";
import { profileCanEnter, useAuth } from "@/lib/auth";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LoadingState } from "@/components/ui";

/**
 * Coquille du back-office : garde d'accès + menu latéral.
 *
 * ⚠️ Cette garde est une COMMODITÉ, pas une sécurité. Elle évite d'afficher un écran
 * vide à quelqu'un qui n'a rien à y faire. La vraie barrière est la RLS Postgres :
 * même en forçant l'URL, les requêtes ne renverraient rien.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const params = useParams<{ locale: string }>();
  const locale: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const ui = getDashUi(locale);
  const dict = getDictionary(locale);

  const router = useRouter();
  const pathname = usePathname();
  const { session, profile, loading, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!session || !profileCanEnter(profile)) router.replace(localePath(locale, "/login"));
  }, [loading, session, profile, router, locale]);

  useEffect(() => setMenuOpen(false), [pathname]);

  if (loading || !session || !profileCanEnter(profile)) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <LoadingState message={ui.common.loading} />
      </main>
    );
  }

  const role = profile!.role as Role;

  // Chaque entrée déclare qui la voit. Le Commissaire aux Comptes n'a aucune raison
  // d'ouvrir « Bénéficiaires » : son mandat porte sur les comptes, pas sur les dossiers
  // sociaux nominatifs — et la RLS le lui refuserait de toute façon.
  const nav = [
    { href: "/", label: ui.nav.overview, icon: LayoutDashboard, roles: null },
    { href: "/dons", label: ui.nav.donations, icon: HeartHandshake, roles: null },
    { href: "/finances", label: ui.nav.finance, icon: BarChart3, roles: null },
    {
      href: "/beneficiaires",
      label: ui.nav.beneficiaries,
      icon: Users,
      roles: ["super_admin", "direction", "administratif", "resp_programme"] as Role[],
    },
    {
      href: "/activites",
      label: ui.nav.activities,
      icon: Activity,
      roles: ["super_admin", "direction", "administratif", "resp_programme"] as Role[],
    },
    {
      href: "/communication",
      label: ui.nav.communication,
      icon: Megaphone,
      roles: ["super_admin", "direction", "administratif", "resp_programme"] as Role[],
    },
    {
      href: "/documents",
      label: ui.nav.documents,
      icon: FolderOpen,
      // Le Trésorier y dépose ses justificatifs, le Commissaire les consulte : tous
      // deux en ont besoin, contrairement aux dossiers de bénéficiaires.
      roles: ["super_admin", "direction", "administratif", "tresorier", "commissaire"] as Role[],
    },
    {
      href: "/administration",
      label: ui.nav.administration,
      icon: Settings,
      roles: ["super_admin", "administratif", "commissaire"] as Role[],
    },
  ].filter((item) => item.roles === null || item.roles.includes(role));

  const isActive = (href: string) => {
    const full = localePath(locale, href);
    return href === "/" ? pathname === full : pathname.startsWith(full);
  };

  const sidebar = (
    <nav aria-label={ui.nav.menu} className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white/15 font-display text-sm font-extrabold text-white">
          QH
        </span>
        <div className="min-w-0">
          <p className="truncate font-display text-[0.95rem] font-bold text-white">
            {ORG.shortName}
          </p>
          <p className="truncate text-caption text-white/60">{ui.app.name}</p>
        </div>
      </div>

      <ul className="flex-1 space-y-1 overflow-y-auto p-3">
        {nav.map((item) => {
          const active = isActive(item.href);
          return (
            <li key={item.href}>
              <Link
                href={localePath(locale, item.href)}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-md px-3.5 py-2.5 text-[0.9rem] font-medium transition-colors ${
                  active ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <item.icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="border-t border-white/10 p-4">
        <p className="truncate text-[0.9rem] font-semibold text-white">{profile!.full_name}</p>
        <p className="truncate text-caption text-white/60">
          {dict.roles[role]}
          {profile!.program ? ` · ${dict.programs[profile!.program].name}` : ""}
        </p>
        <button
          type="button"
          onClick={async () => {
            await signOut();
            router.replace(localePath(locale, "/login"));
          }}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/25 px-4 py-2 text-caption font-semibold text-white/85 transition-colors hover:bg-white/15"
        >
          <LogOut className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
          {ui.nav.logout}
        </button>
      </div>
    </nav>
  );

  return (
    <div className="flex min-h-screen">
      {/* Menu latéral — fixe sur grand écran */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 bg-emerald-deep lg:block print:hidden">
        {sidebar}
      </aside>

      {/* Menu mobile */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label={ui.nav.closeMenu}
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-black/50"
          />
          <aside className="absolute inset-y-0 w-72 bg-emerald-deep ltr:left-0 rtl:right-0">
            {sidebar}
          </aside>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-3 border-b border-light-border bg-light-bg/90 px-5 backdrop-blur dark:border-dark-border dark:bg-dark-bg/90 print:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label={ui.nav.openMenu}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-light-border text-light-text lg:hidden dark:border-dark-border dark:text-dark-text"
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>

          <div className="ms-auto flex items-center gap-2">
            <LanguageSwitcher locale={locale} />
            <ThemeToggle labels={ui.common} />
          </div>
        </header>

        <main className="px-5 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
