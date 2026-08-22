"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";
import { formatMoney, localePath, type Locale, type ProgramSlug } from "@qardan/shared";
import { getSupabase, isSupabaseConfigured } from "@qardan/supabase";
import type { SiteUi } from "@/content";
import { SectionHeading } from "@/components/ui";

/**
 * Collectes en cours, sur la page d'accueil.
 *
 * ⚠️ **Composant CLIENT, comme `CampaignTracker` et pour la même raison** : la page
 * d'accueil est pré-rendue au build. Un compteur figé à ce moment-là afficherait le
 * total du dernier déploiement pendant des semaines.
 *
 * ⚠️ Volontairement PLUS MAIGRE que la carte de `CampaignTracker` : ni liste de
 * donateurs, ni boutons de partage, ni visuel. L'accueil annonce, il ne détaille pas —
 * six blocs complets y noieraient le reste de la page. Qui veut le détail suit le lien.
 *
 * ⚠️ Si rien n'est ouvert, la section DISPARAÎT entièrement, titre compris. Un intitulé
 * « Collectes en cours » suivi du vide dit au visiteur que l'ONG ne fait rien.
 */

type Campagne = {
  id: string;
  title_fr: string;
  title_ar: string | null;
  program: ProgramSlug | null;
  goal_fcfa: number;
  collected_fcfa: number;
  donors_count: number;
  closed: boolean;
};

export function HomeCampaigns({ locale, ui }: { locale: Locale; ui: SiteUi }) {
  const [campagnes, setCampagnes] = useState<Campagne[] | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setCampagnes([]);
      return;
    }
    let vivant = true;

    void getSupabase()
      .rpc("public_campaigns", { p_program: null })
      .then(({ data, error }) => {
        if (!vivant) return;
        setCampagnes(error || !data ? [] : (data as Campagne[]));
      });

    return () => {
      vivant = false;
    };
  }, []);

  // Trois au plus : au-delà, la section pèse plus lourd que les programmes eux-mêmes.
  const ouvertes = (campagnes ?? []).filter((c) => !c.closed).slice(0, 3);
  if (ouvertes.length === 0) return null;

  return (
    <section className="bg-light-surface-alt py-20 dark:bg-dark-surface-alt sm:py-24">
      <div className="container-content">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            // « Suivi des dons » en surtitre et non « Collectes en cours » : ce dernier
            // est déjà le titre juste en dessous, et l'écho se lisait comme un bégaiement.
            eyebrow={ui.campaigns.title}
            title={ui.campaigns.homeTitle}
            lead={ui.campaigns.homeLead}
          />
          <div data-reveal>
            <Link
              href={localePath(locale, "/collectes")}
              className="group inline-flex items-center gap-2 font-semibold text-primary dark:text-leaf"
            >
              {ui.campaigns.homeCta}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
            </Link>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ouvertes.map((c, i) => {
            const titre = locale === "ar" && c.title_ar ? c.title_ar : c.title_fr;
            const pct = Math.min(100, Math.round((c.collected_fcfa / Math.max(1, c.goal_fcfa)) * 100));

            return (
              <article
                key={c.id}
                data-reveal
                data-reveal-delay={i * 80}
                className="lift flex flex-col rounded-lg border border-light-border bg-light-surface p-7 shadow-card dark:border-dark-border dark:bg-dark-surface"
              >
                <h3 className="font-display text-h3 text-light-text dark:text-dark-text">{titre}</h3>

                <div className="mt-auto pt-6">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="ltr-nums font-display text-h2 font-extrabold text-primary dark:text-leaf">
                      {formatMoney(c.collected_fcfa, locale)}
                    </p>
                    <p className="ltr-nums text-caption text-light-muted dark:text-dark-muted">
                      {ui.campaigns.of} {formatMoney(c.goal_fcfa, locale)}
                    </p>
                  </div>

                  <div
                    className="mt-3 h-2.5 overflow-hidden rounded-full bg-light-surface-alt dark:bg-dark-surface-alt"
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${titre} — ${pct} %`}
                  >
                    <div
                      className="h-full rounded-full bg-leaf transition-[width] duration-700 ease-out motion-reduce:transition-none"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <span className="ltr-nums text-caption font-bold text-leaf">{pct} %</span>
                    <span className="inline-flex items-center gap-1.5 text-caption text-light-muted dark:text-dark-muted">
                      <Users className="h-3.5 w-3.5" aria-hidden />
                      <span className="ltr-nums">{c.donors_count}</span> {ui.campaigns.donors}
                    </span>
                  </div>

                  <Link
                    href={localePath(
                      locale,
                      c.program
                        ? `/don?programme=${c.program}&campagne=${c.id}`
                        : `/don?campagne=${c.id}`,
                    )}
                    className="btn-accent mt-6 w-full justify-center"
                  >
                    {ui.campaigns.give}
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
