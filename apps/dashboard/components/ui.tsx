"use client";

import { AlertTriangle, Inbox, Loader2 } from "lucide-react";
import { PROGRAMS, type Dictionary, type ProgramSlug } from "@qardan/shared";

/** En-tête d'écran : titre, chapô, actions à droite. */
export function PageHeader({
  title,
  lead,
  children,
}: {
  title: string;
  lead?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="font-display text-h1 text-light-text dark:text-dark-text">{title}</h1>
        {lead && (
          <p className="mt-1.5 max-w-2xl text-[0.92rem] leading-relaxed text-light-muted dark:text-dark-muted">
            {lead}
          </p>
        )}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </header>
  );
}

/** Tuile de chiffre clé. `tone` colore la valeur, jamais le fond : on garde l'écran sobre. */
export function StatCard({
  label,
  value,
  hint,
  tone = "neutral",
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "neutral" | "positive" | "warning" | "danger";
  icon?: React.ReactNode;
}) {
  const toneClass = {
    neutral: "text-light-text dark:text-dark-text",
    positive: "text-primary dark:text-leaf",
    warning: "text-warning",
    danger: "text-danger",
  }[tone];

  return (
    <div className="card lift p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-caption font-semibold uppercase tracking-wider text-light-muted dark:text-dark-muted">
          {label}
        </p>
        {icon && <span className="text-light-muted dark:text-dark-muted">{icon}</span>}
      </div>
      <p className={`ltr-nums mt-3 font-display text-[1.7rem] font-extrabold leading-none ${toneClass}`}>
        {value}
      </p>
      {hint && (
        <p className="mt-2 text-caption text-light-muted dark:text-dark-muted">{hint}</p>
      )}
    </div>
  );
}

export function Section({
  title,
  lead,
  children,
  actions,
}: {
  title: string;
  lead?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <section className="card mb-6 overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-light-border px-5 py-4 dark:border-dark-border">
        <div>
          <h2 className="font-display text-h3 text-light-text dark:text-dark-text">{title}</h2>
          {lead && (
            <p className="mt-1 text-caption text-light-muted dark:text-dark-muted">{lead}</p>
          )}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children}
    </section>
  );
}

export function ProgramTag({
  program,
  dict,
  fallback,
}: {
  program: ProgramSlug | null;
  dict: Dictionary;
  /** Libellé affiché pour un enregistrement non rattaché à un programme. */
  fallback: string;
}) {
  if (!program) {
    return (
      <span className="inline-flex items-center rounded-full bg-light-surface-alt px-2.5 py-0.5 text-caption font-semibold text-light-muted dark:bg-dark-surface-alt dark:text-dark-muted">
        {fallback}
      </span>
    );
  }
  const color = PROGRAMS.find((p) => p.slug === program)?.color ?? "#0F5C2E";
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-caption font-semibold"
      style={{ backgroundColor: `${color}1A`, color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} aria-hidden />
      {dict.programs[program].name}
    </span>
  );
}

export function StatusPill({
  label,
  tone,
}: {
  label: string;
  tone: "pending" | "ok" | "danger" | "muted";
}) {
  const cls = {
    pending: "bg-warning/15 text-warning",
    ok: "bg-success/15 text-success",
    danger: "bg-danger/15 text-danger",
    muted: "bg-light-surface-alt text-light-muted dark:bg-dark-surface-alt dark:text-dark-muted",
  }[tone];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-caption font-semibold ${cls}`}>
      {label}
    </span>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <Inbox className="h-8 w-8 text-light-muted/50 dark:text-dark-muted/50" aria-hidden />
      <p className="text-[0.92rem] text-light-muted dark:text-dark-muted">{message}</p>
    </div>
  );
}

export function LoadingState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center gap-3 px-6 py-14 text-light-muted dark:text-dark-muted">
      <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
      <span className="text-[0.92rem]">{message}</span>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="m-5 flex items-start gap-3 rounded-md border border-danger/40 bg-danger/10 p-4 text-caption text-danger"
    >
      <AlertTriangle className="mt-px h-4 w-4 shrink-0" aria-hidden />
      <span className="leading-relaxed">{message}</span>
    </div>
  );
}

/** Bandeau affiché au Commissaire aux Comptes : sa lecture seule est un statut, pas une panne. */
export function ReadOnlyNotice({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="mb-6 flex items-start gap-3 rounded-md border border-leaf/30 bg-leaf/8 p-4 text-caption text-primary dark:text-leaf">
      <AlertTriangle className="mt-px h-4 w-4 shrink-0" aria-hidden />
      <span className="leading-relaxed">
        <strong className="font-semibold">{title}.</strong> {hint}
      </span>
    </div>
  );
}

/** Tableau scrollable horizontalement — jamais de débordement de page sur petit écran. */
export function TableWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[46rem] border-collapse">{children}</table>
    </div>
  );
}
