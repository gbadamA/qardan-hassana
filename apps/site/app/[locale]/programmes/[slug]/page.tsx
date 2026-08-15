import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, HandHeart, HeartHandshake } from "lucide-react";
import {
  LOCALES,
  PROGRAMS,
  getDictionary,
  getProgram,
  isLocale,
  isProgramSlug,
  localePath,
  type Locale,
} from "@qardan/shared";
import { getContent, getUi, sortedArticleMetas, upcomingEventMetas } from "@/content";
import { ArticleCard, EventCard } from "@/components/cards";
import { Icon } from "@/components/Icon";
import { ArrowLink, PageHero, SectionHeading } from "@/components/ui";
import { pageMetadata } from "@/lib/seo";

/** Les 4 programmes × 2 langues sont générés statiquement au build. */
export function generateStaticParams() {
  return LOCALES.flatMap((locale) => PROGRAMS.map((p) => ({ locale, slug: p.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  if (!isProgramSlug(slug)) return {};

  const dict = getDictionary(locale);
  const content = getContent(locale);
  const labels = dict.programs[slug];

  return pageMetadata({
    locale,
    title: labels.fullName,
    description: `${labels.tagline} ${content.programDetails[slug].intro}`,
    path: `/programmes/${slug}`,
    keywords: [labels.name, ...labels.actions.slice(0, 2)],
  });
}

export default async function ProgramPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const program = getProgram(slug);
  if (!program || !isProgramSlug(slug)) notFound();

  const dict = getDictionary(locale);
  const ui = getUi(locale);
  const content = getContent(locale);
  const labels = dict.programs[slug];
  const detail = content.programDetails[slug];
  const t = ui.programs.detail;

  const articles = sortedArticleMetas()
    .filter((a) => a.program === slug)
    .slice(0, 2);
  const events = upcomingEventMetas()
    .filter((e) => e.program === slug)
    .slice(0, 2);
  const others = PROGRAMS.filter((p) => p.slug !== slug);

  return (
    <>
      <PageHero
        locale={locale}
        homeLabel={ui.nav.home}
        breadcrumbLabel={ui.nav.breadcrumb}
        eyebrow={labels.fullName}
        title={labels.tagline}
        lead={detail.intro}
        accentColor={program.color}
        breadcrumb={[
          { href: "/programmes", label: ui.nav.programs },
          { href: `/programmes/${slug}`, label: labels.name },
        ]}
      >
        <div className="flex flex-wrap gap-3">
          <Link href={localePath(locale, `/don?programme=${slug}`)} className="btn-accent">
            <HeartHandshake className="h-4 w-4" />
            {t.support}
          </Link>
          <Link href={localePath(locale, "/benevole")} className="btn-on-dark">
            <HandHeart className="h-4 w-4" />
            {t.giveTime}
          </Link>
        </div>
      </PageHero>

      {/* Repères chiffrés */}
      <section className="container-content -mt-10 pb-4">
        <div className="grid gap-4 sm:grid-cols-3">
          {detail.stats.map((s, i) => (
            <div
              key={s.label}
              data-reveal
              data-reveal-delay={i * 90}
              className="lift rounded-lg border border-light-border bg-light-surface p-6 text-center shadow-card dark:border-dark-border dark:bg-dark-surface"
            >
              <p
                className="ltr-nums font-display text-[2.2rem] font-extrabold leading-none"
                style={{ color: program.color }}
              >
                {s.value}
              </p>
              <p className="mt-2.5 text-[0.9rem] text-light-muted dark:text-dark-muted">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Contexte */}
      <section className="container-content py-16">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div data-reveal>
            <span
              className="inline-flex h-14 w-14 items-center justify-center rounded-md"
              style={{ backgroundColor: `${program.color}1A`, color: program.color }}
            >
              <Icon name={program.icon} className="h-7 w-7" />
            </span>
            <h2 className="mt-6 font-display text-display text-light-text dark:text-dark-text">
              {t.contextTitle}
            </h2>
          </div>
          <div data-reveal data-reveal-delay={100} className="prose-content max-w-prose">
            {detail.context.map((p) => (
              <p key={p.slice(0, 30)}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Actions statutaires détaillées */}
      <section className="bg-light-surface-alt py-20 dark:bg-dark-surface-alt">
        <div className="container-content">
          <SectionHeading eyebrow={t.actionsEyebrow} title={t.actionsTitle} />
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {detail.actionDetails.map((a, i) => (
              <article
                key={a.title}
                data-reveal
                data-reveal-delay={i * 90}
                className="lift relative overflow-hidden rounded-lg border border-light-border bg-light-surface p-7 shadow-card dark:border-dark-border dark:bg-dark-surface"
              >
                <span
                  className="absolute inset-y-0 w-1 ltr:left-0 rtl:right-0"
                  style={{ backgroundColor: program.color }}
                  aria-hidden
                />
                <h3 className="font-display text-h3 text-light-text dark:text-dark-text">
                  {a.title}
                </h3>
                <p className="mt-3 text-[0.93rem] leading-relaxed text-light-muted dark:text-dark-muted">
                  {a.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Besoins */}
      <section className="container-content py-20">
        <div
          data-reveal
          className="relative overflow-hidden rounded-lg p-10 text-white sm:p-12"
          style={{ backgroundImage: `linear-gradient(135deg, ${program.color} 0%, #052316 140%)` }}
        >
          <div className="pattern-weave absolute inset-0" aria-hidden />
          <div className="relative grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
            <div>
              <p className="eyebrow mb-3 !text-white/70">{t.needsEyebrow}</p>
              <h2 className="font-display text-display">{t.needsTitle}</h2>
              <Link
                href={localePath(locale, `/don?programme=${slug}`)}
                className="btn-accent mt-7"
              >
                <HeartHandshake className="h-4 w-4" />
                {t.needsCta}
              </Link>
            </div>
            <ul className="space-y-3">
              {detail.needs.map((need) => (
                <li
                  key={need}
                  className="flex items-start gap-3 rounded-md border border-white/15 bg-white/8 p-5 backdrop-blur"
                >
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-accent rtl:rotate-180" aria-hidden />
                  <span className="text-[0.93rem] leading-relaxed text-white/85">{need}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Actualités liées */}
      {articles.length > 0 && (
        <section className="container-content pb-20">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <SectionHeading eyebrow={t.newsEyebrow} title={t.newsTitle} />
            <div data-reveal>
              <ArrowLink href={localePath(locale, "/actualites")}>{t.newsCta}</ArrowLink>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {articles.map((a, i) => (
              <ArticleCard
                key={a.slug}
                meta={a}
                text={content.articles[a.slug]!}
                locale={locale}
                dict={dict}
                ui={ui}
                delay={i * 90}
              />
            ))}
          </div>
        </section>
      )}

      {/* Événements liés */}
      {events.length > 0 && (
        <section className="container-content pb-20">
          <SectionHeading eyebrow={t.eventsEyebrow} title={t.eventsTitle} />
          <div className="mt-10 grid gap-5">
            {events.map((e, i) => (
              <EventCard
                key={e.slug}
                meta={e}
                text={content.events[e.slug]!}
                locale={locale}
                dict={dict}
                ui={ui}
                delay={i * 90}
              />
            ))}
          </div>
        </section>
      )}

      {/* Navigation entre programmes */}
      <section className="container-content pb-24">
        <p className="mb-6 text-caption font-bold uppercase tracking-[0.16em] text-light-muted dark:text-dark-muted">
          {t.others}
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          {others.map((p) => (
            <Link
              key={p.slug}
              href={localePath(locale, `/programmes/${p.slug}`)}
              className="lift group flex items-center gap-4 rounded-lg border border-light-border bg-light-surface p-5 shadow-card dark:border-dark-border dark:bg-dark-surface"
            >
              <span
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md"
                style={{ backgroundColor: `${p.color}1A`, color: p.color }}
              >
                <Icon name={p.icon} className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-display text-h3 text-light-text dark:text-dark-text">
                  {dict.programs[p.slug].name}
                </span>
                <span className="block text-caption text-light-muted dark:text-dark-muted">
                  {dict.programs[p.slug].tagline}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
