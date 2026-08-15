"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Plus, X } from "lucide-react";
import {
  DEFAULT_LOCALE,
  PROGRAMS,
  currencyLabel,
  formatDate,
  formatMoney,
  formatNumber,
  getDictionary,
  isLocale,
  type Locale,
  type ProgramSlug,
} from "@qardan/shared";
import { getSupabase, type Tables } from "@qardan/supabase";
import { getDashUi } from "@/content";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@/lib/data";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  ProgramTag,
  Section,
  StatusPill,
  TableWrap,
} from "@/components/ui";

type Beneficiary = Tables<"beneficiaries">;
type Assistance = Tables<"assistance_records">;

const CATEGORIES = [
  "jeune_desoeuvre",
  "enfant_popb",
  "famille_endeuillee",
  "malade",
  "apprenant",
  "participant_sportif",
  "autre",
] as const;

export default function BeneficiariesPage() {
  const params = useParams<{ locale: string }>();
  const locale: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const ui = getDashUi(locale);
  const dict = getDictionary(locale);
  const { can, scopedProgram, profile } = useAuth();

  const [program, setProgram] = useState<ProgramSlug | "tous">(scopedProgram ?? "tous");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<Beneficiary | null>(null);

  const list = useQuery<Beneficiary[]>(async (sb) => {
    let q = sb.from("beneficiaries").select("*").order("created_at", { ascending: false });
    if (program !== "tous") q = q.eq("program", program);
    return q;
  }, [program]);

  // Recherche côté client : le volume attendu (quelques centaines de fiches) ne justifie
  // pas un index plein-texte, et filtrer en mémoire répond instantanément à la frappe.
  const rows = (list.data ?? []).filter((b) =>
    search.trim() === "" ? true : b.full_name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <>
      <PageHeader title={ui.beneficiaries.title} lead={ui.beneficiaries.lead}>
        {can.writeOps && (
          <button type="button" onClick={() => setShowForm((v) => !v)} className="btn-primary btn-sm">
            <Plus className="h-4 w-4" />
            {ui.beneficiaries.add}
          </button>
        )}
      </PageHeader>

      {showForm && can.writeOps && (
        <BeneficiaryForm
          ui={ui}
          dict={dict}
          scopedProgram={scopedProgram}
          createdBy={profile?.id ?? null}
          onDone={() => {
            setShowForm(false);
            void list.reload();
          }}
        />
      )}

      <Section
        title={ui.beneficiaries.title}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={ui.common.search}
              aria-label={ui.common.search}
              className="field-input w-48 py-1.5 text-caption"
            />
            {/* Un responsable de programme ne choisit rien : il ne voit que le sien,
                et la RLS le lui rappellerait s'il essayait. */}
            {!scopedProgram && (
              <select
                value={program}
                onChange={(e) => setProgram(e.target.value as ProgramSlug | "tous")}
                aria-label={ui.common.program}
                className="field-input w-44 py-1.5 text-caption"
              >
                <option value="tous">{ui.common.all}</option>
                {PROGRAMS.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {dict.programs[p.slug].name}
                  </option>
                ))}
              </select>
            )}
          </div>
        }
      >
        {list.loading && <LoadingState message={ui.common.loading} />}
        {list.error && <ErrorState message={list.error} />}
        {!list.loading && !list.error && rows.length === 0 && (
          <EmptyState message={ui.common.empty} />
        )}
        {rows.length > 0 && (
          <TableWrap>
            <thead>
              <tr>
                <th className="table-head">{ui.beneficiaries.fullName}</th>
                <th className="table-head">{ui.common.program}</th>
                <th className="table-head">{ui.beneficiaries.category}</th>
                <th className="table-head">{ui.common.status}</th>
                <th className="table-head">{ui.beneficiaries.phone}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((b) => (
                <tr
                  key={b.id}
                  onClick={() => setSelected(b)}
                  className="cursor-pointer transition-colors hover:bg-light-surface-alt dark:hover:bg-dark-surface-alt"
                >
                  <td className="table-cell font-medium">{b.full_name}</td>
                  <td className="table-cell">
                    <ProgramTag
                      program={b.program as ProgramSlug}
                      dict={dict}
                      fallback={ui.common.general}
                    />
                  </td>
                  <td className="table-cell">
                    {ui.beneficiaries.categories[
                      b.category as keyof typeof ui.beneficiaries.categories
                    ] ?? b.category}
                  </td>
                  <td className="table-cell">
                    <StatusPill
                      label={
                        b.status === "actif"
                          ? ui.beneficiaries.statusActive
                          : b.status === "suivi_termine"
                            ? ui.beneficiaries.statusDone
                            : ui.beneficiaries.statusSuspended
                      }
                      tone={b.status === "actif" ? "ok" : b.status === "suspendu" ? "danger" : "muted"}
                    />
                  </td>
                  <td className="table-cell ltr-nums">{b.phone ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        )}
      </Section>

      {selected && (
        <BeneficiaryDrawer
          beneficiary={selected}
          locale={locale}
          ui={ui}
          dict={dict}
          canWrite={can.writeOps}
          recordedBy={profile?.id ?? null}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}

/** Fiche en tiroir : l'historique d'assistance se lit à côté de la liste, pas ailleurs. */
function BeneficiaryDrawer({
  beneficiary,
  locale,
  ui,
  dict,
  canWrite,
  recordedBy,
  onClose,
}: {
  beneficiary: Beneficiary;
  locale: Locale;
  ui: ReturnType<typeof getDashUi>;
  dict: ReturnType<typeof getDictionary>;
  canWrite: boolean;
  recordedBy: string | null;
  onClose: () => void;
}) {
  const [busy, setBusy] = useState(false);

  const records = useQuery<Assistance[]>(
    async (sb) =>
      sb
        .from("assistance_records")
        .select("*")
        .eq("beneficiary_id", beneficiary.id)
        .order("occurred_on", { ascending: false }),
    [beneficiary.id],
  );

  async function addRecord(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    const amount = String(fd.get("amount") ?? "");

    await getSupabase().from("assistance_records").insert({
      beneficiary_id: beneficiary.id,
      kind: String(fd.get("kind")),
      occurred_on: String(fd.get("occurred_on")),
      amount_fcfa: amount === "" ? null : Number(amount),
      description: String(fd.get("description") ?? "") || null,
      recorded_by: recordedBy,
    });

    setBusy(false);
    e.currentTarget.reset();
    void records.reload();
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <button type="button" aria-label={ui.common.cancel} onClick={onClose} className="flex-1 bg-black/50" />
      <aside className="h-full w-full max-w-lg overflow-y-auto bg-light-bg p-6 dark:bg-dark-bg">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-h2 text-light-text dark:text-dark-text">
              {beneficiary.full_name}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <ProgramTag
                program={beneficiary.program as ProgramSlug}
                dict={dict}
                fallback={ui.common.general}
              />
              <span className="text-caption text-light-muted dark:text-dark-muted">
                {ui.beneficiaries.categories[
                  beneficiary.category as keyof typeof ui.beneficiaries.categories
                ] ?? beneficiary.category}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={ui.common.cancel}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-light-border dark:border-dark-border"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <dl className="mb-6 space-y-2.5 text-[0.92rem]">
          {[
            [ui.beneficiaries.phone, beneficiary.phone],
            [
              ui.beneficiaries.birthYear,
              beneficiary.birth_year ? formatNumber(beneficiary.birth_year, locale) : null,
            ],
            [ui.beneficiaries.address, beneficiary.address],
            [ui.beneficiaries.notes, beneficiary.notes],
          ].map(([label, value]) => (
            <div key={String(label)} className="flex gap-3">
              <dt className="w-40 shrink-0 text-caption text-light-muted dark:text-dark-muted">
                {label}
              </dt>
              <dd className="text-light-text dark:text-dark-text">{value ?? "—"}</dd>
            </div>
          ))}
        </dl>

        <h3 className="mb-3 font-display text-h3 text-light-text dark:text-dark-text">
          {ui.beneficiaries.assistanceTitle}
        </h3>

        {records.loading && <LoadingState message={ui.common.loading} />}
        {!records.loading && (records.data?.length ?? 0) === 0 && (
          <p className="rounded-md border border-dashed border-light-border p-5 text-center text-caption text-light-muted dark:border-dark-border dark:text-dark-muted">
            {ui.beneficiaries.noAssistance}
          </p>
        )}

        <ul className="space-y-2">
          {(records.data ?? []).map((r) => (
            <li key={r.id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <span className="font-semibold text-light-text dark:text-dark-text">{r.kind}</span>
                {r.amount_fcfa !== null && (
                  <span className="ltr-nums font-semibold text-primary dark:text-leaf">
                    {formatMoney(r.amount_fcfa, locale)}
                  </span>
                )}
              </div>
              <p className="mt-1 text-caption text-light-muted dark:text-dark-muted">
                {formatDate(r.occurred_on, locale)}
                {r.description ? ` — ${r.description}` : ""}
              </p>
            </li>
          ))}
        </ul>

        {canWrite && (
          <form onSubmit={addRecord} className="card mt-6 space-y-4 p-5">
            <h4 className="font-display text-h3 text-light-text dark:text-dark-text">
              {ui.beneficiaries.assistanceAdd}
            </h4>

            <div>
              <label htmlFor="kind" className="field-label">
                {ui.beneficiaries.assistanceKind}
              </label>
              <input
                id="kind"
                name="kind"
                required
                placeholder={ui.beneficiaries.assistanceKindPlaceholder}
                className="field-input"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="occurred_on" className="field-label">
                  {ui.common.date}
                </label>
                <input
                  id="occurred_on"
                  name="occurred_on"
                  type="date"
                  dir="ltr"
                  required
                  defaultValue={new Date().toISOString().slice(0, 10)}
                  className="field-input"
                />
              </div>
              <div>
                <label htmlFor="amount" className="field-label">
                  {ui.common.amount} ({currencyLabel(locale)})
                </label>
                <input id="amount" name="amount" type="number" min={0} dir="ltr" className="field-input" />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="field-label">
                {ui.beneficiaries.assistanceDescription}
              </label>
              <textarea id="description" name="description" rows={2} className="field-input" />
            </div>

            <button type="submit" disabled={busy} className="btn-primary w-full">
              {busy ? ui.common.saving : ui.common.save}
            </button>
          </form>
        )}
      </aside>
    </div>
  );
}

function BeneficiaryForm({
  ui,
  dict,
  scopedProgram,
  createdBy,
  onDone,
}: {
  ui: ReturnType<typeof getDashUi>;
  dict: ReturnType<typeof getDictionary>;
  scopedProgram: ProgramSlug | null;
  createdBy: string | null;
  onDone: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const birthYear = String(fd.get("birth_year") ?? "");

    const { error: insertError } = await getSupabase().from("beneficiaries").insert({
      full_name: String(fd.get("full_name")),
      program: (scopedProgram ?? String(fd.get("program"))) as ProgramSlug,
      category: String(fd.get("category")),
      birth_year: birthYear === "" ? null : Number(birthYear),
      phone: String(fd.get("phone") ?? "") || null,
      address: String(fd.get("address") ?? "") || null,
      notes: String(fd.get("notes") ?? "") || null,
      created_by: createdBy,
    });

    setBusy(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    onDone();
  }

  return (
    <Section title={ui.beneficiaries.add}>
      <form onSubmit={submit} className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label htmlFor="full_name" className="field-label">
            {ui.beneficiaries.fullName}
          </label>
          <input id="full_name" name="full_name" required className="field-input" />
        </div>

        {!scopedProgram && (
          <div>
            <label htmlFor="program" className="field-label">
              {ui.common.program}
            </label>
            <select id="program" name="program" required className="field-input">
              {PROGRAMS.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {dict.programs[p.slug].name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label htmlFor="category" className="field-label">
            {ui.beneficiaries.category}
          </label>
          <select id="category" name="category" required className="field-input">
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {ui.beneficiaries.categories[c]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="birth_year" className="field-label">
            {ui.beneficiaries.birthYear}
          </label>
          <input id="birth_year" name="birth_year" type="number" dir="ltr" className="field-input" />
        </div>

        <div>
          <label htmlFor="phone" className="field-label">
            {ui.beneficiaries.phone}
          </label>
          <input id="phone" name="phone" dir="ltr" className="field-input" />
        </div>

        <div>
          <label htmlFor="address" className="field-label">
            {ui.beneficiaries.address}
          </label>
          <input id="address" name="address" className="field-input" />
        </div>

        <div className="sm:col-span-2 lg:col-span-3">
          <label htmlFor="notes" className="field-label">
            {ui.beneficiaries.notes}
          </label>
          <textarea id="notes" name="notes" rows={2} className="field-input" />
        </div>

        {error && (
          <p role="alert" className="text-caption font-medium text-danger sm:col-span-2 lg:col-span-3">
            {error}
          </p>
        )}

        <div className="sm:col-span-2 lg:col-span-3">
          <button type="submit" disabled={busy} className="btn-primary">
            {busy ? ui.common.saving : ui.common.save}
          </button>
        </div>
      </form>
    </Section>
  );
}
