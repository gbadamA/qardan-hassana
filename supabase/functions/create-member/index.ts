import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

/**
 * Création d'un compte du back-office.
 *
 * ⚠️ **Pourquoi une Edge Function et pas un simple `insert` dans `profiles`.**
 * Un profil ne peut pas exister sans une ligne dans `auth.users`, et créer un
 * utilisateur exige la clé `service_role` — une clé qui contourne TOUTE la RLS et qui
 * ne doit donc jamais approcher un navigateur. Elle vit ici, côté serveur, et nulle part
 * ailleurs. (Leçon mosquee-fitia : même conclusion, même montage.)
 *
 * ⚠️ **Le rôle de l'appelant est REVÉRIFIÉ ici**, en base, à partir de son jeton.
 * Le fait que le bouton soit caché dans l'interface ne prouve rien : n'importe qui peut
 * appeler cette URL avec son propre jeton. La vérification côté client est du confort ;
 * celle-ci est la sécurité.
 */

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/** Rôles habilités à créer un compte : PCA et Service Administratif. */
const CAN_CREATE = ["super_admin", "administratif"];

const VALID_ROLES = [
  "super_admin",
  "tresorier",
  "commissaire",
  "direction",
  "administratif",
  "resp_programme",
  "donateur",
];

const VALID_PROGRAMS = ["social", "environnement", "education", "sante-sport"];

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const url = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) return json({ error: "missing_token" }, 401);

  // 1. Qui appelle ? On lit le jeton avec la clé ANON : c'est le client de l'appelant,
  //    donc soumis à la RLS comme lui.
  const asCaller = createClient(url, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: userData, error: userError } = await asCaller.auth.getUser();
  if (userError || !userData.user) return json({ error: "invalid_token" }, 401);

  // 2. Son rôle vient de la BASE, jamais du corps de la requête ni du JWT.
  const { data: caller } = await asCaller
    .from("profiles")
    .select("role, is_active")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (!caller || !caller.is_active || !CAN_CREATE.includes(caller.role)) {
    return json({ error: "forbidden" }, 403);
  }

  // 3. Validation de la charge utile.
  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const email = String(payload.email ?? "").trim().toLowerCase();
  const password = String(payload.password ?? "");
  const fullName = String(payload.full_name ?? "").trim();
  const role = String(payload.role ?? "");
  const program = payload.program ? String(payload.program) : null;
  const phone = payload.phone ? String(payload.phone).trim() : null;

  if (!email.includes("@")) return json({ error: "invalid_email" }, 400);
  if (password.length < 8) return json({ error: "password_too_short" }, 400);
  if (fullName.length < 2) return json({ error: "invalid_name" }, 400);
  if (!VALID_ROLES.includes(role)) return json({ error: "invalid_role" }, 400);

  // Un responsable de programme SANS programme verrait zéro ligne partout : la RLS
  // compare `auth_program()` au programme de la donnée, et `null` ne matche rien.
  // Mieux vaut refuser la création que livrer un compte muet.
  if (role === "resp_programme" && (!program || !VALID_PROGRAMS.includes(program))) {
    return json({ error: "program_required_for_resp" }, 400);
  }

  // 4. Création — avec la clé service_role, la seule qui puisse écrire dans `auth`.
  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // pas de serveur SMTP en local : on confirme d'office
    user_metadata: { full_name: fullName },
  });

  if (createError || !created.user) {
    const already = createError?.message?.toLowerCase().includes("already");
    return json({ error: already ? "email_already_exists" : "create_failed" }, already ? 409 : 500);
  }

  const { error: profileError } = await admin.from("profiles").insert({
    id: created.user.id,
    full_name: fullName,
    role,
    program: role === "resp_programme" ? program : null,
    email,
    phone,
  });

  if (profileError) {
    // Sans profil, le compte serait inutilisable ET invisible dans l'écran
    // Administration : un fantôme dans `auth.users`. On annule la création.
    await admin.auth.admin.deleteUser(created.user.id);
    return json({ error: "profile_failed", detail: profileError.message }, 500);
  }

  await admin.from("activity_log").insert({
    actor_id: userData.user.id,
    action: "member.create",
    entity: "profiles",
    entity_id: created.user.id,
    details: { email, role },
  });

  return json({ id: created.user.id, email, role }, 201);
});
