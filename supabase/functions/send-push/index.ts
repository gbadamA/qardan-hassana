/**
 * Envoi d'une notification push à l'application mobile.
 *
 * ⚠️ Pourquoi une Edge Function et pas un appel depuis le back-office : la liste des
 * jetons d'appareils ne doit jamais descendre dans un navigateur. C'est un fichier de
 * traçage — savoir quels téléphones ont installé l'app de l'ONG. Seul le `service_role`,
 * qui vit ici, la lit.
 *
 * ⚠️ Le rôle de l'appelant est REVÉRIFIÉ en base, jamais lu depuis le corps de la requête
 * ni depuis les métadonnées du JWT : ces dernières sont modifiables par l'utilisateur.
 * Même principe que `create-member`.
 */

import { createClient } from "jsr:@supabase/supabase-js@2";

const EXPO_PUSH = "https://exp.host/--/api/v2/push/send";

/** Rôles autorisés à notifier tous les porteurs de l'application. */
const ROLES_AUTORISES = ["super_admin", "direction", "administratif"];

type Corps = {
  titleFr: string;
  bodyFr: string;
  titleAr?: string;
  bodyAr?: string;
  /** Données libres transmises à l'app (ex. `{ route: "/actualites" }`). */
  data?: Record<string, unknown>;
};

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return json({ error: "Méthode non autorisée" }, 405);
  }

  const authorization = req.headers.get("Authorization");
  if (!authorization) return json({ error: "Jeton manquant" }, 401);

  const url = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // Client "appelant" : sert uniquement à identifier QUI appelle.
  const appelant = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authorization } },
  });

  const { data: auth } = await appelant.auth.getUser();
  if (!auth?.user) return json({ error: "Session invalide" }, 401);

  const admin = createClient(url, serviceKey);

  const { data: profil } = await admin
    .from("profiles")
    .select("role")
    .eq("id", auth.user.id)
    .single();

  if (!profil || !ROLES_AUTORISES.includes(profil.role)) {
    return json({ error: "Rôle insuffisant" }, 403);
  }

  let corps: Corps;
  try {
    corps = await req.json();
  } catch {
    return json({ error: "Corps illisible" }, 400);
  }

  if (!corps.titleFr?.trim() || !corps.bodyFr?.trim()) {
    return json({ error: "Titre et message requis" }, 400);
  }

  const { data: jetons, error } = await admin
    .from("push_tokens")
    .select("token, locale");

  if (error) return json({ error: error.message }, 500);
  if (!jetons?.length) return json({ envoyes: 0, note: "Aucun appareil enregistré" });

  // Chaque appareil reçoit dans SA langue. Un porteur arabophone qui reçoit un titre en
  // français ne le lit pas — et une notification qu'on ne lit pas, on la désactive.
  const messages = jetons.map((j) => ({
    to: j.token,
    sound: "default",
    title: j.locale === "ar" && corps.titleAr?.trim() ? corps.titleAr : corps.titleFr,
    body: j.locale === "ar" && corps.bodyAr?.trim() ? corps.bodyAr : corps.bodyFr,
    data: corps.data ?? {},
  }));

  // Expo accepte 100 messages par requête au maximum.
  const lots: (typeof messages)[] = [];
  for (let i = 0; i < messages.length; i += 100) lots.push(messages.slice(i, i + 100));

  let envoyes = 0;
  const invalides: string[] = [];

  for (const lot of lots) {
    const reponse = await fetch(EXPO_PUSH, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept-Encoding": "gzip, deflate" },
      body: JSON.stringify(lot),
    });

    const resultat = await reponse.json().catch(() => null);
    const tickets = resultat?.data ?? [];

    tickets.forEach((t: { status?: string; details?: { error?: string } }, i: number) => {
      if (t?.status === "ok") {
        envoyes += 1;
      } else if (t?.details?.error === "DeviceNotRegistered") {
        invalides.push(lot[i].to);
      }
    });
  }

  // Un appareil désinstallé le reste : on retire son jeton plutôt que de le réessayer à
  // chaque envoi. Sans ce ménage, la table gonfle de jetons morts et les statistiques
  // d'audience deviennent fausses.
  if (invalides.length) {
    await admin.from("push_tokens").delete().in("token", invalides);
  }

  return json({ envoyes, retires: invalides.length, appareils: jetons.length });
});

function json(corps: unknown, status = 200): Response {
  return new Response(JSON.stringify(corps), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
