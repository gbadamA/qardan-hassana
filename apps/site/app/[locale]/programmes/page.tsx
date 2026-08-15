import Link from "next/link";
import { HeartHandshake } from "lucide-react";
import { PROGRAMS, getDictionary, isLocale, localePath, type Locale } from "@qardan/shared";
import { getUi } from "@/content";
import { ProgramCard } from "@/components/cards";
import { PageHero } from "@/components/ui";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const ui = getUi(locale);
  return pageMetadata({
    locale,
    title: ui.nav.programs,
    description: ui.programs.metaDescription,
    path: "/programmes",
  });
}

export default async function ProgramsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);
  const ui = getUi(locale);

  return (
    <>
      <PageHero
        locale={locale}
        homeLabel={ui.nav.home}
        breadcrumbLabel={ui.nav.breadcrumb}
        eyebrow={ui.programs.heroEyebrow}
        title={ui.programs.heroTitle}
        lead={ui.programs.heroLead}
        breadcrumb={[{ href: "/programmes", label: ui.nav.programs }]}
      />

      <section className="container-content py-20">
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

      <section className="container-content pb-24">
        <div
          data-reveal
          className="relative overflow-hidden rounded-lg bg-emerald p-10 text-center text-white sm:p-14"
        >
          <div className="pattern-weave absolute inset-0" aria-hidden />
          <div className="relative">
            <h2 className="font-display text-display">{ui.programs.ctaTitle}</h2>
            <p className="mx-auto mt-4 max-w-xl text-lead text-white/80">{ui.programs.ctaLead}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href={localePath(locale, "/don")} className="btn-accent px-7 py-3.5 text-base">
                <HeartHandshake className="h-5 w-5" />
                {ui.programs.ctaDonate}
              </Link>
              <Link
                href={localePath(locale, "/benevole")}
                className="btn-on-dark px-7 py-3.5 text-base"
              >
                {ui.programs.ctaVolunteer}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
