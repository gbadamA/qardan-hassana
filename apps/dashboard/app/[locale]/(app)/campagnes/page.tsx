"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Download, Plus, Target } from "lucide-react";
import {
  DEFAULT_LOCALE,
  PROGRAMS,
  formatDate,
  formatMoney,
  getDictionary,
  isLocale,
  type Locale,
  type ProgramSlug,
} from "@qardan/shared";
import { getSupabase, type Tables } from "@qardan/supabase";
import { getDashUi, type DashUi } from "@/content";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@/lib/data";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  ReadOnlyNotice,
  Section,
  StatusPill,
  TableWrap,
} from "@/components/ui";

type Campagne = Tables<"campaigns">;
type Don = Tables<"donations">;

/**
 * Campagnes de collecte.
 *
 * ⚠️ Répartition des rôles, conforme à la gouvernance de l'ONG :
 *  • Administratif et Direction créent et éditent les collectes ;
 *  • le Trésorier VALIDE les dons — ce qui met la progression à jour d'elle-même,
 *    puisqu'elle se calcule à partir des dons validés ;
 *  • le Commissaire aux Comptes lit tout, n'écrit rien ;
 *  • le PCA seul peut rattacher un don « général » à une collecte.
 *
 * ⚠️ La progression n'est stockée nulle part. Elle est recalculée à l'affichage à partir
 * des dons validés : une somme figée se désynchronise dès la première validation, et
 * plus personne ne sait laquelle des deux valeurs dit vrai.
 */
export default function CampagnesPage() {
  const params = useParams<{ locale: string }>();
  const locale: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const ui = getDashUi(locale);
  const dict = getDictionary(locale);
  const { can, profile } = useAuth();

  const [showForm, setShowForm] = useState(false);
  const [ouverte, setOuverte] = useState<string | null>(null);

  const campagnes = useQuery<Campagne[]>(
    async (sb) => sb.from("campaigns").select("*").order("starts_on", { ascending: false }),
    [],
  );

  // Tous les dons rattachés à une collecte, en une requête : les répartir ensuite en
  // mémoire évite une requête par campagne ouverte.
  const dons = useQuery<Don[]>(
    async (sb) =>
      sb
        .from("donations")
        .select("*")
        .not("campaign_id", "is", null)
        .order("created_at", { ascending: false }),
    [],
  );

  const donsDe = (id: string) => (dons.data ?? []).filter((d) => d.campaign_id === id);

  /** Convention du dépôt : l'arabe s'affiche s'il existe, sinon le français fait foi. */
  const titre = (c: Campagne) => (locale === "ar" && c.title_ar ? c.title_ar : c.title_fr);

  async function changerStatut(id: string, statut: "publie" | "archive") {
    // La règle d'écriture vit en base (`can_write_campaigns()`) : si le rôle ne convient
    // pas, la requête est rejetée là-bas. Ici on ne fait qu'éviter d'afficher le bouton.
    await getSupabase().from("campaigns").update({ status: statut }).eq("id", id);
    void campagnes.reload();
  }

  const progression = (c: Campagne) => {
    const valides = donsDe(c.id).filter((d) => d.status === "valide");
    const collecte = valides.reduce((s, d) => s + d.amount_fcfa, 0);
    const donateurs = new Set(valides.map((d) => d.donor_phone)).size;
    const pct = Math.min(100, Math.round((collecte / Math.max(1, c.goal_fcfa)) * 100));
    return { collecte, donateurs, pct };
  };

  return (
    <>
      <PageHeader title={ui.campaigns.title} lead={ui.campaigns.lead}>
        {can.writeCampaigns && (
          <button type="button" onClick={() => setShowForm((v) => !v)} className="btn-primary btn-sm">
            <Plus className="h-4 w-4" />
            {ui.campaigns.add}
          </button>
        )}
      </PageHeader>

      {can.readOnly && (
        <ReadOnlyNotice title={ui.common.readOnly} hint={ui.common.readOnlyHint} />
      )}

      {showForm && can.writeCampaigns && (
        <FormulaireCampagne
          ui={ui}
          dict={dict}
          onDone={() => {
            setShowForm(false);
            void campagnes.reload();
          }}
        />
      )}

      <Section title={ui.campaigns.listTitle} lead={ui.campaigns.listLead}>
        {campagnes.loading && <LoadingState message={ui.common.loading} />}
        {campagnes.error && <ErrorState message={campagnes.error} />}
        {!campagnes.loading && (campagnes.data?.length ?? 0) === 0 && (
          <EmptyState message={ui.campaigns.empty} />
        )}

        {(campagnes.data?.length ?? 0) > 0 && (
          <TableWrap>
            <thead>
              <tr>
                <th className="table-head">{ui.campaigns.name}</th>
                <th className="table-head">{ui.common.program}</th>
                <th className="table-head">{ui.campaigns.progress}</th>
                <th className="table-head">{ui.campaigns.donors}</th>
                <th className="table-head">{ui.common.status}</th>
                <th className="table-head">{ui.common.actions}</th>
              </tr>
            </thead>
            <tbody>
              {(campagnes.data ?? []).map((c) => {
                const { collecte, donateurs, pct } = progression(c);
                return (
                  <tr key={c.id}>
                    <td className="table-cell">
                      <span className="font-medium">{titre(c)}</span>
                      {c.ends_on && (
                        <span className="ltr-nums block text-caption text-light-muted dark:text-dark-muted">
                          {ui.campaigns.until} {formatDate(c.ends_on, locale)}
                        </span>
                      )}
                    </td>
                    <td className="table-cell">
                      {c.program ? dict.programs[c.program].name : ui.common.general}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 shrink-0 overflow-hidden rounded-full bg-light-border dark:bg-dark-border">
                          <div className="h-full rounded-full bg-leaf" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="ltr-nums text-caption font-bold">{pct} %</span>
                      </div>
                      <span className="ltr-nums block text-caption text-light-muted dark:text-dark-muted">
                        {formatMoney(collecte, locale)} / {formatMoney(c.goal_fcfa, locale)}
                      </span>
                    </td>
                    <td className="table-cell ltr-nums">{donateurs}</td>
                    <td className="table-cell">
                      <StatusPill
                        label={
                          c.status === "publie"
                            ? ui.campaigns.published
                            : c.status === "archive"
                              ? ui.campaigns.closed
                              : ui.campaigns.draft
                        }
                        tone={c.status === "publie" ? "ok" : "muted"}
                      />
                    </td>
                    <td className="table-cell">
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => setOuverte(ouverte === c.id ? null : c.id)}
                          className="btn-ghost btn-sm"
                        >
                          <Target className="h-3.5 w-3.5" />
                          {ouverte === c.id ? ui.campaigns.hideDonations : ui.campaigns.seeDonations}
                        </button>

                        {can.writeCampaigns && c.status !== "publie" && (
                          <button
                            type="button"
                            onClick={() => void changerStatut(c.id, "publie")}
                            className="btn-ghost btn-sm"
                          >
                            {ui.campaigns.publish}
                          </button>
                        )}
                        {can.writeCampaigns && c.status === "publie" && (
                          <button
                            type="button"
                            onClick={() => void changerStatut(c.id, "archive")}
                            className="btn-ghost btn-sm"
                          >
                            {ui.campaigns.close}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </TableWrap>
        )}
      </Section>

      {profile?.role === "super_admin" && (campagnes.data?.length ?? 0) > 0 && (
        <ReaffectationPca
          campagnes={campagnes.data ?? []}
          locale={locale}
          ui={ui}
          onDone={() => void dons.reload()}
        />
      )}

      {ouverte && (
        <DetailCampagne
          campagne={(campagnes.data ?? []).find((c) => c.id === ouverte)!}
          titre={titre((campagnes.data ?? []).find((c) => c.id === ouverte)!)}
          dons={donsDe(ouverte)}
          locale={locale}
          ui={ui}
          dict={dict}
        />
      )}
    </>
  );
}

/** Dons d'une collecte, avec filtre par statut et export pour le rapport annuel. */
function DetailCampagne({
  campagne,
  titre,
  dons,
  locale,
  ui,
  dict,
}: {
  campagne: Campagne;
  titre: string;
  dons: Don[];
  locale: Locale;
  ui: DashUi;
  dict: ReturnType<typeof getDictionary>;
}) {
  const [filtre, setFiltre] = useState<"tous" | "en_attente" | "valide" | "rejete">("tous");
  const visibles = filtre === "tous" ? dons : dons.filter((d) => d.status === filtre);

  function exporter() {
    const entetes = ["Reference", "Date", "Montant FCFA", "Moyen", "Statut", "Donateur", "Anonyme", "Montant public"];
    const lignes = visibles.map((d) => [
      d.reference,
      d.created_at.slice(0, 10),
      String(d.amount_fcfa),
      d.method,
      d.status,
      // Le nom part dans l'export même si le don est anonyme EN LIGNE : l'anonymat
      // protège le donateur du public, pas du Commissaire aux Comptes.
      d.donor_name,
      d.anonymous ? "oui" : "non",
      d.visibility === "public" ? "oui" : "non",
    ]);

    const csv = [entetes, ...lignes]
      .map((l) => l.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";"))
      .join("\r\n");

    // ⚠️ BOM UTF-8 : sans lui, Excel affiche « Aïcha » en « AÃ¯cha ».
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `campagne-${campagne.title_fr.slice(0, 30).replace(/\W+/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const filtres: typeof filtre[] = ["tous", "en_attente", "valide", "rejete"];

  return (
    <Section
      title={titre}
      lead={ui.campaigns.detailLead}
      actions={
        <button type="button" onClick={exporter} className="btn-ghost btn-sm">
          <Download className="h-3.5 w-3.5" />
          {ui.common.export}
        </button>
      }
    >
      <div className="flex flex-wrap gap-2 px-5 py-4">
        {filtres.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFiltre(f)}
            aria-pressed={filtre === f}
            className={filtre === f ? "btn-primary btn-sm" : "btn-ghost btn-sm"}
          >
            {f === "tous"
              ? ui.common.all
              : f === "en_attente"
                ? ui.donations.awaiting
                : f === "valide"
                  ? ui.donations.validated
                  : ui.donations.rejected}
          </button>
        ))}
      </div>

      {visibles.length === 0 ? (
        <EmptyState message={ui.campaigns.noDonations} />
      ) : (
        <TableWrap>
          <thead>
            <tr>
              <th className="table-head">{ui.donations.reference}</th>
              <th className="table-head">{ui.common.date}</th>
              <th className="table-head">{ui.donations.donor}</th>
              <th className="table-head">{ui.common.amount}</th>
              <th className="table-head">{ui.donations.method}</th>
              <th className="table-head">{ui.common.status}</th>
            </tr>
          </thead>
          <tbody>
            {visibles.map((d) => (
              <tr key={d.id}>
                <td className="table-cell ltr-nums font-medium">{d.reference}</td>
                <td className="table-cell ltr-nums">{formatDate(d.created_at, locale)}</td>
                <td className="table-cell">
                  {d.donor_name}
                  {d.anonymous && (
                    <span className="block text-caption text-light-muted dark:text-dark-muted">
                      {ui.donations.anonymous}
                    </span>
                  )}
                </td>
                <td className="table-cell ltr-nums">
                  {formatMoney(d.amount_fcfa, locale)}
                  {d.visibility === "prive" && (
                    <span className="block text-caption text-light-muted dark:text-dark-muted">
                      {ui.campaigns.amountHidden}
                    </span>
                  )}
                </td>
                <td className="table-cell">{dict.paymentMethods[d.method].label}</td>
                <td className="table-cell">
                  <StatusPill
                    label={
                      d.status === "valide"
                        ? ui.donations.validated
                        : d.status === "rejete"
                          ? ui.donations.rejected
                          : ui.donations.awaiting
                    }
                    tone={d.status === "valide" ? "ok" : d.status === "rejete" ? "danger" : "pending"}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      )}
    </Section>
  );
}

/**
 * Rattacher un don « général » à une collecte — réservé au PCA.
 *
 * Un don versé sans campagne pendant qu'une collecte battait son plein est un cas réel :
 * le donateur a payé au numéro habituel. Le PCA peut le rattacher, ce qui le fait entrer
 * dans le total affiché. On ne propose QUE les dons validés : rattacher un don en attente
 * ne changerait rien à la barre de progression et brouillerait la piste d'audit.
 */
function ReaffectationPca({
  campagnes,
  locale,
  ui,
  onDone,
}: {
  campagnes: Campagne[];
  locale: Locale;
  ui: DashUi;
  onDone: () => void;
}) {
  const [choix, setChoix] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const generaux = useQuery<Don[]>(
    async (sb) =>
      sb
        .from("donations")
        .select("*")
        .is("campaign_id", null)
        .eq("status", "valide")
        .order("created_at", { ascending: false })
        .limit(30),
    [],
  );

  async function rattacher(don: Don) {
    const campagne = choix[don.id];
    if (!campagne) return;
    setBusy(don.id);
    await getSupabase().from("donations").update({ campaign_id: campagne }).eq("id", don.id);
    setBusy(null);
    void generaux.reload();
    onDone();
  }

  const ouvertes = campagnes.filter((c) => c.status === "publie");
  if (ouvertes.length === 0) return null;

  return (
    <Section title={ui.campaigns.reassignTitle} lead={ui.campaigns.reassignLead}>
      {generaux.loading && <LoadingState message={ui.common.loading} />}
      {!generaux.loading && (generaux.data?.length ?? 0) === 0 && (
        <EmptyState message={ui.campaigns.noGeneral} />
      )}

      {(generaux.data?.length ?? 0) > 0 && (
        <TableWrap>
          <thead>
            <tr>
              <th className="table-head">{ui.donations.reference}</th>
              <th className="table-head">{ui.common.date}</th>
              <th className="table-head">{ui.common.amount}</th>
              <th className="table-head">{ui.campaigns.assignTo}</th>
            </tr>
          </thead>
          <tbody>
            {(generaux.data ?? []).map((d) => (
              <tr key={d.id}>
                <td className="table-cell ltr-nums font-medium">{d.reference}</td>
                <td className="table-cell ltr-nums">{formatDate(d.created_at, locale)}</td>
                <td className="table-cell ltr-nums">{formatMoney(d.amount_fcfa, locale)}</td>
                <td className="table-cell">
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      aria-label={ui.campaigns.assignTo}
                      className="field-input py-1.5"
                      value={choix[d.id] ?? ""}
                      onChange={(e) => setChoix((c) => ({ ...c, [d.id]: e.target.value }))}
                    >
                      <option value="">—</option>
                      {ouvertes.map((c) => (
                        <option key={c.id} value={c.id}>{locale === "ar" && c.title_ar ? c.title_ar : c.title_fr}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      disabled={!choix[d.id] || busy === d.id}
                      onClick={() => void rattacher(d)}
                      className="btn-ghost btn-sm"
                    >
                      {ui.campaigns.assign}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      )}
    </Section>
  );
}

/** Création d'une collecte. */
function FormulaireCampagne({
  ui,
  dict,
  onDone,
}: {
  ui: DashUi;
  dict: ReturnType<typeof getDictionary>;
  onDone: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enregistrer(form: FormData) {
    setError(null);
    setBusy(true);

    const { error: e } = await getSupabase()
      .from("campaigns")
      .insert({
        title_fr: String(form.get("title_fr") ?? "").trim(),
        title_ar: String(form.get("title_ar") ?? "").trim() || null,
        description_fr: String(form.get("description_fr") ?? "").trim() || null,
        image_url: String(form.get("image_url") ?? "").trim() || null,
        program: (String(form.get("program") ?? "") || null) as ProgramSlug | null,
        goal_fcfa: Number(form.get("goal_fcfa")) || 0,
        ends_on: String(form.get("ends_on") ?? "") || null,
        // Une collecte naît en BROUILLON : on ne publie pas un objectif chiffré par
        // inadvertance, et la fonction de don refuse de rattacher un don à un brouillon.
        status: "brouillon",
      });

    setBusy(false);
    if (e) {
      setError(e.message);
      return;
    }
    onDone();
  }

  return (
    <Section title={ui.campaigns.addTitle} lead={ui.campaigns.addLead}>
      <form
        action={enregistrer}
        className="grid gap-5 p-5 sm:grid-cols-2"
      >
        <div className="sm:col-span-2">
          <label className="field-label" htmlFor="title_fr">{ui.campaigns.nameFr}</label>
          <input id="title_fr" name="title_fr" required className="field-input" />
        </div>

        <div className="sm:col-span-2">
          <label className="field-label" htmlFor="title_ar">{ui.campaigns.nameAr}</label>
          <input id="title_ar" name="title_ar" dir="rtl" className="field-input" />
        </div>

        <div className="sm:col-span-2">
          <label className="field-label" htmlFor="description_fr">{ui.campaigns.description}</label>
          <textarea id="description_fr" name="description_fr" rows={3} className="field-input" />
        </div>

        <div>
          <label className="field-label" htmlFor="program">{ui.common.program}</label>
          <select id="program" name="program" required className="field-input">
            {PROGRAMS.map((p) => (
              <option key={p.slug} value={p.slug}>{dict.programs[p.slug].name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label" htmlFor="goal_fcfa">{ui.campaigns.goal}</label>
          <input
            id="goal_fcfa"
            name="goal_fcfa"
            type="number"
            min={1000}
            step={1000}
            required
            className="field-input ltr-nums"
          />
        </div>

        <div>
          <label className="field-label" htmlFor="ends_on">{ui.campaigns.endsOn}</label>
          <input id="ends_on" name="ends_on" type="date" className="field-input" />
          <p className="mt-1 text-caption text-light-muted dark:text-dark-muted">
            {ui.campaigns.endsOnHint}
          </p>
        </div>

        <div>
          <label className="field-label" htmlFor="image_url">{ui.campaigns.image}</label>
          <input id="image_url" name="image_url" type="url" className="field-input" />
        </div>

        {error && <p className="sm:col-span-2 text-caption font-semibold text-danger">{error}</p>}

        <div className="sm:col-span-2">
          <button type="submit" disabled={busy} className="btn-primary">
            {busy ? ui.common.saving : ui.common.save}
          </button>
          <p className="mt-2 text-caption text-light-muted dark:text-dark-muted">
            {ui.campaigns.draftHint}
          </p>
        </div>
      </form>
    </Section>
  );
}
