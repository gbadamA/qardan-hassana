"use client";

import { useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import {
  formatDate,
  formatMoney,
  type Dictionary,
  type Locale,
  type ProgramSlug,
} from "@qardan/shared";
import { getSupabase, type Tables } from "@qardan/supabase";
import type { DashUi } from "@/content";
import { useAuth } from "@/lib/auth";
import { ProgramTag, StatusPill } from "./ui";

type Donation = Tables<"donations">;

/**
 * Une ligne de don, avec sa validation en place.
 *
 * Pourquoi la validation ici et pas dans un écran dédié : le geste du Trésorier est
 * « je regarde mon relevé Mobile Money, je retrouve la ligne, je valide ». L'obliger à
 * ouvrir une fiche pour chaque don rallongerait un travail qui se fait par lots.
 *
 * ⚠️ Le n° de transaction est saisi AVANT la validation, pas après : c'est lui la preuve.
 * Valider sans référence de transaction est possible (versement en espèces au siège),
 * mais ce doit être un choix conscient, pas un oubli.
 */
export function DonationRow({
  donation,
  locale,
  dict,
  ui,
  canWrite,
  onChanged,
  showStatus = false,
}: {
  donation: Donation;
  locale: Locale;
  dict: Dictionary;
  ui: DashUi;
  canWrite: boolean;
  onChanged: () => void;
  showStatus?: boolean;
}) {
  const { profile } = useAuth();
  const [busy, setBusy] = useState<"validate" | "reject" | null>(null);
  const [txRef, setTxRef] = useState(donation.transaction_ref ?? "");
  const [error, setError] = useState<string | null>(null);

  const pending = donation.status === "en_attente";

  async function decide(status: "valide" | "rejete") {
    setBusy(status === "valide" ? "validate" : "reject");
    setError(null);

    const supabase = getSupabase();
    const { error: updateError } = await supabase
      .from("donations")
      .update({
        status,
        transaction_ref: txRef.trim() || null,
        validated_by: profile?.id ?? null,
        validated_at: new Date().toISOString(),
      })
      .eq("id", donation.id);

    if (updateError) {
      setBusy(null);
      setError(updateError.message);
      return;
    }

    // Journal d'audit : qui a validé quoi, et quand. Écriture « au mieux » — si elle
    // échoue, la validation reste acquise, on ne va pas annuler une décision métier
    // parce qu'une ligne de log n'est pas passée.
    await supabase.from("activity_log").insert({
      actor_id: profile?.id ?? null,
      action: status === "valide" ? "donation.validate" : "donation.reject",
      entity: "donations",
      entity_id: donation.id,
      details: { reference: donation.reference, amount_fcfa: donation.amount_fcfa },
    });

    setBusy(null);
    onChanged();
  }

  return (
    <tr>
      <td className="table-cell">
        <span className="ltr-nums font-mono text-caption font-bold">{donation.reference}</span>
        <span className="mt-0.5 block text-caption text-light-muted dark:text-dark-muted">
          {formatDate(donation.created_at, locale, { day: "numeric", month: "short" })}
        </span>
      </td>

      <td className="table-cell">
        {donation.anonymous ? (
          <span className="italic text-light-muted dark:text-dark-muted">
            {ui.donations.anonymous}
          </span>
        ) : (
          <span className="font-medium">{donation.donor_name}</span>
        )}
        <span className="ltr-nums mt-0.5 block text-caption text-light-muted dark:text-dark-muted">
          {donation.donor_phone}
        </span>
      </td>

      <td className="table-cell ltr-nums font-semibold">
        {formatMoney(donation.amount_fcfa, locale)}
      </td>

      <td className="table-cell">
        <ProgramTag
          program={donation.program as ProgramSlug | null}
          dict={dict}
          fallback={ui.common.general}
        />
      </td>

      <td className="table-cell">
        {dict.paymentMethods[donation.method].label}
        {showStatus && (
          <span className="mt-1 block">
            <StatusPill
              label={
                donation.status === "valide"
                  ? ui.donations.validated
                  : donation.status === "rejete"
                    ? ui.donations.rejected
                    : ui.donations.awaiting
              }
              tone={
                donation.status === "valide"
                  ? "ok"
                  : donation.status === "rejete"
                    ? "danger"
                    : "pending"
              }
            />
          </span>
        )}
      </td>

      <td className="table-cell">
        {pending && canWrite ? (
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              dir="ltr"
              value={txRef}
              onChange={(e) => setTxRef(e.target.value)}
              placeholder={ui.donations.transactionRef}
              title={ui.donations.transactionRefHint}
              aria-label={ui.donations.transactionRef}
              className="field-input w-40 py-1.5 text-caption"
            />
            <button
              type="button"
              onClick={() => decide("valide")}
              disabled={busy !== null}
              className="btn-primary btn-sm"
            >
              {busy === "validate" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
              {ui.donations.validate}
            </button>
            <button
              type="button"
              onClick={() => decide("rejete")}
              disabled={busy !== null}
              className="btn-danger btn-sm"
            >
              {busy === "reject" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <X className="h-3.5 w-3.5" />
              )}
              {ui.donations.reject}
            </button>
            {error && (
              <span role="alert" className="text-caption font-medium text-danger">
                {error}
              </span>
            )}
          </div>
        ) : (
          <span className="text-caption text-light-muted dark:text-dark-muted">
            {donation.transaction_ref ? (
              <span className="ltr-nums font-mono">{donation.transaction_ref}</span>
            ) : (
              "—"
            )}
          </span>
        )}
      </td>
    </tr>
  );
}
