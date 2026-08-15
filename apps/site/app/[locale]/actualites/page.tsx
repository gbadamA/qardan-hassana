import Link from "next/link";
import {
  PROGRAMS,
  getDictionary,
  isLocale,
  isProgramSlug,
  localePath,
  type Locale,
} from "@qardan/shared";
import { getContent, getUi, sortedArticleMetas } from "@/content";
import { ArticleCard } from "@/components/cards";
import { PageHero } from "@/components/ui";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const ui = getUi(locale);
  return pageMetadata({
    locale,
    title: ui.nav.news,
    description: ui.news.metaDescription,
    path: "/actualites",
  });
}

/**
 * Le filtre par programme passe par l'URL (`?programme=social`) plutôt que par un état
 * React : chaque filtre est ainsi une page partageable, indexable, et fonctionne sans
 * JavaScript.
 */
export default async function NewsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ programme?: string }>;
}) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const { programme } = await searchParams;

  const dict = getDictionary(locale);
  const ui = getUi(locale);
  const content = getContent(locale);

  const activeSlug = programme && isProgramSlug(programme) ? programme : null;
  const all = sortedArticleMetas();
  const articles = activeSlug ? all.filter((a) => a.program === activeSlug) : all;
  const [featured, ...rest] = articles;
  const activeColor = activeSlug ? PROGRAMS.find((p) => p.slug === activeSlug)?.color : undefined;

  return (
    <>
      <PageHero
        locale={locale}
        homeLabel={ui.nav.home}
        breadcrumbLabel={ui.nav.breadcrumb}
        eyebrow={ui.news.heroEyebrow}
        title={
          activeSlug
            ? `${ui.news.heroTitlePrefix} ${dict.programs[activeSlug].name}`
            : ui.news.heroTitle
        }
        lead={ui.news.heroLead}
        accentColor={activeColor}
        breadcrumb={[{ href: "/actualites", label: ui.nav.news }]}
      />

      <section className="container-content py-14">
        {/* Filtres */}
        <nav aria-label={ui.news.filterLabel} className="mb-12 flex flex-wrap gap-2">
          <Link
            href={localePath(locale, "/actualites")}
            aria-current={!activeSlug ? "page" : undefined}
            className={`rounded-full border px-4 py-2 text-[0.88rem] font-semibold transition-colors ${
              !activeSlug
                ? "border-primary bg-primary text-white"
                : "border-light-border text-light-muted hover:border-leaf hover:text-primary dark:border-dark-border dark:text-dark-muted"
            }`}
          >
            {ui.news.all} <span className="ltr-nums">({all.length})</span>
          </Link>
          {PROGRAMS.map((p) => {
            const count = all.filter((a) => a.program === p.slug).length;
            const isActive = activeSlug === p.slug;
            return (
              <Link
                key={p.slug}
                href={localePath(locale, `/actualites?programme=${p.slug}`)}
                aria-current={isActive ? "page" : undefined}
                className="rounded-full border px-4 py-2 text-[0.88rem] font-semibold transition-colors"
                style={
                  isActive
                    ? { backgroundColor: p.color, borderColor: p.color, color: "#fff" }
                    : { borderColor: `${p.color}55`, color: p.color }
                }
              >
                {dict.programs[p.slug].name} <span className="ltr-nums">({count})</span>
              </Link>
            );
          })}
        </nav>

        {articles.length === 0 ? (
          <p className="rounded-lg border border-light-border bg-light-surface p-10 text-center text-light-muted dark:border-dark-border dark:bg-dark-surface dark:text-dark-muted">
            {ui.news.empty}
          </p>
        ) : (
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
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {rest.map((a, i) => (
                <ArticleCard
                  key={a.slug}
                  meta={a}
                  text={content.articles[a.slug]!}
                  locale={locale}
                  dict={dict}
                  ui={ui}
                  delay={i * 70}
                />
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
