import Link from "next/link";
import { Clock3, Download, FileText, Phone } from "lucide-react";
import {
  CONTACTS,
  formatNumber,
  getDictionary,
  isLocale,
  localePath,
  type Locale,
} from "@qardan/shared";
import { FUND_ALLOCATION, REPORT_METAS, getContent, getUi } from "@/content";
import { Icon } from "@/components/Icon";
import { PageHero, SectionHeading } from "@/components/ui";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const ui = getUi(locale);
  return pageMetadata({
    locale,
    title: ui.nav.transparency,
    description: ui.transparency.metaDescription,
    path: "/transparence",
  });
}

export default async function TransparencyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);
  const ui = getUi(locale);
  const content = getContent(locale);

  const treasurer = CONTACTS[2];
  const total = FUND_ALLOCATION.reduce((sum, f) => sum + f.share, 0);
  const govRoleTitles = [dict.roles.tresorier, dict.roles.commissaire, dict.roles.super_admin];

  return (
    <>
      <PageHero
        locale={locale}
        homeLabel={ui.nav.home}
        breadcrumbLabel={ui.nav.breadcrumb}
        eyebrow={ui.transparency.heroEyebrow}
        title={ui.transparency.heroTitle}
        lead={ui.transparency.heroLead}
        breadcrumb={[{ href: "/transparence", label: ui.nav.transparency }]}
      />

      {/* Engagements */}
      <section className="container-content py-20">
        <SectionHeading
          eyebrow={ui.transparency.commitmentsEyebrow}
          title={ui.transparency.commitmentsTitle}
          align="center"
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {content.commitments.map((c, i) => (
            <div
              key={c.title}
              data-reveal
              data-reveal-delay={i * 80}
              className="lift rounded-lg border border-light-border bg-light-surface p-7 shadow-card dark:border-dark-border dark:bg-dark-surface"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-leaf/12 text-leaf">
                <Icon name={c.icon} className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-display text-h3 text-light-text dark:text-dark-text">
                {c.title}
              </h3>
              <p className="mt-2.5 text-[0.92rem] leading-relaxed text-light-muted dark:text-dark-muted">
                {c.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Répartition des fonds — graphique SVG maison, aucune dépendance */}
      <section className="bg-light-surface-alt py-20 dark:bg-dark-surface-alt">
        <div className="container-content grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div data-reveal>
            <SectionHeading
              eyebrow={ui.transparency.allocationEyebrow}
              title={ui.transparency.allocationTitle}
              lead={ui.transparency.allocationLead}
            />
            <p className="mt-6 rounded-md border border-warning/40 bg-warning/10 px-4 py-3 text-caption text-warning">
              {ui.transparency.allocationWarning}
            </p>
          </div>

          <div
            data-reveal
            data-reveal-delay={100}
            className="rounded-lg border border-light-border bg-light-surface p-8 shadow-card dark:border-dark-border dark:bg-dark-surface"
          >
            <ul className="space-y-6">
              {FUND_ALLOCATION.map((f) => {
                const name = dict.programs[f.program].name;
                return (
                  <li key={f.program}>
                    <div className="mb-2 flex items-baseline justify-between gap-4">
                      <span className="text-[0.93rem] font-semibold text-light-text dark:text-dark-text">
                        {name}
                      </span>
                      <span
                        className="ltr-nums font-display text-h3 font-bold tabular-nums"
                        style={{ color: f.color }}
                      >
                        {formatNumber(f.share, locale)} %
                      </span>
                    </div>
                    <div
                      className="h-2.5 w-full overflow-hidden rounded-full bg-light-surface-alt dark:bg-dark-surface-alt"
                      role="img"
                      aria-label={`${name} : ${f.share} % ${ui.transparency.allocationBarAria}`}
                    >
                      <div
                        className="h-full rounded-full transition-[width] duration-700"
                        style={{ width: `${f.share}%`, backgroundColor: f.color }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="mt-7 border-t border-light-border pt-5 text-caption text-light-muted dark:border-dark-border dark:text-dark-muted">
              {ui.transparency.allocationTotalPrefix} {formatNumber(total, locale)} %{" "}
              {ui.transparency.allocationTotalSuffix}
            </p>
          </div>
        </div>
      </section>

      {/* Documents */}
      <section className="container-content py-20">
        <SectionHeading
          eyebrow={ui.transparency.docsEyebrow}
          title={ui.transparency.docsTitle}
          lead={ui.transparency.docsLead}
        />

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {REPORT_METAS.map((r, i) => {
            const text = content.reports[r.id]!;
            return (
              <article
                key={r.id}
                data-reveal
                data-reveal-delay={i * 80}
                className="lift flex items-start gap-5 rounded-lg border border-light-border bg-light-surface p-6 shadow-card dark:border-dark-border dark:bg-dark-surface"
              >
                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary dark:text-leaf">
                  <FileText className="h-6 w-6" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-h3 text-light-text dark:text-dark-text">
                      {text.title}
                    </h3>
                    <span className="ltr-nums rounded-full bg-light-surface-alt px-2.5 py-0.5 text-caption font-semibold text-light-muted dark:bg-dark-surface-alt dark:text-dark-muted">
                      {r.year}
                    </span>
                  </div>
                  <p className="mt-2 text-[0.92rem] leading-relaxed text-light-muted dark:text-dark-muted">
                    {text.summary}
                  </p>

                  {/* Tant que le PDF n'est pas fourni, on affiche l'état réel plutôt qu'un lien mort. */}
                  {r.available ? (
                    <a href={r.fileUrl} download className="btn-ghost mt-4 px-4 py-2 text-sm">
                      <Download className="h-4 w-4" />
                      {ui.transparency.download}
                    </a>
                  ) : (
                    <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-warning/10 px-3.5 py-1.5 text-caption font-medium text-warning">
                      <Clock3 className="h-3.5 w-3.5" aria-hidden />
                      {ui.transparency.pending}
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Gouvernance financière */}
      <section className="container-content pb-24">
        <div
          data-reveal
          className="relative overflow-hidden rounded-lg bg-emerald-deep p-10 text-white sm:p-12"
        >
          <div className="pattern-weave absolute inset-0" aria-hidden />
          <div className="relative grid gap-10 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <p className="eyebrow mb-3 !text-accent">{ui.transparency.govEyebrow}</p>
              <h2 className="font-display text-display">{ui.transparency.govTitle}</h2>
              <ul className="mt-7 space-y-4">
                {ui.transparency.govRoles.map((text, i) => (
                  <li
                    key={govRoleTitles[i]}
                    className="rounded-md border border-white/15 bg-white/5 p-5 backdrop-blur"
                  >
                    <p className="font-display text-h3 text-accent">{govRoleTitles[i]}</p>
                    <p className="mt-1.5 text-[0.92rem] leading-relaxed text-white/80">{text}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:self-end">
              <div className="rounded-md border border-white/15 bg-white/8 p-7 backdrop-blur">
                <h3 className="font-display text-h2">{ui.transparency.questionTitle}</h3>
                <p className="mt-3 text-[0.92rem] leading-relaxed text-white/80">
                  {ui.transparency.questionText}
                </p>
                {treasurer && (
                  <a href={`tel:${treasurer.phone}`} className="btn-accent ltr-nums mt-6 w-full">
                    <Phone className="h-4 w-4" />
                    {treasurer.phoneDisplay}
                  </a>
                )}
                <Link href={localePath(locale, "/contact")} className="btn-on-dark mt-3 w-full">
                  {ui.transparency.writeTreasurer}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
