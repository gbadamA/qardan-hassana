"use client";

import { useMemo, useState } from "react";
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
import { getSupabase, type Tables } from "@qardan/supabase";
import { getDashUi } from "@/content";
import { useAuth } from "@/lib/auth";
import { downloadCSV, useQuery } from "@/lib/data";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  ProgramTag,
  ReadOnlyNotice,
  Section,
  StatCard,
  StatusPill,
  TableWrap,
} from "@/components/ui";

type Donation = Tables<"donations">;
type Expense = Tables<"expenses">;

/** Une écriture du journal : don validé ou dépense, ramenés à la même forme. */
type Entry = {
  id: string;
  date: string;
  label: string;
  program: ProgramSlug | null;
  amount: number;
  kind: "income" | "expense";
};

export default function FinancePage() {
  const params = useParams<{ locale: string }>();
  const locale: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const ui = getDashUi(locale);
  const dict = getDictionary(locale);
  const { can, profile } = useAuth();
  const [showForm, setShowForm] = useState(false);

  const donations = useQuery<Donation[]>(
    async (sb) => sb.from("donations").select("*").eq("status", "valide"),
    [],
  );
  const expenses = useQuery<Expense[]>(
    async (sb) => sb.from("expenses").select("*").order("spent_on", { ascending: false }),
    [],
  );

  const income = (donations.data ?? []).reduce((s, d) => s + d.amount_fcfa, 0);
  const spent = (expenses.data ?? []).reduce((s, e) => s + e.amount_fcfa, 0);

  const entries: Entry[] = useMemo(() => {
    const fromDonations: Entry[] = (donations.data ?? []).map((d) => ({
      id: `d-${d.id}`,
      date: d.validated_at ?? d.created_at,
      label: `${ui.finance.entryIncome} — ${d.anonymous ? ui.donations.anonymous : d.donor_name} (${d.reference})`,
      program: d.program as ProgramSlug | null,
      amount: d.amount_fcfa,
      kind: "income",
    }));
    const fromExpenses: Entry[] = (expenses.data ?? []).map((e) => ({
      id: `e-${e.id}`,
      date: e.spent_on,
      label: e.label,
      program: e.program as ProgramSlug | null,
      amount: e.amount_fcfa,
      kind: "expense",
    }));
    return [...fromDonations, ...fromExpenses].sort((a, b) => b.date.localeCompare(a.date));
  }, [donations.data, expenses.data, ui]);

  /** Six derniers mois, recettes vs dépenses. Graphique SVG maison : pas de Recharts. */
  const monthly = useMemo(() => {
    const months: { key: string; label: string; income: number; expense: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
        label: formatDate(d.toISOString(), locale, { month: "short" }).replace(".", ""),
        income: 0,
        expense: 0,
      });
    }
    const bucket = (iso: string) => iso.slice(0, 7);
    for (const e of entries) {
      const m = months.find((x) => x.key === bucket(e.date));
      if (!m) continue;
      if (e.kind === "income") m.income += e.amount;
      else m.expense += e.amount;
    }
    return months;
  }, [entries, locale]);

  const peak = Math.max(1, ...monthly.flatMap((m) => [m.income, m.expense]));

  function exportCsv() {
    const rows: (string | number | null)[][] = [
      [ui.common.date, "Type", ui.finance.label, ui.common.program, ui.common.amount],
      ...entries.map((e) => [
        e.date.slice(0, 10),
        e.kind === "income" ? ui.finance.entryIncome : ui.finance.entryExpense,
        e.label,
        e.program ? dict.programs[e.program].name : ui.common.general,
        e.kind === "income" ? e.amount : -e.amount,
      ]),
    ];
    downloadCSV(`finances-${new Date().toISOString().slice(0, 10)}.csv`, rows);
  }

  const loading = donations.loading || expenses.loading;
  const error = donations.error ?? expenses.error;

  return (
    <>
      <PageHeader title={ui.finance.title} lead={ui.finance.lead}>
        <button type="button" onClick={exportCsv} className="btn-ghost btn-sm">
          <Download className="h-4 w-4" />
          {ui.common.export}
        </button>
        {can.writeFinance && (
          <button type="button" onClick={() => setShowForm((v) => !v)} className="btn-primary btn-sm">
            <Plus className="h-4 w-4" />
            {ui.finance.addExpense}
          </button>
        )}
      </PageHeader>

      {can.readOnly && <ReadOnlyNotice title={ui.common.readOnly} hint={ui.common.readOnlyHint} />}

      {loading && <LoadingState message={ui.common.loading} />}
      {error && <ErrorState message={error} />}

      {!loading && !error && (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <StatCard label={ui.finance.income} value={formatMoney(income, locale)} tone="positive" />
            <StatCard label={ui.finance.expenses} value={formatMoney(spent, locale)} />
            <StatCard
              label={ui.finance.balance}
              value={formatMoney(income - spent, locale)}
              tone={income - spent < 0 ? "danger" : "positive"}
            />
          </div>

          {showForm && can.writeFinance && (
            <ExpenseForm
              locale={locale}
              ui={ui}
              dict={dict}
              recordedBy={profile?.id ?? null}
              onDone={() => {
                setShowForm(false);
                void expenses.reload();
              }}
            />
          )}

          {/* Graphique en barres, en SVG pur : aucune dépendance, imprimable, accessible
              via le tableau qui le suit (le graphique est décoratif, pas la source). */}
          <Section title={ui.finance.monthlyTitle} lead={ui.finance.monthlyLead}>
            <div className="p-5">
              <svg viewBox="0 0 640 200" className="h-52 w-full" role="img" aria-hidden>
                {monthly.map((m, i) => {
                  const x = 20 + i * 100;
                  const hIncome = Math.round((m.income / peak) * 140);
                  const hExpense = Math.round((m.expense / peak) * 140);
                  return (
                    <g key={m.key}>
                      <rect
                        x={x}
                        y={160 - hIncome}
                        width={32}
                        height={hIncome}
                        rx={4}
                        fill="#0F5C2E"
                      />
                      <rect
                        x={x + 38}
                        y={160 - hExpense}
                        width={32}
                        height={hExpense}
                        rx={4}
                        fill="#C2410C"
                      />
                      <text
                        x={x + 35}
                        y={180}
                        textAnchor="middle"
                        className="fill-current text-[11px] text-light-muted dark:text-dark-muted"
                      >
                        {m.label}
                      </text>
                    </g>
                  );
                })}
                <line x1="10" y1="160" x2="630" y2="160" stroke="currentColor" strokeOpacity="0.15" />
              </svg>

              <div className="mt-4 flex flex-wrap gap-5 text-caption text-light-muted dark:text-dark-muted">
                <span className="inline-flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-sm bg-primary" aria-hidden />
                  {ui.finance.income}
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-sm bg-program-sante" aria-hidden />
                  {ui.finance.expenses}
                </span>
              </div>

              <TableWrap>
                <thead>
                  <tr>
                    <th className="table-head">{ui.common.date}</th>
                    <th className="table-head">{ui.finance.income}</th>
                    <th className="table-head">{ui.finance.expenses}</th>
                  </tr>
                </thead>
                <tbody>
                  {monthly.map((m) => (
                    <tr key={m.key}>
                      <td className="table-cell">{m.label}</td>
                      <td className="table-cell ltr-nums">{formatMoney(m.income, locale)}</td>
                      <td className="table-cell ltr-nums">{formatMoney(m.expense, locale)}</td>
                    </tr>
                  ))}
                </tbody>
              </TableWrap>
            </div>
          </Section>

          <Section title={ui.finance.ledgerTitle} lead={ui.finance.ledgerLead}>
            {entries.length === 0 ? (
              <EmptyState message={ui.common.empty} />
            ) : (
              <TableWrap>
                <thead>
                  <tr>
                    <th className="table-head">{ui.common.date}</th>
                    <th className="table-head">{ui.finance.label}</th>
                    <th className="table-head">{ui.common.program}</th>
                    <th className="table-head">{ui.common.status}</th>
                    <th className="table-head">{ui.common.amount}</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.slice(0, 100).map((e) => (
                    <tr key={e.id}>
                      <td className="table-cell whitespace-nowrap">
                        {formatDate(e.date, locale, { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="table-cell">{e.label}</td>
                      <td className="table-cell">
                        <ProgramTag program={e.program} dict={dict} fallback={ui.common.general} />
                      </td>
                      <td className="table-cell">
                        <StatusPill
                          label={e.kind === "income" ? ui.finance.entryIncome : ui.finance.entryExpense}
                          tone={e.kind === "income" ? "ok" : "muted"}
                        />
                      </td>
                      <td
                        className={`table-cell ltr-nums font-semibold ${
                          e.kind === "income" ? "text-primary dark:text-leaf" : "text-danger"
                        }`}
                      >
                        {e.kind === "income" ? "+" : "−"} {formatMoney(e.amount, locale)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </TableWrap>
            )}
          </Section>
        </>
      )}
    </>
  );
}

function ExpenseForm({
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

    const { error: insertError } = await getSupabase().from("expenses").insert({
      label: String(fd.get("label")),
      amount_fcfa: Number(fd.get("amount")),
      program: program === "operating" ? null : (program as ProgramSlug),
      spent_on: String(fd.get("spent_on")),
      method: String(fd.get("method")) as PaymentMethodId,
      proof_path: String(fd.get("proof_path") ?? "") || null,
      recorded_by: recordedBy,
    });

    setBusy(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    onDone();
  }

  return (
    <Section title={ui.finance.addExpense}>
      <form onSubmit={submit} className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="sm:col-span-2">
          <label htmlFor="label" className="field-label">
            {ui.finance.label}
          </label>
          <input
            id="label"
            name="label"
            required
            placeholder={ui.finance.labelPlaceholder}
            className="field-input"
          />
        </div>

        <div>
          <label htmlFor="amount" className="field-label">
            {ui.common.amount} ({currencyLabel(locale)})
          </label>
          <input id="amount" name="amount" type="number" min={1} dir="ltr" required className="field-input" />
        </div>

        <div>
          <label htmlFor="spent_on" className="field-label">
            {ui.finance.spentOn}
          </label>
          <input
            id="spent_on"
            name="spent_on"
            type="date"
            dir="ltr"
            required
            defaultValue={new Date().toISOString().slice(0, 10)}
            className="field-input"
          />
        </div>

        <div>
          <label htmlFor="program" className="field-label">
            {ui.common.program}
          </label>
          <select id="program" name="program" defaultValue="operating" className="field-input">
            <option value="operating">{ui.finance.operating}</option>
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

        <div className="sm:col-span-2 lg:col-span-3">
          <label htmlFor="proof_path" className="field-label">
            {ui.finance.proofPath}
          </label>
          <input id="proof_path" name="proof_path" dir="ltr" className="field-input" />
          <p className="mt-1.5 text-caption text-light-muted dark:text-dark-muted">
            {ui.finance.proofHint}
          </p>
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
