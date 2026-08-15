"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabase, isSupabaseConfigured, type QardanClient } from "@qardan/supabase";

/**
 * Petit crochet de lecture. Volontairement minimal : pas de React Query, pas de cache
 * global. Un back-office d'ONG se consulte à quelques utilisateurs simultanés, sur des
 * tables de quelques milliers de lignes — l'outillage coûterait plus qu'il ne rapporte.
 *
 * Ce qu'il apporte quand même : les trois états (chargement / erreur / données) au même
 * endroit, et un `reload()` explicite après chaque écriture.
 */
export function useQuery<T>(
  run: (supabase: QardanClient) => Promise<{ data: T | null; error: { message: string } | null }>,
  deps: unknown[] = [],
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setError("Supabase non configuré.");
      setLoading(false);
      return;
    }
    setLoading(true);
    const res = await run(getSupabase());
    setError(res.error?.message ?? null);
    setData(res.data);
    setLoading(false);
    // `run` change à chaque rendu ; ce sont `deps` qui pilotent réellement le rechargement.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, error, loading, reload, setData };
}

/**
 * Export CSV.
 *
 * ⚠️ Trois détails appris à la dure sur le projet mosquee-fitia :
 *  1. l'ancre doit être **insérée dans le DOM** avant `click()`, sinon certains
 *     navigateurs ignorent le téléchargement en silence ;
 *  2. le séparateur est le **point-virgule** — Excel en locale française lit la virgule
 *     comme un séparateur décimal et colle tout dans une seule colonne ;
 *  3. le **BOM UTF-8** est indispensable, sans quoi « Traoré » devient « TraorÃ© ».
 */
export function downloadCSV(filename: string, rows: (string | number | null)[][]) {
  const escape = (v: string | number | null) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const content = "﻿" + rows.map((r) => r.map(escape).join(";")).join("\r\n");
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Révocation différée : révoquer immédiatement annule le téléchargement sur Safari.
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}
