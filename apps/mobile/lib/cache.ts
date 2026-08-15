import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getSupabase, isConfigured } from "./supabase";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@qardan/supabase";

/**
 * Lecture avec CACHE HORS CONNEXION.
 *
 * Ce n'est pas un confort : à Abidjan, une connexion 3G qui tombe au milieu d'un
 * chargement est la norme, pas l'exception. Sans cache, l'app affiche un écran vide
 * et donne l'impression d'être cassée alors que les données étaient là hier.
 *
 * Stratégie : on rend d'abord ce qui est en cache (affichage immédiat), puis on
 * rafraîchit depuis le réseau. Si le réseau échoue mais que le cache existe, on garde
 * le cache et on lève le drapeau `stale` — l'écran le signale honnêtement plutôt que
 * de faire passer des données d'hier pour celles d'aujourd'hui.
 */
export function useCachedQuery<T>(
  cacheKey: string,
  run: (sb: SupabaseClient<Database>) => Promise<{ data: T | null; error: { message: string } | null }>,
  deps: unknown[] = [],
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [stale, setStale] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    // 1. Cache d'abord — l'écran se remplit tout de suite.
    let hadCache = false;
    try {
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) {
        setData(JSON.parse(cached) as T);
        hadCache = true;
      }
    } catch {
      /* cache illisible : on continue, le réseau prendra le relais */
    }

    if (!isConfigured()) {
      setLoading(false);
      setStale(hadCache);
      if (!hadCache) setError("Supabase non configuré.");
      return;
    }

    // 2. Réseau ensuite.
    try {
      const res = await run(getSupabase());
      if (res.error) throw new Error(res.error.message);
      setData(res.data);
      setStale(false);
      if (res.data !== null) await AsyncStorage.setItem(cacheKey, JSON.stringify(res.data));
    } catch (e) {
      // Réseau indisponible : on garde ce que le cache a donné.
      if (!hadCache) setError(e instanceof Error ? e.message : String(e));
      else setStale(true);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, error, loading, stale, reload: load };
}
