import Link from "next/link";
import { Building2, Phone, ScrollText } from "lucide-react";
import {
  CONTACTS,
  ORG,
  PROGRAMS,
  getDictionary,
  isLocale,
  localePath,
  type Locale,
} from "@qardan/shared";
import { getContent, getUi } from "@/content";
import { Icon } from "@/components/Icon";
import { PageHero, SectionHeading } from "@/components/ui";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const ui = getUi(locale);
  return pageMetadata({
    locale,
    title: ui.about.title,
    description: ui.about.metaDescription,
    path: "/a-propos",
  });
}

/**
 * ⚠️ TEMPORAIRE — enveloppe de diagnostic.
 *
 * Next masque le message des erreurs de rendu en production. Les expressions JSX en ligne
 * sont évaluées PENDANT l'exécution de la fonction de page : un `try` autour du `return`
 * les couvre donc, contrairement aux composants enfants, rendus plus tard par React.
 *
 * Le repli renvoie une page minimale au lieu de relancer l'erreur : le build continue, et
 * l'on apprend du même coup si les 44 autres pages passent — donc si la cause est locale à
 * cette page ou partagée par la mise en page.
 */
export default async function AboutPage(props: { params: Promise<{ locale: string }> }) {
  try {
    return await AboutPageInner(props);
  } catch (error) {
    const e = error as Error;
    console.error("\n══════ ERREUR /a-propos (diagnostic) ══════");
    console.error("message :", e?.message);
    console.error("pile    :\n" + e?.stack);
    console.error("═══════════════════════════════════════════\n");
    return <div>diagnostic</div>;
  }
}

async function AboutPageInner({ params }: { params: Promise<{ locale: string }> }) {
  // ⚠️ TEMPORAIRE — sonde : un composant qui vaudrait `undefined` (export absent, résolution
  // de module différente sous Linux) lèverait « Element type is invalid » au rendu, hors de
  // portée du `try` ci-dessus. On vérifie donc leur existence ici, où elle est observable.
  console.error(
    "SONDE composants :",
    JSON.stringify({
      ScrollText: typeof ScrollText,
      Building2: typeof Building2,
      Phone: typeof Phone,
      PageHero: typeof PageHero,
      SectionHeading: typeof SectionHeading,
      Icon: typeof Icon,
      Link: typeof Link,
      CONTACTS: Array.isArray(CONTACTS) ? CONTACTS.length : typeof CONTACTS,
      PROGRAMS: Array.isArray(PROGRAMS) ? PROGRAMS.length : typeof PROGRAMS,
    }),
  );

  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);
  const ui = getUi(locale);
  const content = getContent(locale);

  return (
    <>
      <PageHero
        locale={locale}
        homeLabel={ui.nav.home}
        breadcrumbLabel={ui.nav.breadcrumb}
        eyebrow={ui.about.heroEyebrow}
        title={ui.about.heroTitle}
        lead={dict.org.legal}
        breadcrumb={[{ href: "/a-propos", label: ui.about.title }]}
      />

      {/* Objet statutaire */}
      <section className="container-content py-20">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr]">
          <div data-reveal>
            <p className="eyebrow mb-3">{ui.about.objectEyebrow}</p>
            <h2 className="font-display text-display text-light-text dark:text-dark-text">
              {ui.about.objectTitle}
            </h2>
            <p className="arabic mt-8 text-4xl text-leaf">{ORG.nameArabic}</p>
            <p className="mt-2 text-caption uppercase tracking-[0.2em] text-light-muted dark:text-dark-muted">
              {ui.about.arabicSub}
            </p>
            <p className="mt-5 max-w-md text-body leading-relaxed text-light-muted dark:text-dark-muted">
              {ui.about.objectText}
            </p>
          </div>

          <ol className="space-y-5">
            {ui.about.missions.map((item, i) => (
              <li
                key={item.title}
                data-reveal
                data-reveal-delay={i * 100}
                className="lift flex gap-6 rounded-lg border border-light-border bg-light-surface p-7 shadow-card dark:border-dark-border dark:bg-dark-surface"
              >
                <span className="ltr-nums font-display text-[2rem] font-extrabold leading-none text-leaf/40">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-display text-h3 text-light-text dark:text-dark-text">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-[0.93rem] leading-relaxed text-light-muted dark:text-dark-muted">
                    {item.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Cadre légal + organigramme */}
      <section className="bg-light-surface-alt py-20 dark:bg-dark-surface-alt">
        <div className="container-content grid gap-10 lg:grid-cols-2">
          <div
            data-reveal
            className="lift rounded-lg border border-light-border bg-light-surface p-8 shadow-card dark:border-dark-border dark:bg-dark-surface"
          >
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary dark:text-leaf">
              <ScrollText className="h-6 w-6" aria-hidden />
            </span>
            <h2 className="mt-5 font-display text-h1 text-light-text dark:text-dark-text">
              {ui.about.legalTitle}
            </h2>
            <p className="mt-4 text-body leading-relaxed text-light-muted dark:text-dark-muted">
              {ui.about.legalIntro}{" "}
              <strong className="text-light-text dark:text-dark-text">{dict.org.law}</strong>{" "}
              {ui.about.legalIntroEnd}
            </p>
            <ul className="mt-5 space-y-2.5 text-[0.93rem] text-light-muted dark:text-dark-muted">
              {ui.about.legalPoints.map((t) => (
                <li key={t} className="flex gap-2.5">
                  <span className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full bg-leaf" />
                  {t}
                </li>
              ))}
            </ul>
            <Link
              href={localePath(locale, "/transparence")}
              className="btn-ghost mt-7 border-light-border dark:border-dark-border"
            >
              {ui.about.legalCta}
            </Link>
          </div>

          <div
            data-reveal
            data-reveal-delay={100}
            className="lift rounded-lg border border-light-border bg-light-surface p-8 shadow-card dark:border-dark-border dark:bg-dark-surface"
          >
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary dark:text-leaf">
              <Building2 className="h-6 w-6" aria-hidden />
            </span>
            <h2 className="mt-5 font-display text-h1 text-light-text dark:text-dark-text">
              {ui.about.chartTitle}
            </h2>

            <div className="mt-6 space-y-3">
              <div className="rounded-md bg-emerald px-5 py-3.5 text-center font-display text-h3 font-bold text-white">
                {ui.about.chartRoot}
              </div>

              <div className="grid gap-2 sm:grid-cols-3">
                {ui.about.chartDirect.map((node) => (
                  <div
                    key={node}
                    className="rounded-md border border-leaf/30 bg-leaf/8 px-3 py-3 text-center text-caption font-semibold text-primary dark:text-leaf"
                  >
                    {node}
                  </div>
                ))}
              </div>

              <div className="rounded-md border border-light-border bg-light-surface-alt px-5 py-3 text-center text-[0.9rem] font-semibold text-light-text dark:border-dark-border dark:bg-dark-surface-alt dark:text-dark-text">
                {ui.about.chartService}
              </div>

              <div className="grid grid-cols-2 gap-2">
                {PROGRAMS.map((p) => (
                  <div
                    key={p.slug}
                    className="rounded-md px-3 py-3 text-center text-caption font-semibold text-white"
                    style={{ backgroundColor: p.color }}
                  >
                    {dict.programs[p.slug].name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Parcours */}
      <section className="container-content py-20">
        <SectionHeading
          eyebrow={ui.about.pathEyebrow}
          title={ui.about.pathTitle}
          align="center"
        />

        <ol className="relative mt-14 space-y-10 before:absolute before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-light-border ltr:before:left-[7px] rtl:before:right-[7px] sm:ltr:before:left-1/2 sm:rtl:before:right-1/2 dark:before:bg-dark-border">
          {content.milestones.map((m, i) => (
            <li
              key={m.year}
              data-reveal
              data-reveal-delay={i * 90}
              className={`relative ps-9 sm:w-1/2 sm:ps-0 ${
                i % 2 === 0 ? "sm:pe-12 sm:text-end" : "sm:ms-auto sm:ps-12"
              }`}
            >
              <span
                className={`absolute top-1.5 h-4 w-4 rounded-full border-4 border-light-bg bg-leaf ltr:left-0 rtl:right-0 dark:border-dark-bg ${
                  i % 2 === 0
                    ? "sm:ltr:left-auto sm:ltr:-right-2 sm:rtl:right-auto sm:rtl:-left-2"
                    : "sm:ltr:-left-2 sm:rtl:-right-2"
                }`}
                aria-hidden
              />
              <p className="text-caption font-bold uppercase tracking-[0.16em] text-leaf">
                {m.year}
              </p>
              <h3 className="mt-1.5 font-display text-h2 text-light-text dark:text-dark-text">
                {m.title}
              </h3>
              <p className="mt-2 text-[0.93rem] leading-relaxed text-light-muted dark:text-dark-muted">
                {m.text}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* Valeurs */}
      <section className="bg-light-surface-alt py-20 dark:bg-dark-surface-alt">
        <div className="container-content">
          <SectionHeading
            eyebrow={ui.about.valuesEyebrow}
            title={ui.about.valuesTitle}
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
        </div>
      </section>

      {/* Le bureau */}
      <section className="container-content py-20">
        <SectionHeading
          eyebrow={ui.about.boardEyebrow}
          title={ui.about.boardTitle}
          lead={ui.about.boardLead}
          align="center"
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {CONTACTS.map((c, i) => (
            <div
              key={c.phone}
              data-reveal
              data-reveal-delay={i * 90}
              className="lift rounded-lg border border-light-border bg-light-surface p-7 text-center shadow-card dark:border-dark-border dark:bg-dark-surface"
            >
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald font-display text-xl font-extrabold text-white">
                {c.name
                  .split(" ")
                  .filter((w) => w.length > 2)
                  .slice(-2)
                  .map((w) => w[0])
                  .join("")}
              </span>
              <h3 className="mt-5 font-display text-h3 text-light-text dark:text-dark-text">
                {c.name}
              </h3>
              <p className="mt-1 text-caption text-light-muted dark:text-dark-muted">
                {dict.contactRoles[c.role].title}
              </p>
              <a
                href={`tel:${c.phone}`}
                className="btn-ghost ltr-nums mt-5 w-full border-light-border tabular-nums dark:border-dark-border"
              >
                <Phone className="h-4 w-4" />
                {c.phoneDisplay}
              </a>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
