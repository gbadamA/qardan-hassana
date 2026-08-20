import AsyncStorage from "@react-native-async-storage/async-storage";
import type { PaymentMethodId, ProgramSlug } from "@qardan/shared";
import { getSupabase, isConfigured } from "./supabase";

/**
 * « Mes dons » — historique porté par l'APPAREIL, sans compte.
 *
 * ⚠️ Choix assumé (arbitré avec le client) : pas d'inscription. Exiger un compte avant
 * de pouvoir suivre son don ferait perdre des donateurs, et la confirmation par email
 * n'est de toute façon pas acheminable aujourd'hui — aucun SMTP n'est configuré, et il
 * n'y a pas de fournisseur SMS pour un code par téléphone.
 *
 * ⚠️ Ce que cela coûte, et qu'il faut dire à l'utilisateur : l'historique vit sur ce
 * téléphone. Réinitialiser l'appareil ou en changer le perd. C'est la référence, notée
 * ou reçue, qui reste la preuve — pas cette liste.
 *
 * Le STATUT n'est jamais stocké comme vérité : il est relu à chaque ouverture. Un don
 * affiché « validé » alors que le Trésorier l'a rejeté serait pire que pas d'écran.
 */

const CLE = "qardan-mes-dons";

/** Ce que l'appareil retient d'un don. Le numéro sert à réinterroger le serveur. */
export type DonLocal = {
  reference: string;
  /** Numéro saisi lors du don — seconde clé exigée par `donation_status`. */
  phone: string;
  amount: number;
  program: ProgramSlug | null;
  method: PaymentMethodId;
  createdAt: string;
};

/** Ce que le serveur en dit aujourd'hui. */
export type DonSuivi = DonLocal & {
  status: "en_attente" | "valide" | "rejete" | "inconnu";
  validatedAt: string | null;
};

export async function lireDons(): Promise<DonLocal[]> {
  try {
    const brut = await AsyncStorage.getItem(CLE);
    return brut ? (JSON.parse(brut) as DonLocal[]) : [];
  } catch {
    return [];
  }
}

/**
 * Ajoute un don à l'historique local. Idempotent sur la référence : réenregistrer le
 * même don ne le duplique pas — utile si l'utilisateur le saisit à la main alors qu'il
 * y figure déjà.
 */
export async function ajouterDon(don: DonLocal): Promise<void> {
  const existants = await lireDons();
  const sans = existants.filter((d) => d.reference !== don.reference);
  const suivants = [don, ...sans];
  try {
    await AsyncStorage.setItem(CLE, JSON.stringify(suivants));
  } catch {
    // Stockage plein ou indisponible : le don est enregistré côté serveur de toute
    // façon, et la référence a été affichée. On ne bloque pas le parcours pour ça.
  }
}

export async function retirerDon(reference: string): Promise<void> {
  const restants = (await lireDons()).filter((d) => d.reference !== reference);
  try {
    await AsyncStorage.setItem(CLE, JSON.stringify(restants));
  } catch {
    /* voir ci-dessus */
  }
}

/**
 * Relit le statut de chaque don auprès du serveur.
 *
 * Un don introuvable est marqué `inconnu` plutôt que retiré : il peut s'agir d'une
 * saisie manuelle erronée, mais aussi d'une panne réseau côté PostgREST. Effacer
 * l'entrée sur un doute reviendrait à faire disparaître la trace d'un vrai don.
 */
export async function rafraichir(dons: DonLocal[]): Promise<DonSuivi[]> {
  if (!isConfigured() || dons.length === 0) {
    return dons.map((d) => ({ ...d, status: "inconnu", validatedAt: null }));
  }

  const sb = getSupabase();

  return Promise.all(
    dons.map(async (d): Promise<DonSuivi> => {
      const { data, error } = await sb.rpc("donation_status", {
        p_reference: d.reference,
        p_phone: d.phone,
      });

      const ligne = Array.isArray(data) ? data[0] : null;
      if (error || !ligne) return { ...d, status: "inconnu", validatedAt: null };

      return {
        ...d,
        // Le serveur fait foi sur le montant et le programme aussi : si le Trésorier a
        // corrigé une saisie, l'écran doit montrer la correction, pas notre copie.
        amount: ligne.amount_fcfa,
        program: ligne.program,
        method: ligne.method,
        createdAt: ligne.created_at,
        status: ligne.status,
        validatedAt: ligne.validated_at,
      };
    }),
  );
}
