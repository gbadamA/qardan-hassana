import { Clock, HandHeart, Users2 } from "lucide-react";
import { getDictionary, isLocale, type Locale } from "@qardan/shared";
import { getUi } from "@/content";
import { VolunteerForm } from "@/components/forms/VolunteerForm";
import { PageHero, SectionHeading } from "@/components/ui";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const ui = getUi(locale);
  return pageMetadata({
    locale,
    title: ui.nav.volunteer,
    description: ui.volunteer.metaDescription,
    path: "/benevole",
  });
}

export default async function VolunteerPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);
  const ui = getUi(locale);

  const icons = [Clock, HandHeart, Users2];

  return (
    <>
      <PageHero
        locale={locale}
        homeLabel={ui.nav.home}
        breadcrumbLabel={ui.nav.breadcrumb}
        eyebrow={ui.volunteer.heroEyebrow}
        title={ui.volunteer.heroTitle}
        lead={ui.volunteer.heroLead}
        breadcrumb={[{ href: "/benevole", label: ui.nav.volunteer }]}
      />

      <section className="container-content py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {ui.volunteer.benefits.map((b, i) => {
            const IconCmp = icons[i] ?? Clock;
            return (
              <div
                key={b.title}
                data-reveal
                data-reveal-delay={i * 90}
                className="lift rounded-lg border border-light-border bg-light-surface p-7 shadow-card dark:border-dark-border dark:bg-dark-surface"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-leaf/12 text-leaf">
                  <IconCmp className="h-5 w-5" aria-hidden />
                </span>
                <h2 className="mt-5 font-display text-h3 text-light-text dark:text-dark-text">
                  {b.title}
                </h2>
                <p className="mt-2.5 text-[0.92rem] leading-relaxed text-light-muted dark:text-dark-muted">
                  {b.text}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="container-content pb-24">
        <SectionHeading
          eyebrow={ui.volunteer.formEyebrow}
          title={ui.volunteer.formTitle}
          lead={ui.volunteer.formLead}
        />
        <div className="mt-10">
          <VolunteerForm dict={dict} ui={ui} />
        </div>
      </section>
    </>
  );
}
