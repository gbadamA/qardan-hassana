import type { MetadataRoute } from "next";
import { LOCALES, PROGRAMS } from "@qardan/shared";
import { ARTICLE_METAS } from "@/content";
import { SITE_URL } from "@/lib/seo";

/**
 * Sitemap bilingue — visibilité locale CI/Abidjan (exigence SEO du §6).
 *
 * Chaque URL déclare ses `alternates.languages` : c'est ce qui indique à Google que
 * `/fr/don` et `/ar/don` sont deux versions d'une même page, et non du contenu dupliqué.
 * Un site bilingue sans hreflang se référence MOINS bien qu'un site monolingue.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPaths = [
    { path: "", priority: 1 },
    { path: "/don", priority: 0.95 },
    { path: "/programmes", priority: 0.9 },
    { path: "/a-propos", priority: 0.8 },
    { path: "/actualites", priority: 0.8 },
    { path: "/transparence", priority: 0.8 },
    { path: "/benevole", priority: 0.75 },
    { path: "/evenements", priority: 0.7 },
    { path: "/contact", priority: 0.7 },
    { path: "/application", priority: 0.5 },
  ];

  const languagesFor = (path: string) => ({
    fr: `${SITE_URL}/fr${path}`,
    ar: `${SITE_URL}/ar${path}`,
  });

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    for (const p of staticPaths) {
      entries.push({
        url: `${SITE_URL}/${locale}${p.path}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: p.priority,
        alternates: { languages: languagesFor(p.path) },
      });
    }

    for (const program of PROGRAMS) {
      const path = `/programmes/${program.slug}`;
      entries.push({
        url: `${SITE_URL}/${locale}${path}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.85,
        alternates: { languages: languagesFor(path) },
      });
    }

    for (const article of ARTICLE_METAS) {
      const path = `/actualites/${article.slug}`;
      entries.push({
        url: `${SITE_URL}/${locale}${path}`,
        lastModified: new Date(article.date),
        changeFrequency: "yearly",
        priority: 0.6,
        alternates: { languages: languagesFor(path) },
      });
    }
  }

  return entries;
}
