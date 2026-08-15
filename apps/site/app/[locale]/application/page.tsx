import Link from "next/link";
import { Bell, Building2, FileText, HeartHandshake, Smartphone, Wifi } from "lucide-react";
import { CONTACTS, isLocale, localePath, type Locale } from "@qardan/shared";
import { getUi } from "@/content";
import { PageHero } from "@/components/ui";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const ui = getUi(locale);
  return pageMetadata({
    locale,
    title: ui.nav.app,
    description: ui.app.metaDescription,
    path: "/application",
  });
}

export default async function AppPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const ui = getUi(locale);
  const secretary = CONTACTS[1];

  const icons = [HeartHandshake, FileText, Bell, Building2, Wifi, Smartphone];

  return (
    <>
      <PageHero
        locale={locale}
        homeLabel={ui.nav.home}
        breadcrumbLabel={ui.nav.breadcrumb}
        eyebrow={ui.app.heroEyebrow}
        title={ui.app.heroTitle}
        lead={ui.app.heroLead}
        breadcrumb={[{ href: "/application", label: ui.nav.app }]}
      />

      <section className="container-content py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ui.app.features.map((f, i) => {
            const IconCmp = icons[i] ?? Smartphone;
            return (
              <div
                key={f.title}
                data-reveal
                data-reveal-delay={i * 70}
                className="lift rounded-lg border border-light-border bg-light-surface p-7 shadow-card dark:border-dark-border dark:bg-dark-surface"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-leaf/12 text-leaf">
                  <IconCmp className="h-5 w-5" aria-hidden />
                </span>
                <h2 className="mt-5 font-display text-h3 text-light-text dark:text-dark-text">
                  {f.title}
                </h2>
                <p className="mt-2.5 text-[0.92rem] leading-relaxed text-light-muted dark:text-dark-muted">
                  {f.text}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="container-content pb-24">
        <div
          data-reveal
          className="relative overflow-hidden rounded-lg bg-emerald p-10 text-center text-white sm:p-14"
        >
          <div className="pattern-weave absolute inset-0" aria-hidden />
          <div className="relative mx-auto max-w-2xl">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-md bg-white/15">
              <Smartphone className="h-7 w-7" aria-hidden />
            </span>
            <h2 className="mt-6 font-display text-display">{ui.app.comingTitle}</h2>
            <p className="mt-4 text-lead text-white/80">{ui.app.comingText}</p>

            {/* Boutons de store désactivés : afficher un lien mort ferait perdre la confiance. */}
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <span
                aria-disabled
                className="btn cursor-not-allowed border border-white/20 bg-white/5 px-6 py-3 text-white/50"
              >
                {ui.app.playStore}
              </span>
              <span
                aria-disabled
                className="btn cursor-not-allowed border border-white/20 bg-white/5 px-6 py-3 text-white/50"
              >
                {ui.app.appStore}
              </span>
            </div>

            <div className="mt-9 flex flex-wrap justify-center gap-3 border-t border-white/15 pt-8">
              <Link href={localePath(locale, "/don")} className="btn-accent">
                <HeartHandshake className="h-4 w-4" />
                {ui.app.ctaDonate}
              </Link>
              {secretary && (
                <a
                  href={`https://wa.me/${secretary.phone.replace("+", "")}`}
                  className="btn-on-dark"
                >
                  {ui.app.ctaNotify}
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
