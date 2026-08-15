"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Plus } from "lucide-react";
import {
  DEFAULT_LOCALE,
  PROGRAMS,
  currencyLabel,
  formatDate,
  formatMoney,
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

type Activity = Tables<"activities">;
type Expense = Tables<"expenses">;

export default function ActivitiesPage() {
  const params = useParams<{ locale: string }>();
  const locale: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const ui = getDashUi(locale);
  const dict = getDictionary(locale);
  const { can, scopedProgram, profile } = useAuth();
  const [showForm, setShowForm] = useState(false);

  const activities = useQuery<Activity[]>(
    async (sb) => sb.from("activities").select("*").order("starts_at", { ascending: false }),
    [],
  );

  // Le « dépensé » d'une activité se calcule à partir des dépenses qui lui sont rattachées :
  // on ne stocke jamais un cumul, qui divergerait dès la première correction d'écriture.
  const expenses = useQuery<Expense[]>(
    async (sb) => sb.from("expenses").select("*").not("activity_id", "is", null),
    [],
  );

  const spentByActivity = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of expenses.data ?? []) {
      if (!e.activity_id) continue;
      map.set(e.activity_id, (map.get(e.activity_id) ?? 0) + e.amount_fcfa);
    }
    return map;
  }, [expenses.data]);

  const statusLabel = (s: Activity["status"]) =>
    s === "planifie"
      ? ui.activities.statusPlanned
      : s === "en_cours"
        ? ui.activities.statusOngoing
        : s === "termine"
          ? ui.activities.statusDone
          : ui.activities.statusCancelled;

  return (
    <>
      <PageHeader title={ui.activities.title} lead={ui.activities.lead}>
        {can.writeOps && (
          <button type="button" onClick={() => setShowForm((v) => !v)} className="btn-primary btn-sm">
            <Plus className="h-4 w-4" />
            {ui.activities.add}
          </button>
        )}
      </PageHeader>

      {showForm && can.writeOps && (
        <ActivityForm
          ui={ui}
          dict={dict}
          locale={locale}
          scopedProgram={scopedProgram}
          createdBy={profile?.id ?? null}
          onDone={() => {
            setShowForm(false);
            void activities.reload();
          }}
        />
      )}

      <Section title={ui.activities.title}>
        {activities.loading && <LoadingState message={ui.common.loading} />}
        {activities.error && <ErrorState message={activities.error} />}
        {!activities.loading && !activities.error && (activities.data?.length ?? 0) === 0 && (
          <EmptyState message={ui.common.empty} />
        )}
        {(activities.data?.length ?? 0) > 0 && (
          <TableWrap>
            <thead>
              <tr>
                <th className="table-head">{ui.activities.titleField}</th>
                <th className="table-head">{ui.common.program}</th>
                <th className="table-head">{ui.activities.startsAt}</th>
                <th className="table-head">{ui.common.status}</th>
                <th className="table-head">{ui.activities.budget}</th>
                <th className="table-head">{ui.activities.spent}</th>
              </tr>
            </thead>
            <tbody>
              {activities.data!.map((a) => {
                const spent = spentByActivity.get(a.id) ?? 0;
                const over = a.budget_fcfa !== null && spent > a.budget_fcfa;
                return (
                  <tr key={a.id}>
                    <td className="table-cell">
                      <span className="font-medium">
                        {locale === "ar" && a.title_ar ? a.title_ar : a.title_fr}
                      </span>
                      {a.is_public && (
                        <span className="mt-1 block text-caption text-leaf">
                          {ui.activities.isPublic}
                        </span>
                      )}
                    </td>
                    <td className="table-cell">
                      <ProgramTag
                        program={a.program as ProgramSlug}
                        dict={dict}
                        fallback={ui.common.general}
                      />
                    </td>
                    <td className="table-cell whitespace-nowrap">
                      {formatDate(a.starts_at, locale, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="table-cell">
                      <StatusPill
                        label={statusLabel(a.status)}
                        tone={
                          a.status === "en_cours"
                            ? "pending"
                            : a.status === "termine"
                              ? "ok"
                              : a.status === "annule"
                                ? "danger"
                                : "muted"
                        }
                      />
                    </td>
                    <td className="table-cell ltr-nums">
                      {a.budget_fcfa === null ? "—" : formatMoney(a.budget_fcfa, locale)}
                    </td>
                    <td className={`table-cell ltr-nums ${over ? "font-bold text-danger" : ""}`}>
                      {formatMoney(spent, locale)}
                      {over && (
                        <span className="ms-2 text-caption">({ui.activities.overBudget})</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </TableWrap>
        )}
      </Section>
    </>
  );
}

function ActivityForm({
  ui,
  dict,
  locale,
  scopedProgram,
  createdBy,
  onDone,
}: {
  ui: ReturnType<typeof getDashUi>;
  dict: ReturnType<typeof getDictionary>;
  locale: Locale;
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
    const budget = String(fd.get("budget") ?? "");
    const ends = String(fd.get("ends_at") ?? "");

    const { error: insertError } = await getSupabase().from("activities").insert({
      title_fr: String(fd.get("title_fr")),
      title_ar: String(fd.get("title_ar") ?? "") || null,
      description_fr: String(fd.get("description_fr") ?? "") || null,
      program: (scopedProgram ?? String(fd.get("program"))) as ProgramSlug,
      starts_at: new Date(String(fd.get("starts_at"))).toISOString(),
      ends_at: ends === "" ? null : new Date(ends).toISOString(),
      place: String(fd.get("place") ?? "") || null,
      budget_fcfa: budget === "" ? null : Number(budget),
      is_public: fd.get("is_public") === "on",
      registration_required: fd.get("registration_required") === "on",
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
    <Section title={ui.activities.add}>
      <form onSubmit={submit} className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="sm:col-span-2">
          <label htmlFor="title_fr" className="field-label">
            {ui.activities.titleField}
          </label>
          <input id="title_fr" name="title_fr" required className="field-input" />
        </div>

        <div>
          <label htmlFor="title_ar" className="field-label">
            {ui.activities.titleArField}
          </label>
          <input id="title_ar" name="title_ar" dir="rtl" className="field-input" />
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
          <label htmlFor="starts_at" className="field-label">
            {ui.activities.startsAt}
          </label>
          <input
            id="starts_at"
            name="starts_at"
            type="datetime-local"
            dir="ltr"
            required
            className="field-input"
          />
        </div>

        <div>
          <label htmlFor="ends_at" className="field-label">
            {ui.activities.endsAt}
          </label>
          <input id="ends_at" name="ends_at" type="datetime-local" dir="ltr" className="field-input" />
        </div>

        <div>
          <label htmlFor="place" className="field-label">
            {ui.activities.place}
          </label>
          <input id="place" name="place" className="field-input" />
        </div>

        <div>
          <label htmlFor="budget" className="field-label">
            {ui.activities.budget} ({currencyLabel(locale)})
          </label>
          <input id="budget" name="budget" type="number" min={0} dir="ltr" className="field-input" />
        </div>

        <div className="sm:col-span-2 lg:col-span-3">
          <label htmlFor="description_fr" className="field-label">
            {ui.activities.description}
          </label>
          <textarea id="description_fr" name="description_fr" rows={2} className="field-input" />
        </div>

        <label className="flex items-start gap-2 text-caption text-light-text sm:col-span-2 dark:text-dark-text">
          <input type="checkbox" name="is_public" className="mt-0.5 h-4 w-4 accent-leaf" />
          <span>
            {ui.activities.isPublic}
            <span className="mt-0.5 block text-light-muted dark:text-dark-muted">
              {ui.activities.isPublicHint}
            </span>
          </span>
        </label>

        <label className="flex items-center gap-2 text-caption text-light-text dark:text-dark-text">
          <input type="checkbox" name="registration_required" className="h-4 w-4 accent-leaf" />
          {ui.activities.registration}
        </label>

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
