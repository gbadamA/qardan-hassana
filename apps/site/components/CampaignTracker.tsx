"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Check, Copy, HeartHandshake, MessageCircle, Users } from "lucide-react";
import {
  formatMoney,
  localePath,
  type Locale,
  type ProgramSlug,
} from "@qardan/shared";
import { getSupabase, isSupabaseConfigured } from "@qardan/supabase";
import type { SiteUi } from "@/content";

/**
 * Suivi des dons — collectes en cours d'un programme, avec objectif et progression.
 *
 * ⚠️ **Composant CLIENT, et c'est délibéré.** Les 45 pages du site sont pré-rendues au
 * build : une barre de progression figée à ce moment-là afficherait le total de la
 * dernière mise en ligne, pas celui d'aujourd'hui. Un donateur verrait son propre don
 * absent du compteur. Le bloc se remplit donc à l'affichage, et la page reste statique.
 *
 * ⚠️ Rien n'est lu directement dans la table `donations` : elle contient les téléphones
 * et les emails de tous les donateurs, et la RLS en interdit la lecture à un visiteur
 * anonyme. Tout passe par `public_campaigns()` et `campaign_donors()`, qui ne rendent
 * que ce qui est publiable.
 */

type Campagne = {
  id: string;
  title_fr: string;
  title_ar: string | null;
  description_fr: string | null;
  description_ar: string | null;
  image_url: string | null;
  goal_fcfa: number;
  collected_fcfa: number;
  donors_count: number;
  ends_on: string | null;
  closed: boolean;
};

type Donateur = {
  display_name: string | null;
  amount_fcfa: number | null;
  message: string | null;
  created_at: string;
};

type Tri = "recent" | "montant" | "message";

export function CampaignTracker({
  program,
  locale,
  ui,
}: {
  program: ProgramSlug;
  locale: Locale;
  ui: SiteUi;
}) {
  const [campagnes, setCampagnes] = useState<Campagne[] | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setCampagnes([]);
      return;
    }
    let vivant = true;

    void getSupabase()
      .rpc("public_campaigns", { p_program: program })
      .then(({ data, error }) => {
        if (!vivant) return;
        setCampagnes(error || !data ? [] : (data as Campagne[]));
      });

    return () => {
      vivant = false;
    };
  }, [program]);

  // Tant qu'on ne sait pas, on n'affiche rien : un squelette de carte pour découvrir
  // qu'il n'y a aucune collecte serait une promesse déçue.
  if (campagnes === null || campagnes.length === 0) return null;

  return (
    <section className="container-content pb-20">
      <div className="mb-10" data-reveal>
        <p className="eyebrow mb-3">{ui.campaigns.eyebrow}</p>
        <h2 className="font-display text-display text-light-text dark:text-dark-text">
          {ui.campaigns.title}
        </h2>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {campagnes.map((c) => (
          <CarteCampagne key={c.id} campagne={c} locale={locale} ui={ui} program={program} />
        ))}
      </div>
    </section>
  );
}

function CarteCampagne({
  campagne,
  locale,
  ui,
  program,
}: {
  campagne: Campagne;
  locale: Locale;
  ui: SiteUi;
  program: ProgramSlug;
}) {
  const titre = locale === "ar" && campagne.title_ar ? campagne.title_ar : campagne.title_fr;
  const description =
    locale === "ar" && campagne.description_ar ? campagne.description_ar : campagne.description_fr;

  const pourcentage = Math.min(
    100,
    Math.round((campagne.collected_fcfa / Math.max(1, campagne.goal_fcfa)) * 100),
  );
  const reste = Math.max(0, campagne.goal_fcfa - campagne.collected_fcfa);
  const atteinte = campagne.collected_fcfa >= campagne.goal_fcfa;

  return (
    <article
      data-reveal
      className="lift flex flex-col overflow-hidden rounded-lg border border-light-border bg-light-surface shadow-card dark:border-dark-border dark:bg-dark-surface"
    >
      {campagne.image_url && (
        // eslint-disable-next-line @next/next/no-img-element -- visuel fourni par l'ONG,
        // hébergé où elle le souhaite : `next/image` exigerait de déclarer chaque domaine.
        <img
          src={campagne.image_url}
          alt=""
          className="h-44 w-full object-cover"
          loading="lazy"
        />
      )}

      <div className="flex flex-1 flex-col p-7">
        <h3 className="font-display text-h2 text-light-text dark:text-dark-text">{titre}</h3>

        {description && (
          <p className="mt-3 text-[0.93rem] leading-relaxed text-light-muted dark:text-dark-muted">
            {description}
          </p>
        )}

        {/* Progression */}
        <div className="mt-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="ltr-nums font-display text-h2 font-extrabold text-primary dark:text-leaf">
              {formatMoney(campagne.collected_fcfa, locale)}
            </p>
            <p className="ltr-nums text-caption text-light-muted dark:text-dark-muted">
              {ui.campaigns.of} {formatMoney(campagne.goal_fcfa, locale)}
            </p>
          </div>

          <div
            className="mt-3 h-2.5 overflow-hidden rounded-full bg-light-surface-alt dark:bg-dark-surface-alt"
            role="progressbar"
            aria-valuenow={pourcentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${titre} — ${pourcentage} %`}
          >
            <div
              className="h-full rounded-full bg-leaf transition-[width] duration-700 ease-out motion-reduce:transition-none"
              style={{ width: `${pourcentage}%` }}
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <span className="ltr-nums text-caption font-bold text-leaf">{pourcentage} %</span>
            <span className="inline-flex items-center gap-1.5 text-caption text-light-muted dark:text-dark-muted">
              <Users className="h-3.5 w-3.5" aria-hidden />
              <span className="ltr-nums">{campagne.donors_count}</span> {ui.campaigns.donors}
            </span>
          </div>

          <p className="mt-3 text-[0.9rem] font-semibold text-light-text dark:text-dark-text">
            {atteinte ? (
              <span className="text-leaf">{ui.campaigns.goalReached}</span>
            ) : (
              <>
                {ui.campaigns.remaining}{" "}
                <span className="ltr-nums">{formatMoney(reste, locale)}</span>
              </>
            )}
          </p>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap gap-3">
          {!campagne.closed && (
            <Link
              href={localePath(locale, `/don?programme=${program}&campagne=${campagne.id}`)}
              className="btn-accent"
            >
              <HeartHandshake className="h-4 w-4" />
              {ui.campaigns.give}
            </Link>
          )}
          <BoutonsPartage titre={titre} ui={ui} />
        </div>

        <ListeDonateurs campagneId={campagne.id} locale={locale} ui={ui} />

        {/* Ce qui remplace le « vérifié par » du modèle : notre garantie à nous est le
            circuit de validation, pas un label d'éditeur. */}
        <p className="mt-6 flex items-start gap-2 border-t border-light-border pt-4 text-caption text-light-muted dark:border-dark-border dark:text-dark-muted">
          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-leaf" aria-hidden />
          {ui.campaigns.validatedBy}
        </p>
      </div>
    </article>
  );
}

/** Partage — WhatsApp d'abord : c'est le canal réel de l'ONG. */
function BoutonsPartage({ titre, ui }: { titre: string; ui: SiteUi }) {
  const [copie, setCopie] = useState(false);

  const lien = typeof window === "undefined" ? "" : window.location.href;

  const copier = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(lien);
      setCopie(true);
      setTimeout(() => setCopie(false), 2500);
    } catch {
      // Presse-papiers refusé (contexte non sécurisé, permission) : on ne prétend pas
      // avoir copié. L'utilisateur a toujours la barre d'adresse.
    }
  }, [lien]);

  return (
    <>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(`${titre} — ${lien}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-ghost border-light-border dark:border-dark-border"
      >
        <MessageCircle className="h-4 w-4" aria-hidden />
        {ui.campaigns.shareWhatsapp}
      </a>
      <button
        type="button"
        onClick={() => void copier()}
        className="btn-ghost border-light-border dark:border-dark-border"
      >
        <Copy className="h-4 w-4" aria-hidden />
        {copie ? ui.campaigns.linkCopied : ui.campaigns.copyLink}
      </button>
    </>
  );
}

function ListeDonateurs({
  campagneId,
  locale,
  ui,
}: {
  campagneId: string;
  locale: Locale;
  ui: SiteUi;
}) {
  const [tri, setTri] = useState<Tri>("recent");
  const [limite, setLimite] = useState(5);
  const [donateurs, setDonateurs] = useState<Donateur[] | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setDonateurs([]);
      return;
    }
    let vivant = true;

    void getSupabase()
      .rpc("campaign_donors", { p_campaign: campagneId, p_sort: tri, p_limit: limite })
      .then(({ data, error }) => {
        if (!vivant) return;
        setDonateurs(error || !data ? [] : (data as Donateur[]));
      });

    return () => {
      vivant = false;
    };
  }, [campagneId, tri, limite]);

  if (donateurs === null || donateurs.length === 0) return null;

  const tris: { cle: Tri; label: string }[] = [
    { cle: "recent", label: ui.campaigns.sortRecent },
    { cle: "montant", label: ui.campaigns.sortAmount },
    { cle: "message", label: ui.campaigns.sortComment },
  ];

  return (
    <div className="mt-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h4 className="text-caption font-bold uppercase tracking-wider text-light-muted dark:text-dark-muted">
          {ui.campaigns.donorsTitle}
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {tris.map((t) => (
            <button
              key={t.cle}
              type="button"
              onClick={() => setTri(t.cle)}
              aria-pressed={tri === t.cle}
              className={`rounded-full px-2.5 py-1 text-caption font-semibold transition-colors ${
                tri === t.cle
                  ? "bg-leaf/15 text-primary dark:text-leaf"
                  : "text-light-muted hover:text-primary dark:text-dark-muted dark:hover:text-leaf"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <ul className="mt-4 space-y-3">
        {donateurs.map((d, i) => (
          <li key={`${d.created_at}-${i}`} className="flex gap-3">
            <span
              className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-leaf/12 font-display text-caption font-bold text-primary dark:text-leaf"
              aria-hidden
            >
              {initiales(d.display_name)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-[0.92rem] font-semibold text-light-text dark:text-dark-text">
                  {d.display_name ?? ui.campaigns.anonymous}
                </span>
                <span className="ltr-nums text-[0.9rem] font-bold text-primary dark:text-leaf">
                  {d.amount_fcfa === null
                    ? ui.campaigns.hiddenAmount
                    : formatMoney(d.amount_fcfa, locale)}
                </span>
              </div>
              <p className="ltr-nums text-caption text-light-muted dark:text-dark-muted">
                {ilYA(d.created_at, locale, ui)}
              </p>
              {d.message && (
                <p className="mt-1.5 text-[0.9rem] leading-relaxed text-light-muted dark:text-dark-muted">
                  « {d.message} »
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>

      {donateurs.length >= limite && (
        <button
          type="button"
          onClick={() => setLimite((l) => l + 10)}
          className="btn-ghost mt-4 w-full border-light-border dark:border-dark-border"
        >
          {ui.campaigns.seeMore}
        </button>
      )}
    </div>
  );
}

/** Initiales pour la pastille. Deux lettres au plus, « ? » si le don est anonyme. */
function initiales(nom: string | null): string {
  if (!nom) return "?";
  return (
    nom
      .split(" ")
      .filter((m) => m.length > 1)
      .slice(0, 2)
      .map((m) => m[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

/**
 * Date relative — « il y a 2 h ».
 *
 * ⚠️ `Intl.RelativeTimeFormat` plutôt qu'un calcul maison : il décline correctement en
 * arabe, qui distingue le duel du pluriel. Un « il y a 2 heures » traduit à la main y
 * serait faux.
 */
function ilYA(iso: string, locale: Locale, ui: SiteUi): string {
  const secondes = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (secondes < 60) return ui.campaigns.justNow;

  const rtf = new Intl.RelativeTimeFormat(locale === "ar" ? "ar" : "fr", { numeric: "auto" });
  const paliers: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000],
    ["month", 2592000],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];

  for (const [unite, taille] of paliers) {
    if (secondes >= taille) return rtf.format(-Math.floor(secondes / taille), unite);
  }
  return ui.campaigns.justNow;
}
