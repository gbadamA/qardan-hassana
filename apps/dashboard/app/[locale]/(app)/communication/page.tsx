"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { AlertTriangle, Eye, EyeOff, Plus } from "lucide-react";
import {
  DEFAULT_LOCALE,
  PROGRAMS,
  formatDate,
  getDictionary,
  isLocale,
  type Locale,
  type ProgramSlug,
} from "@qardan/shared";
import { getSupabase, type Tables } from "@qardan/supabase";
import { getDashUi } from "@/content";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@/lib/data";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  ProgramTag,
  Section,
  StatusPill,
  TableWrap,
} from "@/components/ui";

type News = Tables<"news">;

/** Titre → identifiant d'URL. Les diacritiques sont dépliés puis retirés. */
function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export default function CommunicationPage() {
  const params = useParams<{ locale: string }>();
  const locale: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const ui = getDashUi(locale);
  const dict = getDictionary(locale);
  const { can, profile } = useAuth();
  const [showForm, setShowForm] = useState(false);

  const news = useQuery<News[]>(
    async (sb) => sb.from("news").select("*").order("created_at", { ascending: false }),
    [],
  );

  async function togglePublish(item: News) {
    const next = item.status === "publie" ? "brouillon" : "publie";
    await getSupabase()
      .from("news")
      .update({
        status: next,
        published_at: next === "publie" ? new Date().toISOString() : null,
      })
      .eq("id", item.id);

    await getSupabase().from("activity_log").insert({
      actor_id: profile?.id ?? null,
      action: next === "publie" ? "news.publish" : "news.unpublish",
      entity: "news",
      entity_id: item.id,
      details: { slug: item.slug },
    });

    void news.reload();
  }

  return (
    <>
      <PageHeader title={ui.communication.title} lead={ui.communication.lead}>
        {can.writeOps && (
          <button type="button" onClick={() => setShowForm((v) => !v)} className="btn-primary btn-sm">
            <Plus className="h-4 w-4" />
            {ui.communication.add}
          </button>
        )}
      </PageHeader>

      {showForm && can.writeOps && (
        <NewsForm
          ui={ui}
          dict={dict}
          createdBy={profile?.id ?? null}
          authorFallback={profile?.full_name ?? ""}
          onDone={() => {
            setShowForm(false);
            void news.reload();
          }}
        />
      )}

      <Section title={ui.communication.title}>
        {news.loading && <LoadingState message={ui.common.loading} />}
        {news.error && <ErrorState message={news.error} />}
        {!news.loading && !news.error && (news.data?.length ?? 0) === 0 && (
          <EmptyState message={ui.common.empty} />
        )}
        {(news.data?.length ?? 0) > 0 && (
          <TableWrap>
            <thead>
              <tr>
                <th className="table-head">{ui.communication.titleFr}</th>
                <th className="table-head">{ui.common.program}</th>
                <th className="table-head">{ui.common.date}</th>
                <th className="table-head">{ui.common.status}</th>
                <th className="table-head">{ui.common.actions}</th>
              </tr>
            </thead>
            <tbody>
              {news.data!.map((n) => (
                <tr key={n.id}>
                  <td className="table-cell">
                    <span className="font-medium">{n.title_fr}</span>
                    <span className="ltr-nums mt-0.5 block font-mono text-caption text-light-muted dark:text-dark-muted">
                      {n.slug}
                    </span>
                    {/* Une version arabe manquante n'est pas une erreur : le site retombe
                        sur le français. Mais le rédacteur doit le savoir. */}
                    {!n.title_ar && (
                      <span
                        title={ui.communication.missingArabicHint}
                        className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-warning/15 px-2 py-0.5 text-caption font-semibold text-warning"
                      >
                        <AlertTriangle className="h-3 w-3" aria-hidden />
                        {ui.communication.missingArabic}
                      </span>
                    )}
                  </td>
                  <td className="table-cell">
                    <ProgramTag
                      program={n.program as ProgramSlug}
                      dict={dict}
                      fallback={ui.common.general}
                    />
                  </td>
                  <td className="table-cell whitespace-nowrap">
                    {formatDate(n.published_at ?? n.created_at, locale, {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="table-cell">
                    <StatusPill
                      label={
                        n.status === "publie"
                          ? ui.communication.published
                          : n.status === "archive"
                            ? ui.communication.archived
                            : ui.communication.draft
                      }
                      tone={n.status === "publie" ? "ok" : "muted"}
                    />
                  </td>
                  <td className="table-cell">
                    {can.writeOps && (
                      <button
                        type="button"
                        onClick={() => togglePublish(n)}
                        className={n.status === "publie" ? "btn-ghost btn-sm" : "btn-primary btn-sm"}
                      >
                        {n.status === "publie" ? (
                          <>
                            <EyeOff className="h-3.5 w-3.5" />
                            {ui.communication.unpublish}
                          </>
                        ) : (
                          <>
                            <Eye className="h-3.5 w-3.5" />
                            {ui.communication.publish}
                          </>
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        )}
      </Section>
    </>
  );
}

function NewsForm({
  ui,
  dict,
  createdBy,
  authorFallback,
  onDone,
}: {
  ui: ReturnType<typeof getDashUi>;
  dict: ReturnType<typeof getDictionary>;
  createdBy: string | null;
  authorFallback: string;
  onDone: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const body = String(fd.get("body_fr"));

    const { error: insertError } = await getSupabase().from("news").insert({
      slug: slug || slugify(title),
      program: String(fd.get("program")) as ProgramSlug,
      title_fr: title,
      title_ar: String(fd.get("title_ar") ?? "") || null,
      excerpt_fr: String(fd.get("excerpt_fr")),
      excerpt_ar: String(fd.get("excerpt_ar") ?? "") || null,
      body_fr: body,
      body_ar: String(fd.get("body_ar") ?? "") || null,
      author: String(fd.get("author")) || authorFallback,
      // Estimation de lecture : ~200 mots/minute, minimum une minute.
      reading_minutes: Math.max(1, Math.round(body.split(/\s+/).length / 200)),
      status: "brouillon",
      created_by: createdBy,
    });

    setBusy(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    onDone();
  }

  return (
    <Section title={ui.communication.add}>
      <form onSubmit={submit} className="grid gap-4 p-5 sm:grid-cols-2">
        <div>
          <label htmlFor="title_fr" className="field-label">
            {ui.communication.titleFr}
          </label>
          <input
            id="title_fr"
            name="title_fr"
            required
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
            className="field-input"
          />
        </div>

        <div>
          <label htmlFor="title_ar" className="field-label">
            {ui.communication.titleAr}
          </label>
          <input id="title_ar" name="title_ar" dir="rtl" className="field-input" />
        </div>

        <div>
          <label htmlFor="slug" className="field-label">
            {ui.communication.slug}
          </label>
          <input
            id="slug"
            name="slug"
            dir="ltr"
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(slugify(e.target.value));
            }}
            className="field-input font-mono text-caption"
          />
          <p className="mt-1.5 text-caption text-light-muted dark:text-dark-muted">
            {ui.communication.slugHint}
          </p>
        </div>

        <div>
          <label htmlFor="program" className="field-label">
            {ui.common.program}
          </label>
          <select id="program" name="program" required className="field-input">
            {PROGRAMS.map((p) => (
              <option key={p.slug} value={p.slug}>
                {dict.programs[p.slug].name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="excerpt_fr" className="field-label">
            {ui.communication.excerptFr}
          </label>
          <textarea id="excerpt_fr" name="excerpt_fr" rows={2} required className="field-input" />
        </div>

        <div>
          <label htmlFor="excerpt_ar" className="field-label">
            {ui.communication.excerptAr}
          </label>
          <textarea id="excerpt_ar" name="excerpt_ar" dir="rtl" rows={2} className="field-input" />
        </div>

        <div>
          <label htmlFor="body_fr" className="field-label">
            {ui.communication.bodyFr}
          </label>
          <textarea id="body_fr" name="body_fr" rows={8} required className="field-input" />
          <p className="mt-1.5 text-caption text-light-muted dark:text-dark-muted">
            {ui.communication.bodyHint}
          </p>
        </div>

        <div>
          <label htmlFor="body_ar" className="field-label">
            {ui.communication.bodyAr}
          </label>
          <textarea id="body_ar" name="body_ar" dir="rtl" rows={8} className="field-input" />
        </div>

        <div>
          <label htmlFor="author" className="field-label">
            {ui.communication.author}
          </label>
          <input id="author" name="author" defaultValue={authorFallback} className="field-input" />
        </div>

        {error && (
          <p role="alert" className="text-caption font-medium text-danger sm:col-span-2">
            {error}
          </p>
        )}

        <div className="sm:col-span-2">
          <button type="submit" disabled={busy} className="btn-primary">
            {busy ? ui.common.saving : ui.common.save}
          </button>
        </div>
      </form>
    </Section>
  );
}
