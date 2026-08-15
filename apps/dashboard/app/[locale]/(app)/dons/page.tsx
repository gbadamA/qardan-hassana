"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Download, Plus } from "lucide-react";
import {
  DEFAULT_LOCALE,
  PAYMENT_METHODS,
  PROGRAMS,
  currencyLabel,
  formatDate,
  formatMoney,
  getDictionary,
  isLocale,
  type Locale,
  type PaymentMethodId,
  type ProgramSlug,
} from "@qardan/shared";
import { getSupabase, isSupabaseConfigured, type Tables } from "@qardan/supabase";
import { getDashUi } from "@/content";
import { useAuth } from "@/lib/auth";
import { downloadCSV, useQuery } from "@/lib/data";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  ReadOnlyNotice,
  Section,
  TableWrap,
} from "@/components/ui";
import { DonationRow } from "@/components/DonationRow";

type Donation = Tables<"donations">;
type StatusFilter = "tous" | "en_attente" | "valide" | "rejete";

export default function DonationsPage() {
  const params = useParams<{ locale: string }>();
  const locale: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const ui = getDashUi(locale);
  const dict = getDictionary(locale);
  const { can, profile } = useAuth();

  const [status, setStatus] = useState<StatusFilter>("en_attente");
  const [showForm, setShowForm] = useState(false);

  const donations = useQuery<Donation[]>(async (sb) => {
    let q = sb.from("donations").select("*").order("created_at", { ascending: false }).limit(200);
    if (status !== "tous") q = q.eq("status", status);
    return q;
  }, [status]);

  /**
   * Realtime : un don déposé depuis le site apparaît ici sans rafraîchir.
   * ⚠️ Piège vu sur mosquee-fitia : un écouteur ANONYME ne reçoit jamais les tables dont
   * la policy est réservée aux authentifiés. Ici l'utilisateur est connecté, donc c'est
   * bon — mais ne pas s'étonner si un test anonyme ne reçoit rien : c'est le comportement
   * correct, pas un bug.
   */
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = getSupabase();
    const channel = supabase
      .channel("donations-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "donations" }, () => {
        void donations.reload();
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  function exportCsv() {
    const rows: (string | number | null)[][] = [
      [
        ui.donations.reference,
        ui.common.date,
        ui.donations.donor,
        "Téléphone",
        ui.common.amount,
        ui.common.program,
        ui.donations.method,
        ui.common.status,
        ui.donations.transactionRef,
      ],
      ...(donations.data ?? []).map((d) => [
        d.reference,
        formatDate(d.created_at, locale),
        d.anonymous ? ui.donations.anonymous : d.donor_name,
        d.donor_phone,
        d.amount_fcfa,
        d.program ? dict.programs[d.program].name : ui.common.general,
        dict.paymentMethods[d.method].label,
        d.status,
        d.transaction_ref ?? "",
      ]),
    ];
    downloadCSV(`dons-${new Date().toISOString().slice(0, 10)}.csv`, rows);
  }

  return (
    <>
      <PageHeader title={ui.donations.title} lead={ui.donations.lead}>
        <button type="button" onClick={exportCsv} className="btn-ghost btn-sm">
          <Download className="h-4 w-4" />
          {ui.common.export}
        </button>
        {can.writeFinance && (
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="btn-primary btn-sm"
          >
            <Plus className="h-4 w-4" />
            {ui.donations.recordTitle}
          </button>
        )}
      </PageHeader>

      {can.readOnly && <ReadOnlyNotice title={ui.common.readOnly} hint={ui.common.readOnlyHint} />}

      {showForm && can.writeFinance && (
        <DeskDonationForm
          locale={locale}
          ui={ui}
          dict={dict}
          recordedBy={profile?.id ?? null}
          onDone={() => {
            setShowForm(false);
            void donations.reload();
          }}
        />
      )}

      <Section
        title={ui.donations.title}
        lead={ui.donations.filterStatus}
        actions={
          <div className="flex flex-wrap gap-1.5">
            {(["en_attente", "valide", "rejete", "tous"] as StatusFilter[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                aria-pressed={status === s}
                className={`rounded-full border px-3 py-1 text-caption font-semibold transition-colors ${
                  status === s
                    ? "border-primary bg-primary text-white"
                    : "border-light-border text-light-muted hover:border-leaf dark:border-dark-border dark:text-dark-muted"
                }`}
              >
                {s === "tous"
                  ? ui.common.all
                  : s === "en_attente"
                    ? ui.donations.awaiting
                    : s === "valide"
                      ? ui.donations.validated
                      : ui.donations.rejected}
              </button>
            ))}
          </div>
        }
      >
        {donations.loading && <LoadingState message={ui.common.loading} />}
        {donations.error && <ErrorState message={donations.error} />}
        {!donations.loading && !donations.error && (donations.data?.length ?? 0) === 0 && (
          <EmptyState
            message={status === "en_attente" ? ui.donations.emptyPending : ui.common.empty}
          />
        )}
        {(donations.data?.length ?? 0) > 0 && (
          <TableWrap>
            <thead>
              <tr>
                <th className="table-head">{ui.donations.reference}</th>
                <th className="table-head">{ui.donations.donor}</th>
                <th className="table-head">{ui.common.amount}</th>
                <th className="table-head">{ui.common.program}</th>
                <th className="table-head">{ui.donations.method}</th>
                <th className="table-head">{ui.common.actions}</th>
              </tr>
            </thead>
            <tbody>
              {donations.data!.map((d) => (
                <DonationRow
                  key={d.id}
                  donation={d}
                  locale={locale}
                  dict={dict}
                  ui={ui}
                  canWrite={can.writeFinance}
                  onChanged={() => void donations.reload()}
                  showStatus={status === "tous"}
                />
              ))}
            </tbody>
          </TableWrap>
        )}
      </Section>
    </>
  );
}

/**
 * Saisie au guichet.
 *
 * Manque signalé sur mosquee-fitia : le back-office ne savait que *valider* ce qui venait
 * du mobile. Or l'essentiel des dons d'une ONG de quartier arrive en espèces, au siège.
 * Ce formulaire enregistre donc directement en `valide` — c'est le Trésorier qui saisit,
 * il n'a personne à qui demander confirmation.
 */
function DeskDonationForm({
  locale,
  ui,
  dict,
  recordedBy,
  onDone,
}: {
  locale: Locale;
  ui: ReturnType<typeof getDashUi>;
  dict: ReturnType<typeof getDictionary>;
  recordedBy: string | null;
  onDone: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const program = String(fd.get("program") ?? "");

    const { error: insertError } = await getSupabase()
      .from("donations")
      .insert({
        amount_fcfa: Number(fd.get("amount")),
        program: program === "general" ? null : (program as ProgramSlug),
        method: String(fd.get("method")) as PaymentMethodId,
        status: "valide",
        donor_name: String(fd.get("donor_name")),
        donor_phone: String(fd.get("donor_phone")),
        anonymous: fd.get("anonymous") === "on",
        transaction_ref: String(fd.get("transaction_ref") ?? "") || null,
        validated_by: recordedBy,
        validated_at: new Date().toISOString(),
      });

    setBusy(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    onDone();
  }

  return (
    <Section title={ui.donations.recordTitle} lead={ui.donations.recordLead}>
      <form onSubmit={submit} className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label htmlFor="donor_name" className="field-label">
            {dict.fields.fullName}
          </label>
          <input id="donor_name" name="donor_name" required className="field-input" />
        </div>

        <div>
          <label htmlFor="donor_phone" className="field-label">
            {dict.fields.phone}
          </label>
          <input
            id="donor_phone"
            name="donor_phone"
            dir="ltr"
            required
            placeholder={dict.fields.phonePlaceholder}
            className="field-input"
          />
        </div>

        <div>
          <label htmlFor="amount" className="field-label">
            {ui.common.amount} ({currencyLabel(locale)})
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            min={500}
            dir="ltr"
            required
            className="field-input"
          />
        </div>

        <div>
          <label htmlFor="program" className="field-label">
            {ui.common.program}
          </label>
          <select id="program" name="program" defaultValue="general" className="field-input">
            <option value="general">{ui.common.general}</option>
            {PROGRAMS.map((p) => (
              <option key={p.slug} value={p.slug}>
                {dict.programs[p.slug].name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="method" className="field-label">
            {ui.donations.method}
          </label>
          <select id="method" name="method" defaultValue="especes" className="field-input">
            {PAYMENT_METHODS.map((m) => (
              <option key={m.id} value={m.id}>
                {dict.paymentMethods[m.id].label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="transaction_ref" className="field-label">
            {ui.donations.transactionRef}
          </label>
          <input id="transaction_ref" name="transaction_ref" dir="ltr" className="field-input" />
        </div>

        <label className="flex items-center gap-2 text-caption text-light-text sm:col-span-2 lg:col-span-3 dark:text-dark-text">
          <input type="checkbox" name="anonymous" className="h-4 w-4 accent-leaf" />
          {ui.donations.anonymous}
        </label>

        {error && (
          <p role="alert" className="text-caption font-medium text-danger sm:col-span-2 lg:col-span-3">
            {error}
          </p>
        )}

        <div className="sm:col-span-2 lg:col-span-3">
          <button type="submit" disabled={busy} className="btn-primary">
            {busy ? ui.common.saving : ui.donations.recordSubmit}
          </button>
        </div>
      </form>
    </Section>
  );
}
