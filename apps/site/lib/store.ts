import { appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import {
  formatDonationReference,
  type ContactMessage,
  type DonationIntent,
  type SubmissionStore,
  type VolunteerApplication,
} from "@qardan/shared";
import { getSupabase, isSupabaseConfigured } from "@qardan/supabase";

/**
 * Deux implémentations du port `SubmissionStore`, et une bascule automatique.
 *
 * `supabaseSubmissionStore` est la CIBLE : le don déposé sur le site apparaît dans le
 * back-office à la seconde (Realtime), le Trésorier le valide, le donateur reçoit son
 * reçu. C'est la boucle complète.
 *
 * `fileSubmissionStore` reste en secours **pour le développement uniquement** : il permet
 * de travailler sur le site sans lancer Docker et Supabase. Il n'est jamais utilisé dès
 * que les variables d'environnement Supabase sont renseignées.
 *
 * ⚠️ Ne pas déployer en comptant sur le fichier : un hébergement sans disque persistant
 * (Vercel, Netlify) le perdrait à chaque requête.
 */

// ─────────────────────────── Cible : Supabase ───────────────────────────

/**
 * ⚠️ **Pourquoi des RPC et non des `insert()` directs.**
 *
 * Un `insert(...).select("reference")` oblige PostgREST à RELIRE la ligne écrite. Or un
 * visiteur anonyme n'a — à juste titre — aucun droit de lecture sur `donations` : il
 * verrait sinon les coordonnées et les montants de tous les autres donateurs. Le
 * rejet remontait sous la forme trompeuse « new row violates row-level security policy »,
 * alors que c'est la RELECTURE qui était refusée, pas l'écriture.
 *
 * Les fonctions `security definer` écrivent et ne renvoient QUE la référence. Elles
 * fixent aussi le statut côté base : un client ne peut plus tenter d'auto-valider son don.
 */
const supabaseSubmissionStore: SubmissionStore = {
  id: "supabase-rpc",

  async save(kind, payload) {
    const supabase = getSupabase();

    if (kind === "don") {
      const intent = payload as DonationIntent;
      const { data, error } = await supabase.rpc("submit_public_donation", {
        p_amount: intent.amount,
        p_program: intent.program,
        p_method: intent.method,
        p_frequency: intent.frequency,
        p_donor_name: intent.donorName,
        p_donor_phone: intent.donorPhone,
        p_donor_email: intent.donorEmail || null,
        p_anonymous: intent.anonymous,
        p_message: intent.message || null,
        p_campaign: intent.campaignId ?? null,
        p_visibility: intent.visibility ?? "public",
      });

      if (error) throw new Error(error.message);
      return { reference: String(data) };
    }

    if (kind === "contact") {
      const msg = payload as ContactMessage;
      const { data, error } = await supabase.rpc("submit_contact_message", {
        p_name: msg.name,
        p_email: msg.email,
        p_subject: msg.subject,
        p_message: msg.message,
        p_phone: msg.phone || null,
      });

      if (error) throw new Error(error.message);
      return { reference: String(data) };
    }

    const application = payload as VolunteerApplication;
    const { data, error } = await supabase.rpc("submit_volunteer_application", {
      p_full_name: application.fullName,
      p_phone: application.phone,
      p_city: application.city,
      p_motivation: application.motivation,
      p_programs: application.programs,
      p_availability: application.availability,
      p_birth_year: application.birthYear,
      p_email: application.email || null,
      p_skills: application.skills || null,
      p_wants_membership: application.wantsMembership,
    });

    if (error) throw new Error(error.message);
    return { reference: String(data) };
  },
};

// ──────────────────── Secours de développement : fichier ────────────────────

const DATA_DIR = path.join(process.cwd(), ".data");
const FILES = { contact: "contact.jsonl", benevole: "benevoles.jsonl", don: "dons.jsonl" } as const;

async function countLines(file: string): Promise<number> {
  try {
    const raw = await readFile(file, "utf8");
    return raw.split("\n").filter((l) => l.trim().length > 0).length;
  } catch {
    return 0; // fichier absent = aucune soumission encore
  }
}

const fileSubmissionStore: SubmissionStore = {
  id: "file-jsonl",

  async save(kind, payload) {
    const file = path.join(DATA_DIR, FILES[kind]);
    await mkdir(DATA_DIR, { recursive: true });

    const year = new Date().getFullYear();
    const sequence = (await countLines(file)) + 1;
    const reference =
      kind === "don"
        ? formatDonationReference(year, sequence)
        : `${kind === "contact" ? "MSG" : "BEN"}-${year}-${String(sequence).padStart(4, "0")}`;

    await appendFile(
      file,
      `${JSON.stringify({ reference, kind, receivedAt: new Date().toISOString(), status: "en_attente", payload })}\n`,
      "utf8",
    );
    return { reference };
  },
};

/**
 * Supabase dès qu'il est configuré ; fichier local sinon — et UNIQUEMENT en développement.
 *
 * ⚠️ En production, le repli fichier est un piège : un hébergement sans disque
 * persistant (Vercel, Netlify) a un système de fichiers en LECTURE SEULE, et
 * l'écriture lève une erreur brute au milieu d'une Server Action. Le visiteur voit
 * alors un écran d'erreur après avoir saisi son don — le pire moment possible.
 * Mieux vaut refuser proprement : l'appelant traduit `errors.submitFailed` et
 * affiche un message qui invite à téléphoner.
 */
export function getSubmissionStore(): SubmissionStore {
  if (isSupabaseConfigured()) return supabaseSubmissionStore;
  if (process.env.NODE_ENV === "production") {
    return {
      id: "unconfigured",
      async save() {
        throw new Error("errors.submitFailed");
      },
    };
  }
  return fileSubmissionStore;
}
