import Constants from "expo-constants";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Database } from "@qardan/supabase";

/**
 * Client Supabase du mobile.
 *
 * ⚠️ Il ne réutilise PAS `getSupabase()` de `@qardan/supabase` : ce client-là lit
 * `process.env.NEXT_PUBLIC_*` et stocke la session dans `localStorage`, deux choses qui
 * n'existent pas en React Native. Ici, la configuration vient de `app.json > extra`
 * (ou des variables `EXPO_PUBLIC_*`) et la session est persistée dans AsyncStorage.
 * Les TYPES, eux, sont bien partagés — c'est ce qui compte.
 *
 * ⚠️ **L'adresse de développement dépend de l'appareil** :
 *   • émulateur Android → `http://10.0.2.2:54141` (alias stable vers l'hôte)
 *   • téléphone réel via Expo Go → l'IP Wi-Fi du poste, qui CHANGE au redémarrage
 * D'où le passage par `extra`, modifiable sans toucher au code. Après changement,
 * relancer Expo : les valeurs sont figées dans le bundle.
 */

const extra = (Constants.expoConfig?.extra ?? {}) as {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
};

const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? extra.supabaseUrl ?? "";
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? extra.supabaseAnonKey ?? "";

let client: SupabaseClient<Database> | null = null;

export function isConfigured(): boolean {
  return url.length > 0 && anonKey.length > 0;
}

export function getSupabase(): SupabaseClient<Database> {
  if (client) return client;
  if (!isConfigured()) {
    throw new Error("Supabase non configuré : renseignez extra.supabaseUrl / supabaseAnonKey.");
  }

  client = createClient<Database>(url, anonKey, {
    auth: {
      storage: AsyncStorage,
      persistSession: true,
      autoRefreshToken: true,
      // Pas de redirection OAuth dans l'app : inutile, et source de faux positifs.
      detectSessionInUrl: false,
    },
  });
  return client;
}
