import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, HeartHandshake, User } from "lucide-react";
import {
  LOCALES,
  LOCALE_TAGS,
  formatDate,
  getDictionary,
  getProgram,
  isLocale,
  localePath,
  type Locale,
} from "@qardan/shared";
import { ARTICLE_METAS, getArticleMeta, getContent, getUi, sortedArticleMetas } from "@/content";
import { ArticleCard } from "@/components/cards";
import { PageHero } from "@/components/ui";
import { SITE_URL, pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return LOCALES.flatMap((locale) => ARTICLE_METAS.map((a) => ({ locale, slug: a.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const text = getContent(locale).articles[slug];
  if (!text) return {};

  return pageMetadata({
    locale,
    title: text.title,
    description: text.excerpt,
    path: `/actualites/${slug}`,
  });
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";

  const meta = getArticleMeta(slug);
  const content = getContent(locale);
  const text = content.articles[slug];
  if (!meta || !text) notFound();

  const dict = getDictionary(locale);
  const ui = getUi(locale);
  const program = getProgram(meta.program);
  const related = sortedArticleMetas()
    .filter((a) => a.slug !== slug && a.program === meta.program)
    .slice(0, 2);

  // JSON-LD article : permet l'affichage enrichi dans les résultats de recherche.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: text.title,
    description: text.excerpt,
    datePublished: meta.date,
    inLanguage: LOCALE_TAGS[locale],
    author: { "@type": "Organization", name: text.author },
    mainEntityOfPage: `${SITE_URL}/${locale}/actualites/${slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageHero
        locale={locale}
        homeLabel={ui.nav.home}
        breadcrumbLabel={ui.nav.breadcrumb}
        eyebrow={dict.programs[meta.program].fullName}
        title={text.title}
        accentColor={program?.color}
        breadcrumb={[
          { href: "/actualites", label: ui.nav.news },
          { href: `/actualites/${slug}`, label: `${text.title.slice(0, 32)}…` },
        ]}
      >
        <dl className="flex flex-wrap gap-x-7 gap-y-2 text-caption text-white/70">
          <div className="inline-flex items-center gap-1.5">
            <dt className="sr-only">{ui.news.publishedAria}</dt>
            <dd>
              <time dateTime={meta.date}>{formatDate(meta.date, locale)}</time>
            </dd>
          </div>
          <div className="inline-flex items-center gap-1.5">
            <dt className="sr-only">{ui.news.authorAria}</dt>
            <User className="h-3.5 w-3.5" aria-hidden />
            <dd>{text.author}</dd>
          </div>
          <div className="inline-flex items-center gap-1.5">
            <dt className="sr-only">{ui.news.readingAria}</dt>
            <Clock className="h-3.5 w-3.5" aria-hidden />
            <dd>
              {meta.readingMinutes} {ui.common.minRead}
            </dd>
          </div>
        </dl>
      </PageHero>

      <article className="container-content py-16">
        <div className="grid gap-12 lg:grid-cols-[1fr_18rem] lg:items-start">
          <div className="prose-content max-w-prose">
            {text.body.map((block) =>
              block.startsWith("## ") ? (
                <h2 key={block}>{block.replace("## ", "")}</h2>
              ) : (
                <p key={block.slice(0, 40)}>{block}</p>
              ),
            )}
          </div>

          {/* Encart d'appel au don, contextuel au programme de l'article. */}
          <aside className="lg:sticky lg:top-24">
            <div
              className="overflow-hidden rounded-lg p-7 text-white"
              style={{
                backgroundImage: `linear-gradient(135deg, ${program?.color ?? "#0F5C2E"} 0%, #052316 140%)`,
              }}
            >
              <p className="text-caption uppercase tracking-[0.16em] text-white/60">
                {ui.news.supportProgram}
              </p>
              <p className="mt-3 font-display text-h2">{dict.programs[meta.program].name}</p>
              <p className="mt-3 text-[0.9rem] leading-relaxed text-white/80">
                {dict.programs[meta.program].tagline} {ui.news.supportText}
              </p>
              <Link
                href={localePath(locale, `/don?programme=${meta.program}`)}
                className="btn-accent mt-6 w-full text-sm"
              >
                <HeartHandshake className="h-4 w-4" />
                {ui.news.donate}
              </Link>
            </div>
          </aside>
        </div>
      </article>

      {related.length > 0 && (
        <section className="bg-light-surface-alt py-16 dark:bg-dark-surface-alt">
          <div className="container-content">
            <h2 className="mb-9 font-display text-h1 text-light-text dark:text-dark-text">
              {ui.news.alsoRead}
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {related.map((a, i) => (
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
      )}
    </>
  );
}
