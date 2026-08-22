import { isLocale, type Locale } from "@qardan/shared";
import { getUi } from "@/content";
import { CampaignTracker } from "@/components/CampaignTracker";
import { PageHero } from "@/components/ui";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const ui = getUi(locale);
  return pageMetadata({
    locale,
    title: ui.nav.campaigns,
    description: ui.campaigns.heroLead,
    path: "/collectes",
  });
}

/**
 * Toutes les collectes, tous programmes confondus.
 *
 * ⚠️ La page est STATIQUE, son contenu ne l'est pas : `CampaignTracker` va chercher les
 * montants à l'affichage. Pré-rendre les totaux au build ferait afficher, pendant des
 * jours, le compteur du dernier déploiement — un donateur y chercherait son propre don
 * en vain. Voir la note en tête du composant.
 */
export default async function CampaignsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const ui = getUi(locale);

  return (
    <>
      <PageHero
        locale={locale}
        homeLabel={ui.nav.home}
        breadcrumbLabel={ui.nav.breadcrumb}
        eyebrow={ui.campaigns.eyebrow}
        title={ui.campaigns.heroTitle}
        lead={ui.campaigns.heroLead}
        breadcrumb={[{ href: "/collectes", label: ui.nav.campaigns }]}
      />

      <div className="pt-16">
        <CampaignTracker
          locale={locale}
          ui={ui}
          showHeading={false}
          emptyMessage={ui.campaigns.empty}
        />
      </div>
    </>
  );
}
