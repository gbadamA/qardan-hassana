import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

export * from "./database.types";
export type { SupabaseClient };

export type QardanClient = SupabaseClient<Database>;

/**
 * Client Supabase partagé (site, dashboard, futur mobile).
 *
 * ⚠️ Fabrique paresseuse et NON un client créé à l'import : `createClient` lève si les
 * variables d'environnement sont vides, et un throw au moment de l'import casse le rendu
 * de toute page qui touche ce module — y compris la page de connexion, qui devient alors
 * impossible à afficher pour diagnostiquer le problème (leçon mosquee-fitia, où
 * `AuthProvider` appelait la fabrique sans garde).
 *
 * ➜ Toujours tester `isSupabaseConfigured()` avant d'appeler `getSupabase()`.
 */

let client: QardanClient | null = null;

function readEnv() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  };
}

export function isSupabaseConfigured(): boolean {
  const { url, key } = readEnv();
  return url.length > 0 && key.length > 0;
}

export function getSupabase(): QardanClient {
  if (client) return client;

  const { url, key } = readEnv();
  if (!url || !key) {
    throw new Error(
      "Supabase non configuré : renseignez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  client = createClient<Database>(url, key, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
  });
  return client;
}
