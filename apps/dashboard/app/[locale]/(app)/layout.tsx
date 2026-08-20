"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import {
  Activity,
  BarChart3,
  Building2,
  ChevronDown,
  FolderOpen,
  HandHeart,
  HeartHandshake,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Settings,
  Users,
  Wallet,
  X,
  type LucideIcon,
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
 *
 * Le menu est **regroupé par domaine** et chaque groupe se déplie, sur le modèle de
 * preventix-360. Un groupe dont aucune entrée n'est autorisée disparaît entièrement :
 * mieux vaut ne rien montrer que montrer une catégorie vide.
 */

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** `null` = visible par tous ceux qui peuvent entrer. */
  roles: Role[] | null;
};

type NavGroup = { key: string; label: string; icon: LucideIcon; items: NavItem[] };

/** Où l'état déplié/replié survit au rechargement. */
const STORAGE_KEY = "qardan-dash-groupes";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const params = useParams<{ locale: string }>();
  const locale: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const ui = getDashUi(locale);
  const dict = getDictionary(locale);

  const router = useRouter();
  const pathname = usePathname();
  const { session, profile, loading, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  /**
   * Choix explicites de l'utilisateur, par clé de groupe. Un groupe absent de cet objet
   * n'a jamais été touché : son état se déduit alors de la page affichée.
   *
   * ⚠️ Lu dans un `useEffect`, pas à l'initialisation de l'état : `localStorage` n'existe
   * pas au rendu serveur, et lire au premier rendu client ferait diverger le HTML hydraté.
   */
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setOpenGroups(JSON.parse(raw) as Record<string, boolean>);
    } catch {
      // Valeur illisible ou stockage refusé : on repart des groupes fermés.
    }
  }, []);

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
  //
  // « Vue d'ensemble » reste HORS groupe : c'est la page d'accueil, et l'enfermer dans
  // un dépliant à une seule entrée ajouterait un clic pour ne rien révéler.
  const home: NavItem = {
    href: "/",
    label: ui.nav.overview,
    icon: LayoutDashboard,
    roles: null,
  };

  // ⚠️ Le littéral porte l'annotation, pas le résultat du `.map()` : sans elle,
  // TypeScript élargit `roles` en `string[]` et la valeur cesse d'être un `Role[]`.
  const allGroups: NavGroup[] = [
    {
      key: "finances",
      label: ui.nav.groupFinances,
      icon: Wallet,
      items: [
        { href: "/dons", label: ui.nav.donations, icon: HeartHandshake, roles: null },
        { href: "/finances", label: ui.nav.finance, icon: BarChart3, roles: null },
      ],
    },
    {
      key: "terrain",
      label: ui.nav.groupTerrain,
      icon: HandHeart,
      items: [
        {
          href: "/beneficiaires",
          label: ui.nav.beneficiaries,
          icon: Users,
          roles: ["super_admin", "direction", "administratif", "resp_programme"],
        },
        {
          href: "/activites",
          label: ui.nav.activities,
          icon: Activity,
          roles: ["super_admin", "direction", "administratif", "resp_programme"],
        },
      ],
    },
    {
      key: "institution",
      label: ui.nav.groupInstitution,
      icon: Building2,
      items: [
        {
          href: "/communication",
          label: ui.nav.communication,
          icon: Megaphone,
          roles: ["super_admin", "direction", "administratif", "resp_programme"],
        },
        {
          href: "/documents",
          label: ui.nav.documents,
          icon: FolderOpen,
          // Le Trésorier y dépose ses justificatifs, le Commissaire les consulte : tous
          // deux en ont besoin, contrairement aux dossiers de bénéficiaires.
          roles: ["super_admin", "direction", "administratif", "tresorier", "commissaire"],
        },
        {
          href: "/administration",
          label: ui.nav.administration,
          icon: Settings,
          roles: ["super_admin", "administratif", "commissaire"],
        },
      ],
    },
  ];

  const groups = allGroups
    .map((g) => ({ ...g, items: g.items.filter((i) => i.roles === null || i.roles.includes(role)) }))
    .filter((g) => g.items.length > 0);

  const isActive = (href: string) => {
    const full = localePath(locale, href);
    return href === "/" ? pathname === full : pathname.startsWith(full);
  };

  const holdsCurrentPage = (g: NavGroup) => g.items.some((i) => isActive(i.href));

  // Un groupe est ouvert si l'utilisateur l'a ouvert ; à défaut, s'il contient la page
  // affichée — sinon on atterrirait sur une page dont l'entrée de menu est cachée.
  const isOpen = (g: NavGroup) => openGroups[g.key] ?? holdsCurrentPage(g);

  const toggleGroup = (g: NavGroup) => {
    const next = { ...openGroups, [g.key]: !isOpen(g) };
    setOpenGroups(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Stockage indisponible (navigation privée, quota) : l'état ne survivra pas au
      // rechargement, ce qui est sans gravité — le groupe de la page courante s'ouvre seul.
    }
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
        <li>
          <Link
            href={localePath(locale, home.href)}
            aria-current={isActive(home.href) ? "page" : undefined}
            className={`flex items-center gap-3 rounded-md px-3.5 py-2.5 text-[0.9rem] font-medium transition-colors ${
              isActive(home.href)
                ? "bg-white/15 text-white"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            <home.icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
            {home.label}
          </Link>
        </li>

        {groups.map((group) => {
          const open = isOpen(group);
          const holdsActive = holdsCurrentPage(group);
          const panelId = `groupe-${group.key}`;

          return (
            <li key={group.key} className="pt-1">
              <button
                type="button"
                onClick={() => toggleGroup(group)}
                aria-expanded={open}
                aria-controls={panelId}
                aria-label={`${open ? ui.nav.collapseGroup : ui.nav.expandGroup} — ${group.label}${
                  !open && holdsActive ? ` (${ui.nav.containsCurrentPage})` : ""
                }`}
                className={`flex w-full items-center gap-3 rounded-md px-3.5 py-2.5 text-[0.9rem] font-medium transition-colors ${
                  open || holdsActive
                    ? "text-white"
                    : "text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                <group.icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
                <span className="min-w-0 flex-1 truncate text-start">{group.label}</span>
                {/* Replié mais contenant la page ouverte : une pastille le signale,
                    sinon l'utilisateur perd de vue où il se trouve. */}
                {!open && holdsActive && (
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                )}
                <ChevronDown
                  className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                    open ? "rotate-180" : ""
                  }`}
                  aria-hidden
                />
              </button>

              {/* Filet vertical du côté de la lecture : `ms-`/`ps-` suivent le sens RTL. */}
              <ul
                id={panelId}
                hidden={!open}
                className="ms-[1.35rem] mt-0.5 space-y-0.5 border-white/15 ps-2.5 ltr:border-l rtl:border-r"
              >
                {group.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={localePath(locale, item.href)}
                        aria-current={active ? "page" : undefined}
                        className={`flex items-center gap-3 rounded-md px-3 py-2 text-[0.88rem] font-medium transition-colors ${
                          active
                            ? "bg-white/15 text-white"
                            : "text-white/70 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <item.icon className="h-4 w-4 shrink-0" aria-hidden />
                        <span className="min-w-0 truncate">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
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
