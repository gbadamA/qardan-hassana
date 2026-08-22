import Link from "next/link";
import {
  ArrowRight,
  HeartHandshake,
  Quote,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Users,
} from "lucide-react";
import {
  MIN_AMOUNT,
  ORG,
  PROGRAMS,
  formatMoney,
  getDictionary,
  isLocale,
  localePath,
  type Locale,
} from "@qardan/shared";
import { getContent, getUi, sortedArticleMetas, upcomingEventMetas } from "@/content";
import { ArticleCard, EventCard, ProgramCard } from "@/components/cards";
import { CountUp } from "@/components/CountUp";
import { HomeCampaigns } from "@/components/HomeCampaigns";
import { Icon } from "@/components/Icon";
import { ArrowLink, SectionHeading } from "@/components/ui";
import { LogoMark } from "@/components/Logo";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);
  const ui = getUi(locale);
  const content = getContent(locale);

  const articles = sortedArticleMetas().slice(0, 3);
  const events = upcomingEventMetas().slice(0, 3);
  const [featured, ...others] = articles;

  const impactRows = [
    { amount: 2000, tier: "t2000" as const },
    { amount: 5000, tier: "t5000" as const },
    { amount: 25000, tier: "t25000" as const },
    { amount: 50000, tier: "t50000" as const },
  ];

  return (
    <>
      {/* ══════════════════════════════ HERO ══════════════════════════════ */}
      <section className="relative overflow-hidden bg-emerald text-white">
        <div className="pattern-weave absolute inset-0" aria-hidden />
        {/* Halos lumineux : donnent de la profondeur au dégradé sans image de fond. */}
        <div
          className="absolute top-10 h-96 w-96 rounded-full bg-leaf/25 blur-[110px] ltr:-left-32 rtl:-right-32"
          aria-hidden
        />
        <div
          className="absolute -bottom-24 h-[26rem] w-[26rem] rounded-full bg-accent/15 blur-[120px] ltr:right-0 rtl:left-0"
          aria-hidden
        />

        <div className="container-content relative grid items-center gap-14 py-20 lg:grid-cols-[1.15fr_0.85fr] lg:py-28">
          <div className="animate-fade-up">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-caption font-semibold backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-accent" aria-hidden />
              {ui.home.badge}
            </p>

            <h1 className="mt-6 font-display text-hero text-white">
              {ui.home.titleLine1}
              <br />
              <span className="text-accent">{ui.home.titleLine2}</span>
            </h1>

            <p className="mt-6 max-w-xl text-lead text-white/80">{ui.home.lead}</p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href={localePath(locale, "/don")} className="btn-accent px-7 py-3.5 text-base">
                <HeartHandshake className="h-5 w-5" />
                {ui.home.ctaDonate}
              </Link>
              <Link
                href={localePath(locale, "/programmes")}
                className="btn-on-dark px-7 py-3.5 text-base"
              >
                {ui.home.ctaPrograms}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </div>

            <p className="mt-7 inline-flex items-center gap-2 text-caption text-white/65">
              <ShieldCheck className="h-4 w-4 text-accent" aria-hidden />
              {ui.home.trustFrom} {formatMoney(MIN_AMOUNT, locale)} · {ui.home.trust}
            </p>
          </div>

          {/* Carte flottante : le logo et la devise, posés comme un sceau. */}
          <div className="relative animate-fade-in lg:justify-self-end">
            <div className="relative mx-auto max-w-sm rounded-xl border border-white/15 bg-white/10 p-8 text-center backdrop-blur-xl">
              <LogoMark size={120} className="mx-auto shadow-lifted" />
              <p className="arabic mt-6 text-3xl text-accent">{ORG.nameArabic}</p>
              <p className="mt-2 text-caption uppercase tracking-[0.2em] text-white/60">
                {ui.home.sealSub}
              </p>
              <p className="mt-5 text-[0.95rem] leading-relaxed text-white/80">
                {ui.home.sealText}
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/15 pt-6">
                <div>
                  <p className="ltr-nums font-display text-2xl font-extrabold text-white">4</p>
                  <p className="text-caption text-white/60">{ui.home.sealPrograms}</p>
                </div>
                <div>
                  <p className="ltr-nums font-display text-2xl font-extrabold text-white">1960</p>
                  <p className="text-caption text-white/60">{ui.home.sealLaw}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Séparateur en vague : adoucit la transition vers le fond clair. */}
        <svg
          className="relative block h-[60px] w-full fill-light-bg dark:fill-dark-bg"
          viewBox="0 0 1440 60"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path d="M0,32 C240,64 480,0 720,16 C960,32 1200,64 1440,40 L1440,60 L0,60 Z" />
        </svg>
      </section>

      {/* ═══════════════════════ CHIFFRES CLÉS ═══════════════════════ */}
      <section className="container-content -mt-4 pb-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {content.keyFigures.map((fig, i) => (
            <div
              key={fig.label}
              data-reveal
              data-reveal-delay={i * 90}
              className="lift rounded-lg border border-light-border bg-light-surface p-6 shadow-card dark:border-dark-border dark:bg-dark-surface"
            >
              <p className="font-display text-[2.1rem] font-extrabold leading-none text-primary dark:text-leaf">
                <CountUp to={fig.value} locale={locale} suffix={fig.suffix ?? ""} />
              </p>
              <p className="mt-3 text-[0.95rem] font-semibold text-light-text dark:text-dark-text">
                {fig.label}
              </p>
              <p className="mt-1.5 text-caption leading-relaxed text-light-muted dark:text-dark-muted">
                {fig.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════ COLLECTES EN COURS ═══════════════════ */}
      <HomeCampaigns locale={locale} ui={ui} />

      {/* ═══════════════════════ PROGRAMMES ═══════════════════════ */}
      <section className="container-content py-20 sm:py-24">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow={ui.home.programsEyebrow}
            title={ui.home.programsTitle}
            lead={ui.home.programsLead}
          />
          <div data-reveal>
            <ArrowLink href={localePath(locale, "/programmes")}>{ui.home.programsCta}</ArrowLink>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {PROGRAMS.map((p, i) => (
            <ProgramCard
              key={p.slug}
              program={p}
              locale={locale}
              dict={dict}
              ui={ui}
              delay={i * 80}
            />
          ))}
        </div>
      </section>

      {/* ═══════════════════════ APPEL AU DON ═══════════════════════ */}
      <section className="relative overflow-hidden bg-emerald-deep py-20 text-white sm:py-24">
        <div className="pattern-weave absolute inset-0" aria-hidden />
        <div
          className="absolute top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-accent/20 blur-[100px] ltr:-right-20 rtl:-left-20"
          aria-hidden
        />

        <div className="container-content relative grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow={ui.home.donateEyebrow}
              title={ui.home.donateTitle}
              lead={ui.home.donateLead}
              onDark
            />
            <div className="mt-8 flex flex-wrap gap-3" data-reveal>
              <Link href={localePath(locale, "/don")} className="btn-accent px-7 py-3.5 text-base">
                <HeartHandshake className="h-5 w-5" />
                {ui.home.donateCta}
              </Link>
              <Link
                href={localePath(locale, "/transparence")}
                className="btn-on-dark px-7 py-3.5 text-base"
              >
                <ShieldCheck className="h-4 w-4" />
                {ui.home.donateWhere}
              </Link>
            </div>
          </div>

          {/* Échelle d'impact : le montant devient un geste concret. */}
          <ul className="grid gap-3" data-reveal data-reveal-delay={120}>
            {impactRows.map((row) => (
              <li
                key={row.amount}
                className="flex items-center gap-5 rounded-md border border-white/15 bg-white/5 p-5 backdrop-blur transition-colors hover:border-accent/50 hover:bg-white/10"
              >
                <span className="ltr-nums w-[7.5rem] shrink-0 font-display text-h3 font-bold text-accent">
                  {formatMoney(row.amount, locale)}
                </span>
                <span className="text-[0.92rem] leading-relaxed text-white/80">
                  {dict.impact[row.tier]}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ═══════════════════════ VALEURS ═══════════════════════ */}
      <section className="container-content py-20 sm:py-24">
        <SectionHeading
          eyebrow={ui.home.valuesEyebrow}
          title={ui.home.valuesTitle}
          align="center"
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {content.values.map((v, i) => (
            <div
              key={v.title}
              data-reveal
              data-reveal-delay={i * 80}
              className="lift rounded-lg border border-light-border bg-light-surface p-7 shadow-card dark:border-dark-border dark:bg-dark-surface"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-leaf/12 text-leaf">
                <Icon name={v.icon} className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-display text-h3 text-light-text dark:text-dark-text">
                {v.title}
              </h3>
              <p className="mt-2.5 text-[0.92rem] leading-relaxed text-light-muted dark:text-dark-muted">
                {v.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════ TÉMOIGNAGES ═══════════════════════ */}
      <section className="bg-light-surface-alt py-20 dark:bg-dark-surface-alt sm:py-24">
        <div className="container-content">
          <SectionHeading
            eyebrow={ui.home.testimoniesEyebrow}
            title={ui.home.testimoniesTitle}
            align="center"
          />
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {content.testimonies.map((t, i) => (
              <figure
                key={t.author}
                data-reveal
                data-reveal-delay={i * 100}
                className="lift relative rounded-lg border border-light-border bg-light-surface p-7 shadow-card dark:border-dark-border dark:bg-dark-surface"
              >
                <Quote className="h-8 w-8 text-leaf/25 rtl:-scale-x-100" aria-hidden />
                <blockquote className="mt-4 font-display text-[1.05rem] leading-relaxed text-light-text dark:text-dark-text">
                  « {t.quote} »
                </blockquote>
                <figcaption className="mt-6 border-t border-light-border pt-4 dark:border-dark-border">
                  <span className="block font-semibold text-light-text dark:text-dark-text">
                    {t.author}
                  </span>
                  <span className="block text-caption text-light-muted dark:text-dark-muted">
                    {t.role}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ ACTUALITÉS ═══════════════════════ */}
      <section className="container-content py-20 sm:py-24">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow={ui.home.newsEyebrow}
            title={ui.home.newsTitle}
            lead={ui.home.newsLead}
          />
          <div data-reveal>
            <ArrowLink href={localePath(locale, "/actualites")}>{ui.home.newsCta}</ArrowLink>
          </div>
        </div>

        <div className="grid gap-6">
          {featured && (
            <ArticleCard
              meta={featured}
              text={content.articles[featured.slug]!}
              locale={locale}
              dict={dict}
              ui={ui}
              featured
            />
          )}
          <div className="grid gap-6 md:grid-cols-2">
            {others.map((a, i) => (
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
        </div>
      </section>

      {/* ═══════════════════════ AGENDA ═══════════════════════ */}
      {events.length > 0 && (
        <section className="bg-light-surface-alt py-20 dark:bg-dark-surface-alt sm:py-24">
          <div className="container-content">
            <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
              <SectionHeading
                eyebrow={ui.home.agendaEyebrow}
                title={ui.home.agendaTitle}
                lead={ui.home.agendaLead}
              />
              <div data-reveal>
                <ArrowLink href={localePath(locale, "/evenements")}>{ui.home.agendaCta}</ArrowLink>
              </div>
            </div>
            <div className="grid gap-5">
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
          </div>
        </section>
      )}

      {/* ═══════════════════════ BÉNÉVOLAT + APP ═══════════════════════ */}
      <section className="container-content py-20 sm:py-24">
        <div className="grid gap-6 lg:grid-cols-2">
          <div
            data-reveal
            className="lift relative overflow-hidden rounded-lg border border-light-border bg-light-surface p-9 shadow-card dark:border-dark-border dark:bg-dark-surface"
          >
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary dark:text-leaf">
              <Users className="h-6 w-6" aria-hidden />
            </span>
            <h3 className="mt-5 font-display text-h1 text-light-text dark:text-dark-text">
              {ui.home.volunteerTitle}
            </h3>
            <p className="mt-3 text-[0.95rem] leading-relaxed text-light-muted dark:text-dark-muted">
              {ui.home.volunteerText}
            </p>
            <Link href={localePath(locale, "/benevole")} className="btn-primary mt-7">
              {ui.home.volunteerCta}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </div>

          <div
            data-reveal
            data-reveal-delay={100}
            className="lift relative overflow-hidden rounded-lg bg-emerald p-9 text-white"
          >
            <div className="pattern-weave absolute inset-0" aria-hidden />
            <div className="relative">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-white/15">
                <Smartphone className="h-6 w-6" aria-hidden />
              </span>
              <h3 className="mt-5 font-display text-h1">{ui.home.appTitle}</h3>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-white/80">{ui.home.appText}</p>
              <Link href={localePath(locale, "/application")} className="btn-on-dark mt-7">
                {ui.home.appCta}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
