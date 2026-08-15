import Link from "next/link";
import { CalendarDays, Phone } from "lucide-react";
import { CONTACTS, getDictionary, isLocale, localePath, type Locale } from "@qardan/shared";
import { getContent, getUi, pastEventMetas, upcomingEventMetas } from "@/content";
import { EventCard } from "@/components/cards";
import { PageHero, SectionHeading } from "@/components/ui";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const ui = getUi(locale);
  return pageMetadata({
    locale,
    title: ui.nav.events,
    description: ui.events.metaDescription,
    path: "/evenements",
  });
}

export default async function EventsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);
  const ui = getUi(locale);
  const content = getContent(locale);

  const upcoming = upcomingEventMetas();
  const past = pastEventMetas().slice(0, 3);
  const secretary = CONTACTS[1];

  return (
    <>
      <PageHero
        locale={locale}
        homeLabel={ui.nav.home}
        breadcrumbLabel={ui.nav.breadcrumb}
        eyebrow={ui.events.heroEyebrow}
        title={ui.events.heroTitle}
        lead={ui.events.heroLead}
        breadcrumb={[{ href: "/evenements", label: ui.nav.events }]}
      />

      <section className="container-content py-16">
        <SectionHeading
          eyebrow={ui.events.upcomingEyebrow}
          title={`${upcoming.length} ${ui.events.upcomingTitle}`}
        />

        {upcoming.length === 0 ? (
          <p className="mt-10 rounded-lg border border-light-border bg-light-surface p-10 text-center text-light-muted dark:border-dark-border dark:bg-dark-surface dark:text-dark-muted">
            {ui.events.empty}
          </p>
        ) : (
          <div className="mt-10 grid gap-5">
            {upcoming.map((e, i) => (
              <EventCard
                key={e.slug}
                meta={e}
                text={content.events[e.slug]!}
                locale={locale}
                dict={dict}
                ui={ui}
                delay={i * 80}
              />
            ))}
          </div>
        )}
      </section>

      {/* Participer */}
      <section className="container-content pb-16">
        <div
          data-reveal
          className="relative overflow-hidden rounded-lg bg-emerald p-10 text-white sm:p-12"
        >
          <div className="pattern-weave absolute inset-0" aria-hidden />
          <div className="relative grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div>
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-white/15">
                <CalendarDays className="h-6 w-6" aria-hidden />
              </span>
              <h2 className="mt-5 font-display text-display">{ui.events.participateTitle}</h2>
              <p className="mt-4 max-w-xl text-lead text-white/80">{ui.events.participateText}</p>
            </div>
            <div className="flex flex-col gap-3">
              {secretary && (
                <a href={`tel:${secretary.phone}`} className="btn-accent ltr-nums">
                  <Phone className="h-4 w-4" />
                  {secretary.phoneDisplay}
                </a>
              )}
              <Link href={localePath(locale, "/contact")} className="btn-on-dark">
                {ui.events.participateWrite}
              </Link>
              <Link href={localePath(locale, "/benevole")} className="btn-on-dark">
                {ui.events.participateVolunteer}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {past.length > 0 && (
        <section className="container-content pb-24">
          <SectionHeading
            eyebrow={ui.events.pastEyebrow}
            title={ui.events.pastTitle}
            lead={ui.events.pastLead}
          />
          <div className="mt-10 grid gap-5">
            {past.map((e, i) => (
              <EventCard
                key={e.slug}
                meta={e}
                text={content.events[e.slug]!}
                locale={locale}
                dict={dict}
                ui={ui}
                delay={i * 80}
                past
              />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
