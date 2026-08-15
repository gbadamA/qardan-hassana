"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Download, Eye, EyeOff, FileText, Plus, Trash2 } from "lucide-react";
import {
  DEFAULT_LOCALE,
  formatDate,
  formatNumber,
  getDictionary,
  isLocale,
  type Locale,
} from "@qardan/shared";
import { getSupabase, type DocumentKind, type Tables } from "@qardan/supabase";
import { getDashUi } from "@/content";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@/lib/data";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  Section,
  StatusPill,
  TableWrap,
} from "@/components/ui";

type Doc = Tables<"documents">;

const KINDS: DocumentKind[] = [
  "statuts",
  "pv_ca",
  "rapport_activite",
  "rapport_financier",
  "justificatif",
  "autre",
];

/** Ko / Mo — un « 2411724 octets » ne dit rien à personne. */
function humanSize(bytes: number | null, locale: Locale): string {
  if (bytes === null) return "—";
  if (bytes < 1024) return `${formatNumber(bytes, locale)} o`;
  if (bytes < 1024 * 1024) return `${formatNumber(Math.round(bytes / 1024), locale)} Ko`;
  return `${formatNumber(Math.round((bytes / (1024 * 1024)) * 10) / 10, locale)} Mo`;
}

export default function DocumentsPage() {
  const params = useParams<{ locale: string }>();
  const locale: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const ui = getDashUi(locale);
  const dict = getDictionary(locale);
  const { can, profile } = useAuth();

  const [showForm, setShowForm] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  /**
   * Qui peut déposer, et quoi.
   * ⚠️ Le Trésorier a le droit de déposer ses justificatifs comptables (policy
   * `documents_write`), mais RIEN d'autre. Ne pas lui montrer le formulaire du tout
   * serait un écart entre la base et l'écran : il aurait un droit qu'aucun bouton
   * n'expose. On le lui montre donc, restreint à ce seul type.
   */
  const canUpload = can.writeOps || can.writeFinance;
  const restrictedToProof = !can.writeOps && can.writeFinance;

  const docs = useQuery<Doc[]>(
    async (sb) =>
      sb.from("documents").select("*").order("year", { ascending: false, nullsFirst: false }),
    [],
  );

  /**
   * Téléchargement par URL SIGNÉE, jamais par URL publique.
   * Le bucket est privé : une URL publique n'existe pas, et c'est voulu — un PV de
   * Conseil d'Administration ne doit pas rester atteignable après diffusion du lien.
   */
  async function download(doc: Doc) {
    setBusyId(doc.id);
    setActionError(null);

    const { data, error } = await getSupabase()
      .storage.from("documents")
      .createSignedUrl(doc.storage_path, 3600);

    setBusyId(null);
    if (error || !data) {
      setActionError(error?.message ?? ui.common.error);
      return;
    }

    // L'ancre doit être DANS le DOM avant `click()` : sans ça, certains navigateurs
    // ignorent le téléchargement en silence (leçon mosquee-fitia).
    const a = document.createElement("a");
    a.href = data.signedUrl;
    a.download = doc.file_name;
    a.target = "_blank";
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  async function togglePublic(doc: Doc) {
    setBusyId(doc.id);
    await getSupabase().from("documents").update({ is_public: !doc.is_public }).eq("id", doc.id);
    await getSupabase().from("activity_log").insert({
      actor_id: profile?.id ?? null,
      action: doc.is_public ? "document.unpublish" : "document.publish",
      entity: "documents",
      entity_id: doc.id,
      details: { title: doc.title_fr },
    });
    setBusyId(null);
    void docs.reload();
  }

  async function remove(doc: Doc) {
    if (!window.confirm(ui.documents.confirmDelete)) return;
    setBusyId(doc.id);
    setActionError(null);

    // Le fichier d'abord : si la ligne partait en premier et que la suppression du
    // fichier échouait, on garderait un objet orphelin que plus rien ne référence.
    const { error: storageError } = await getSupabase()
      .storage.from("documents")
      .remove([doc.storage_path]);

    if (storageError) {
      setBusyId(null);
      setActionError(storageError.message);
      return;
    }

    await getSupabase().from("documents").delete().eq("id", doc.id);
    setBusyId(null);
    void docs.reload();
  }

  return (
    <>
      <PageHeader title={ui.documents.title} lead={ui.documents.lead}>
        {canUpload && (
          <button type="button" onClick={() => setShowForm((v) => !v)} className="btn-primary btn-sm">
            <Plus className="h-4 w-4" />
            {ui.documents.add}
          </button>
        )}
      </PageHeader>

      {showForm && canUpload && (
        <UploadForm
          ui={ui}
          uploadedBy={profile?.id ?? null}
          restrictedToProof={restrictedToProof}
          onDone={() => {
            setShowForm(false);
            void docs.reload();
          }}
        />
      )}

      {actionError && <ErrorState message={actionError} />}

      <Section title={ui.documents.title} lead={ui.documents.linkExpires}>
        {docs.loading && <LoadingState message={ui.common.loading} />}
        {docs.error && <ErrorState message={docs.error} />}
        {!docs.loading && !docs.error && (docs.data?.length ?? 0) === 0 && (
          <EmptyState message={ui.documents.empty} />
        )}
        {(docs.data?.length ?? 0) > 0 && (
          <TableWrap>
            <thead>
              <tr>
                <th className="table-head">{ui.documents.titleFr}</th>
                <th className="table-head">{ui.documents.kind}</th>
                <th className="table-head">{ui.documents.year}</th>
                <th className="table-head">{ui.common.status}</th>
                <th className="table-head">{ui.common.actions}</th>
              </tr>
            </thead>
            <tbody>
              {docs.data!.map((d) => (
                <tr key={d.id}>
                  <td className="table-cell">
                    <span className="inline-flex items-center gap-2 font-medium">
                      <FileText className="h-4 w-4 shrink-0 text-leaf" aria-hidden />
                      {locale === "ar" && d.title_ar ? d.title_ar : d.title_fr}
                    </span>
                    <span className="ltr-nums mt-0.5 block text-caption text-light-muted dark:text-dark-muted">
                      {d.file_name} · {humanSize(d.file_size, locale)}
                    </span>
                  </td>
                  <td className="table-cell">{ui.documents.kinds[d.kind]}</td>
                  <td className="table-cell ltr-nums">
                    {d.year ? formatNumber(d.year, locale) : "—"}
                  </td>
                  <td className="table-cell">
                    <StatusPill
                      label={d.is_public ? ui.documents.published : ui.documents.internal}
                      tone={d.is_public ? "ok" : "muted"}
                    />
                    <span className="mt-1 block text-caption text-light-muted dark:text-dark-muted">
                      {formatDate(d.created_at, locale, { day: "numeric", month: "short" })}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => download(d)}
                        disabled={busyId === d.id}
                        className="btn-ghost btn-sm"
                      >
                        <Download className="h-3.5 w-3.5" />
                        {busyId === d.id ? ui.documents.downloading : ui.documents.download}
                      </button>

                      {can.writeOps && (
                        <button
                          type="button"
                          onClick={() => togglePublic(d)}
                          disabled={busyId === d.id}
                          title={ui.documents.isPublicHint}
                          className="btn-ghost btn-sm"
                        >
                          {d.is_public ? (
                            <EyeOff className="h-3.5 w-3.5" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" />
                          )}
                        </button>
                      )}

                      {can.admin && (
                        <button
                          type="button"
                          onClick={() => remove(d)}
                          disabled={busyId === d.id}
                          className="btn-danger btn-sm"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        )}
      </Section>

      <p className="text-caption text-light-muted dark:text-dark-muted">
        {dict.org.legalShort}
      </p>
    </>
  );
}

function UploadForm({
  ui,
  uploadedBy,
  restrictedToProof,
  onDone,
}: {
  ui: ReturnType<typeof getDashUi>;
  uploadedBy: string | null;
  /** Trésorier : justificatifs comptables uniquement. */
  restrictedToProof: boolean;
  onDone: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const file = fd.get("file") as File | null;

    if (!file || file.size === 0) {
      setError(ui.common.required);
      return;
    }

    setBusy(true);
    setError(null);

    const supabase = getSupabase();

    /**
     * Chemin de stockage : `kind/année/horodatage-nom`. L'horodatage évite qu'un
     * second dépôt du même fichier écrase le premier — un PV corrigé ne doit pas
     * faire disparaître la version que le Conseil a votée.
     */
    const kind = String(fd.get("kind"));
    const year = String(fd.get("year") || new Date().getFullYear());
    const safeName = file.name.replace(/[^\w.\-]+/g, "_");
    const storagePath = `${kind}/${year}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(storagePath, file, { contentType: file.type || undefined, upsert: false });

    if (uploadError) {
      setBusy(false);
      setError(uploadError.message);
      return;
    }

    const { error: insertError } = await supabase.from("documents").insert({
      title_fr: String(fd.get("title_fr")),
      title_ar: String(fd.get("title_ar") ?? "") || null,
      kind: kind as DocumentKind,
      year: Number(year),
      description: String(fd.get("description") ?? "") || null,
      storage_path: storagePath,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type || null,
      is_public: fd.get("is_public") === "on",
      uploaded_by: uploadedBy,
    });

    if (insertError) {
      // La ligne n'a pas pu être créée : on retire le fichier, sinon il reste dans le
      // bucket sans que rien ne le référence — invisible et impossible à nettoyer.
      await supabase.storage.from("documents").remove([storagePath]);
      setBusy(false);
      setError(insertError.message);
      return;
    }

    setBusy(false);
    form.reset();
    onDone();
  }

  return (
    <Section title={ui.documents.add}>
      <form onSubmit={submit} className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="sm:col-span-2 lg:col-span-3">
          <label htmlFor="file" className="field-label">
            {ui.documents.file}
          </label>
          <input
            id="file"
            name="file"
            type="file"
            accept="application/pdf,image/jpeg,image/png,image/webp"
            required
            className="field-input file:me-3 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-1.5 file:text-caption file:font-semibold file:text-white"
          />
          <p className="mt-1.5 text-caption text-light-muted dark:text-dark-muted">
            {ui.documents.fileHint}
          </p>
        </div>

        <div>
          <label htmlFor="title_fr" className="field-label">
            {ui.documents.titleFr}
          </label>
          <input id="title_fr" name="title_fr" required className="field-input" />
        </div>

        <div>
          <label htmlFor="title_ar" className="field-label">
            {ui.documents.titleAr}
          </label>
          <input id="title_ar" name="title_ar" dir="rtl" className="field-input" />
        </div>

        <div>
          <label htmlFor="kind" className="field-label">
            {ui.documents.kind}
          </label>
          <select
            id="kind"
            name="kind"
            defaultValue={restrictedToProof ? "justificatif" : "autre"}
            disabled={restrictedToProof}
            className="field-input"
          >
            {(restrictedToProof ? (["justificatif"] as DocumentKind[]) : KINDS).map((k) => (
              <option key={k} value={k}>
                {ui.documents.kinds[k]}
              </option>
            ))}
          </select>
          {restrictedToProof && <input type="hidden" name="kind" value="justificatif" />}
        </div>

        <div>
          <label htmlFor="year" className="field-label">
            {ui.documents.year}
          </label>
          <input
            id="year"
            name="year"
            type="number"
            dir="ltr"
            defaultValue={new Date().getFullYear()}
            className="field-input"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="description" className="field-label">
            {ui.documents.description}
          </label>
          <input id="description" name="description" className="field-input" />
        </div>

        {!restrictedToProof && (
        <label className="flex items-start gap-2 text-caption text-light-text sm:col-span-2 lg:col-span-3 dark:text-dark-text">
          <input type="checkbox" name="is_public" className="mt-0.5 h-4 w-4 accent-leaf" />
          <span>
            {ui.documents.isPublic}
            <span className="mt-0.5 block text-light-muted dark:text-dark-muted">
              {ui.documents.isPublicHint}
            </span>
          </span>
        </label>
        )}

        {error && (
          <p role="alert" className="text-caption font-medium text-danger sm:col-span-2 lg:col-span-3">
            {error}
          </p>
        )}

        <div className="sm:col-span-2 lg:col-span-3">
          <button type="submit" disabled={busy} className="btn-primary">
            {busy ? ui.documents.uploading : ui.common.save}
          </button>
        </div>
      </form>
    </Section>
  );
}
