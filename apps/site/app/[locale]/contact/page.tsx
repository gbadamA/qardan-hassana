import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { CONTACTS, ORG, getDictionary, isLocale, type Locale } from "@qardan/shared";
import { getUi } from "@/content";
import { ContactForm } from "@/components/forms/ContactForm";
import { PageHero } from "@/components/ui";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const ui = getUi(locale);
  return pageMetadata({
    locale,
    title: ui.nav.contact,
    description: ui.contact.metaDescription,
    path: "/contact",
  });
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
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
        eyebrow={ui.contact.heroEyebrow}
        title={ui.contact.heroTitle}
        lead={ui.contact.heroLead}
        breadcrumb={[{ href: "/contact", label: ui.nav.contact }]}
      />

      <section className="container-content py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:items-start">
          {/* Coordonnées */}
          <div className="space-y-5">
            {CONTACTS.map((c, i) => (
              <div
                key={c.phone}
                data-reveal
                data-reveal-delay={i * 80}
                className="lift rounded-lg border border-light-border bg-light-surface p-6 shadow-card dark:border-dark-border dark:bg-dark-surface"
              >
                <p className="text-caption font-bold uppercase tracking-[0.14em] text-leaf">
                  {dict.contactRoles[c.role].short}
                </p>
                <h2 className="mt-1.5 font-display text-h3 text-light-text dark:text-dark-text">
                  {c.name}
                </h2>
                <p className="mt-1 text-caption text-light-muted dark:text-dark-muted">
                  {dict.contactRoles[c.role].title}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <a
                    href={`tel:${c.phone}`}
                    className="btn-ghost ltr-nums px-4 py-2 text-sm tabular-nums"
                  >
                    <Phone className="h-4 w-4" />
                    {c.phoneDisplay}
                  </a>
                  <a
                    href={`https://wa.me/${c.phone.replace("+", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost px-4 py-2 text-sm"
                  >
                    <MessageCircle className="h-4 w-4" />
                    {ui.common.whatsapp}
                  </a>
                </div>
              </div>
            ))}

            <div
              data-reveal
              className="rounded-lg border border-light-border bg-light-surface p-6 shadow-card dark:border-dark-border dark:bg-dark-surface"
            >
              <h2 className="font-display text-h3 text-light-text dark:text-dark-text">
                {ui.contact.hqTitle}
              </h2>
              <p className="mt-3 flex items-start gap-2.5 text-[0.93rem] text-light-muted dark:text-dark-muted">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-leaf" aria-hidden />
                {dict.org.address}
              </p>
              <a
                href={`mailto:${ORG.email}`}
                className="mt-2.5 flex items-start gap-2.5 text-[0.93rem] text-light-muted transition-colors hover:text-primary dark:text-dark-muted dark:hover:text-leaf"
              >
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-leaf" aria-hidden />
                <span className="ltr-nums">{ORG.email}</span>
              </a>
              {/*
                Carte : volontairement pas d'iframe Google Maps tant que l'adresse exacte du
                siège n'est pas confirmée — un plan qui pointe au mauvais endroit est pire
                que pas de plan. À remplacer par une carte dès l'adresse obtenue.
              */}
              <div className="pattern-dots mt-5 flex h-40 items-center justify-center rounded-md border border-dashed border-light-border p-4 text-center text-caption text-light-muted dark:border-dark-border dark:text-dark-muted">
                {ui.contact.mapPending}
              </div>
            </div>
          </div>

          {/* Formulaire */}
          <div data-reveal data-reveal-delay={120}>
            <ContactForm dict={dict} ui={ui} />
          </div>
        </div>
      </section>
    </>
  );
}
