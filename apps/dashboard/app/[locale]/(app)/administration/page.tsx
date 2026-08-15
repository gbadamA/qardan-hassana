"use client";

import { useParams } from "next/navigation";
import {
  DEFAULT_LOCALE,
  PROGRAMS,
  ROLES,
  formatDate,
  getDictionary,
  isLocale,
  type Locale,
  type ProgramSlug,
  type Role,
} from "@qardan/shared";
import { getSupabase, type Tables } from "@qardan/supabase";
import { getDashUi } from "@/content";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@/lib/data";
import { CreateMemberForm } from "@/components/CreateMemberForm";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  ProgramTag,
  ReadOnlyNotice,
  Section,
  StatusPill,
  TableWrap,
} from "@/components/ui";

type Profile = Tables<"profiles">;
type LogEntry = Tables<"activity_log">;

export default function AdministrationPage() {
  const params = useParams<{ locale: string }>();
  const locale: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const ui = getDashUi(locale);
  const dict = getDictionary(locale);
  const { can, profile, can: rights } = useAuth();

  const accounts = useQuery<Profile[]>(
    async (sb) => sb.from("profiles").select("*").order("full_name"),
    [],
  );

  const logs = useQuery<LogEntry[]>(
    async (sb) => sb.from("activity_log").select("*").order("created_at", { ascending: false }).limit(50),
    [],
  );

  async function updateRole(target: Profile, role: Role) {
    await getSupabase().from("profiles").update({ role }).eq("id", target.id);
    void accounts.reload();
  }

  async function toggleActive(target: Profile) {
    await getSupabase().from("profiles").update({ is_active: !target.is_active }).eq("id", target.id);
    void accounts.reload();
  }

  return (
    <>
      <PageHeader title={ui.administration.title} lead={ui.administration.lead} />

      {rights.readOnly && <ReadOnlyNotice title={ui.common.readOnly} hint={ui.common.readOnlyHint} />}

      {can.admin && (
        <CreateMemberForm ui={ui} dict={dict} onCreated={() => void accounts.reload()} />
      )}

      <Section title={ui.administration.accounts}>
        {accounts.loading && <LoadingState message={ui.common.loading} />}
        {accounts.error && <ErrorState message={accounts.error} />}
        {!accounts.loading && !accounts.error && (accounts.data?.length ?? 0) === 0 && (
          <EmptyState message={ui.common.empty} />
        )}
        {(accounts.data?.length ?? 0) > 0 && (
          <TableWrap>
            <thead>
              <tr>
                <th className="table-head">{dict.fields.fullName}</th>
                <th className="table-head">{ui.administration.role}</th>
                <th className="table-head">{ui.administration.assignedProgram}</th>
                <th className="table-head">{ui.common.status}</th>
                <th className="table-head">{ui.common.actions}</th>
              </tr>
            </thead>
            <tbody>
              {accounts.data!.map((a) => {
                const isSelf = a.id === profile?.id;
                return (
                  <tr key={a.id}>
                    <td className="table-cell">
                      <span className="font-medium">{a.full_name}</span>
                      <span className="ltr-nums mt-0.5 block text-caption text-light-muted dark:text-dark-muted">
                        {a.email ?? a.phone ?? "—"}
                      </span>
                    </td>
                    <td className="table-cell">
                      {/* Auto-modification bloquée : sans ce garde-fou, le dernier PCA peut
                          se rétrograder et laisser l'ONG sans administrateur. */}
                      {can.admin && !isSelf ? (
                        <select
                          value={a.role}
                          onChange={(e) => updateRole(a, e.target.value as Role)}
                          aria-label={ui.administration.role}
                          className="field-input py-1.5 text-caption"
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>
                              {dict.roles[r]}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span title={isSelf ? ui.administration.selfEditBlocked : undefined}>
                          {dict.roles[a.role as Role]}
                        </span>
                      )}
                    </td>
                    <td className="table-cell">
                      <ProgramTag
                        program={a.program as ProgramSlug | null}
                        dict={dict}
                        fallback="—"
                      />
                    </td>
                    <td className="table-cell">
                      <StatusPill
                        label={a.is_active ? ui.administration.active : ui.administration.inactive}
                        tone={a.is_active ? "ok" : "danger"}
                      />
                    </td>
                    <td className="table-cell">
                      {can.admin && !isSelf && (
                        <button
                          type="button"
                          onClick={() => toggleActive(a)}
                          className={a.is_active ? "btn-danger btn-sm" : "btn-ghost btn-sm"}
                        >
                          {a.is_active ? ui.administration.deactivate : ui.administration.reactivate}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </TableWrap>
        )}
      </Section>

      <Section title={ui.administration.logTitle} lead={ui.administration.logLead}>
        {logs.loading && <LoadingState message={ui.common.loading} />}
        {/* La RLS réserve le journal au PCA et au Commissaire : une erreur ici n'est pas
            une panne, c'est la policy qui fait son travail. On l'affiche sobrement. */}
        {!logs.loading && (logs.data?.length ?? 0) === 0 && (
          <EmptyState message={ui.administration.logEmpty} />
        )}
        {(logs.data?.length ?? 0) > 0 && (
          <TableWrap>
            <thead>
              <tr>
                <th className="table-head">{ui.common.date}</th>
                <th className="table-head">Action</th>
                <th className="table-head">Entité</th>
              </tr>
            </thead>
            <tbody>
              {logs.data!.map((l) => (
                <tr key={l.id}>
                  <td className="table-cell whitespace-nowrap">
                    {formatDate(l.created_at, locale, {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="table-cell font-mono text-caption">{l.action}</td>
                  <td className="table-cell text-caption text-light-muted dark:text-dark-muted">
                    {l.entity}
                    {l.entity_id ? ` · ${l.entity_id.slice(0, 8)}` : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        )}
      </Section>

      <p className="text-caption text-light-muted dark:text-dark-muted">
        {PROGRAMS.length} {ui.common.program.toLowerCase()} · {ROLES.length} {ui.administration.role.toLowerCase()}
      </p>
    </>
  );
}
