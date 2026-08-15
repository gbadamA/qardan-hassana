"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AlertTriangle, Clock, HeartHandshake, PiggyBank, TrendingDown, Users } from "lucide-react";
import {
  DEFAULT_LOCALE,
  PROGRAMS,
  formatMoney,
  formatNumber,
  getDictionary,
  isLocale,
  localePath,
  type Locale,
  type ProgramSlug,
} from "@qardan/shared";
import { getDashUi } from "@/content";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@/lib/data";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  ReadOnlyNotice,
  Section,
  StatCard,
  TableWrap,
} from "@/components/ui";
import { DonationRow } from "@/components/DonationRow";

type Stats = {
  donations_validated_fcfa: number;
  donations_pending_count: number;
  donations_pending_fcfa: number;
  donations_month_fcfa: number;
  expenses_fcfa: number;
  balance_fcfa: number;
  beneficiaries_total: number;
  beneficiaries_active: number;
  activities_ongoing: number;
  by_program: Partial<Record<ProgramSlug, {
    beneficiaries: number;
    donations_fcfa: number;
    expenses_fcfa: number;
  }>>;
};

export default function OverviewPage() {
  const params = useParams<{ locale: string }>();
  const locale: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const ui = getDashUi(locale);
  const dict = getDictionary(locale);
  const { can } = useAuth();

  // Les agrégats passent par une fonction SECURITY DEFINER : la RLS empêche un rôle
  // restreint de sommer des lignes qu'il ne peut pas lire une par une.
  const stats = useQuery<Stats>(async (sb) => {
    const { data, error } = await sb.rpc("dashboard_stats");
    return { data: (data as Stats) ?? null, error };
  }, []);

  const pending = useQuery(
    async (sb) =>
      sb
        .from("donations")
        .select("*")
        .eq("status", "en_attente")
        .order("created_at", { ascending: false })
        .limit(5),
    [],
  );

  const s = stats.data;

  return (
    <>
      <PageHeader title={ui.overview.title} lead={ui.overview.lead} />

      {can.readOnly && (
        <ReadOnlyNotice title={ui.common.readOnly} hint={ui.common.readOnlyHint} />
      )}

      {stats.loading && <LoadingState message={ui.common.loading} />}
      {stats.error && <ErrorState message={stats.error} />}

      {s && (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label={ui.overview.collected}
              value={formatMoney(s.donations_validated_fcfa, locale)}
              hint={ui.overview.collectedHint}
              tone="positive"
              icon={<HeartHandshake className="h-4 w-4" />}
            />
            <StatCard
              label={ui.overview.thisMonth}
              value={formatMoney(s.donations_month_fcfa, locale)}
              icon={<HeartHandshake className="h-4 w-4" />}
            />
            <StatCard
              label={ui.overview.pending}
              value={formatMoney(s.donations_pending_fcfa, locale)}
              hint={`${formatNumber(s.donations_pending_count, locale)} · ${ui.overview.pendingHint}`}
              tone={s.donations_pending_count > 0 ? "warning" : "neutral"}
              icon={<Clock className="h-4 w-4" />}
            />
            <StatCard
              label={ui.overview.balance}
              value={formatMoney(s.balance_fcfa, locale)}
              tone={s.balance_fcfa < 0 ? "danger" : "positive"}
              icon={<PiggyBank className="h-4 w-4" />}
            />
          </div>

          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <StatCard
              label={ui.overview.expenses}
              value={formatMoney(s.expenses_fcfa, locale)}
              icon={<TrendingDown className="h-4 w-4" />}
            />
            <StatCard
              label={ui.overview.beneficiaries}
              value={formatNumber(s.beneficiaries_active, locale)}
              hint={`${formatNumber(s.beneficiaries_total, locale)} ${ui.common.total.toLowerCase()}`}
              icon={<Users className="h-4 w-4" />}
            />
            <StatCard
              label={ui.overview.activitiesOngoing}
              value={formatNumber(s.activities_ongoing, locale)}
            />
          </div>

          {/* Par programme — un tableau plutôt qu'un graphique : quatre lignes se lisent
              plus vite qu'un camembert, et restent lisibles à l'impression. */}
          <Section title={ui.overview.byProgram} lead={ui.overview.byProgramLead}>
            <TableWrap>
              <thead>
                <tr>
                  <th className="table-head">{ui.common.program}</th>
                  <th className="table-head">{ui.overview.beneficiaries}</th>
                  <th className="table-head">{ui.overview.collected}</th>
                  <th className="table-head">{ui.overview.expenses}</th>
                </tr>
              </thead>
              <tbody>
                {PROGRAMS.map((p) => {
                  const row = s.by_program?.[p.slug];
                  return (
                    <tr key={p.slug}>
                      <td className="table-cell">
                        <span className="inline-flex items-center gap-2 font-semibold">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: p.color }}
                            aria-hidden
                          />
                          {dict.programs[p.slug].name}
                        </span>
                      </td>
                      <td className="table-cell ltr-nums">
                        {formatNumber(row?.beneficiaries ?? 0, locale)}
                      </td>
                      <td className="table-cell ltr-nums">
                        {formatMoney(row?.donations_fcfa ?? 0, locale)}
                      </td>
                      <td className="table-cell ltr-nums">
                        {formatMoney(row?.expenses_fcfa ?? 0, locale)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </TableWrap>
          </Section>
        </>
      )}

      {/* Dons à traiter — l'action la plus fréquente du Trésorier, donc en page d'accueil. */}
      <Section
        title={ui.overview.pendingTitle}
        lead={ui.overview.pendingLead}
        actions={
          <Link href={localePath(locale, "/dons")} className="btn-ghost btn-sm">
            {ui.overview.seeAllDonations}
          </Link>
        }
      >
        {pending.loading && <LoadingState message={ui.common.loading} />}
        {pending.error && <ErrorState message={pending.error} />}
        {!pending.loading && !pending.error && (pending.data?.length ?? 0) === 0 && (
          <EmptyState message={ui.donations.emptyPending} />
        )}
        {(pending.data?.length ?? 0) > 0 && (
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
              {pending.data!.map((d) => (
                <DonationRow
                  key={d.id}
                  donation={d}
                  locale={locale}
                  dict={dict}
                  ui={ui}
                  canWrite={can.writeFinance}
                  onChanged={() => {
                    void pending.reload();
                    void stats.reload();
                  }}
                />
              ))}
            </tbody>
          </TableWrap>
        )}
      </Section>

      {s && s.balance_fcfa < 0 && (
        <div className="flex items-start gap-3 rounded-md border border-danger/40 bg-danger/10 p-4 text-caption text-danger">
          <AlertTriangle className="mt-px h-4 w-4 shrink-0" aria-hidden />
          <span>
            <strong className="font-semibold">{ui.overview.alertOverBudget}.</strong>{" "}
            {ui.overview.balance} : {formatMoney(s.balance_fcfa, locale)}
          </span>
        </div>
      )}
    </>
  );
}
