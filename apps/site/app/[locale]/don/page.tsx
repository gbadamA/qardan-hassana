import { Suspense } from "react";
import { Landmark, Lock, Receipt, ShieldCheck } from "lucide-react";
import { getDictionary, isLocale, type Locale } from "@qardan/shared";
import { getUi } from "@/content";
import { DonationForm } from "@/components/forms/DonationForm";
import { PageHero } from "@/components/ui";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const ui = getUi(locale);
  return pageMetadata({
    locale,
    title: ui.nav.donate,
    description: ui.donate.metaDescription,
    path: "/don",
  });
}

export default async function DonatePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);
  const ui = getUi(locale);

  const trustIcons = [ShieldCheck, Receipt, Lock];

  return (
    <>
      <PageHero
        locale={locale}
        homeLabel={ui.nav.home}
        breadcrumbLabel={ui.nav.breadcrumb}
        eyebrow={ui.donate.heroEyebrow}
        title={ui.donate.heroTitle}
        lead={ui.donate.heroLead}
        breadcrumb={[{ href: "/don", label: ui.nav.donate }]}
      >
        <ul className="flex flex-wrap gap-x-7 gap-y-3 text-caption text-white/75">
          {ui.donate.trust.map((text, i) => {
            const IconCmp = trustIcons[i] ?? ShieldCheck;
            return (
              <li key={text} className="inline-flex items-center gap-2">
                <IconCmp className="h-4 w-4 text-accent" aria-hidden />
                {text}
              </li>
            );
          })}
        </ul>
      </PageHero>

      <section className="container-content py-16">
        {/*
          `useSearchParams` (préselection du programme via ?programme=…) impose une frontière
          Suspense : sans elle, Next refuse de pré-rendre statiquement la page.
        */}
        <Suspense
          fallback={<div className="card h-96 animate-pulse" aria-label={ui.donate.formLoading} />}
        >
          <DonationForm locale={locale} dict={dict} ui={ui} />
        </Suspense>
      </section>

      {/* Explication du circuit — le donateur doit comprendre ce qui se passe après. */}
      <section className="bg-light-surface-alt py-20 dark:bg-dark-surface-alt">
        <div className="container-content">
          <h2 className="font-display text-display text-light-text dark:text-dark-text">
            {ui.donate.afterTitle}
          </h2>
          <ol className="mt-12 grid gap-6 md:grid-cols-4">
            {ui.donate.steps.map((step, i) => (
              <li
                key={step.title}
                data-reveal
                data-reveal-delay={i * 90}
                className="lift relative rounded-lg border border-light-border bg-light-surface p-7 shadow-card dark:border-dark-border dark:bg-dark-surface"
              >
                <span className="ltr-nums inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald font-display text-lg font-extrabold text-white">
                  {i + 1}
                </span>
                <h3 className="mt-4 font-display text-h3 text-light-text dark:text-dark-text">
                  {step.title}
                </h3>
                <p className="mt-2 text-[0.92rem] leading-relaxed text-light-muted dark:text-dark-muted">
                  {step.text}
                </p>
              </li>
            ))}
          </ol>

          <div
            data-reveal
            className="mt-12 flex items-start gap-4 rounded-lg border border-light-border bg-light-surface p-7 shadow-card dark:border-dark-border dark:bg-dark-surface"
          >
            <Landmark className="mt-0.5 h-6 w-6 shrink-0 text-leaf" aria-hidden />
            <div>
              <h3 className="font-display text-h3 text-light-text dark:text-dark-text">
                {ui.donate.whyTitle}
              </h3>
              <p className="mt-2 max-w-3xl text-[0.93rem] leading-relaxed text-light-muted dark:text-dark-muted">
                {ui.donate.whyText}
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
