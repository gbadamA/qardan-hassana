import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import type { Locale } from "@qardan/shared";
import { getSupabase, isConfigured } from "./supabase";

/**
 * Notifications push — exigence du §5 du cahier des charges.
 *
 * ⚠️ **Pas de demande d'autorisation au premier lancement.** Une application qui réclame
 * les notifications avant d'avoir rendu le moindre service se fait refuser, et un refus
 * Android est DÉFINITIF : on ne peut plus reposer la question, l'utilisateur doit aller
 * dans les réglages du système. L'activation se fait donc depuis l'écran Réglages, quand
 * la personne a décidé qu'elle voulait suivre l'ONG.
 *
 * ⚠️ **Ne fonctionne pas dans Expo Go sur Android** depuis le SDK 53 : la fonction lève
 * une erreur au lieu d'avertir. Il faut un build de développement ou l'APK. C'est une
 * limite d'Expo, pas de ce code — et la raison pour laquelle cet écran ne peut être
 * validé qu'après un build.
 */

const CLE_JETON = "qardan-push-token";

/** Comportement quand une notification arrive, application ouverte. */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export type ResultatActivation =
  | { ok: true; token: string }
  | { ok: false; raison: "simulateur" | "refus" | "indisponible" | "erreur" };

/**
 * L'identifiant du projet EAS, indispensable pour obtenir un jeton Expo.
 * Absent en développement hors EAS — d'où la lecture défensive.
 */
function projectId(): string | undefined {
  const extra = Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined;
  return extra?.eas?.projectId;
}

export async function activerNotifications(locale: Locale): Promise<ResultatActivation> {
  // Un simulateur n'a pas de service de notification : inutile d'inquiéter avec un refus.
  if (!Device.isDevice) return { ok: false, raison: "simulateur" };
  if (!isConfigured()) return { ok: false, raison: "indisponible" };

  const id = projectId();
  if (!id) return { ok: false, raison: "indisponible" };

  try {
    // Android exige un canal déclaré, sinon les notifications arrivent muettes et sans
    // priorité — donc invisibles en pratique.
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Qardan Hassana",
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#0F5C2E",
      });
    }

    const existant = await Notifications.getPermissionsAsync();
    let statut = existant.status;

    if (statut !== "granted") {
      const demande = await Notifications.requestPermissionsAsync();
      statut = demande.status;
    }

    if (statut !== "granted") return { ok: false, raison: "refus" };

    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId: id });

    const { error } = await getSupabase().rpc("register_push_token", {
      p_token: token,
      p_locale: locale,
      p_platform: Platform.OS === "ios" ? "ios" : "android",
    });
    if (error) return { ok: false, raison: "erreur" };

    await AsyncStorage.setItem(CLE_JETON, token);
    return { ok: true, token };
  } catch {
    return { ok: false, raison: "erreur" };
  }
}

/**
 * Désactivation — on EFFACE le jeton côté serveur, on ne se contente pas de cesser
 * d'émettre. Garder l'appareil en base après un refus reviendrait à conserver une trace
 * dont l'utilisateur vient justement de demander la fin.
 */
export async function desactiverNotifications(): Promise<void> {
  const token = await AsyncStorage.getItem(CLE_JETON);
  if (!token) return;

  if (isConfigured()) {
    await getSupabase().rpc("unregister_push_token", { p_token: token });
  }
  await AsyncStorage.removeItem(CLE_JETON);
}

/** `true` si cet appareil est enregistré ET que l'autorisation système tient toujours. */
export async function notificationsActives(): Promise<boolean> {
  const token = await AsyncStorage.getItem(CLE_JETON);
  if (!token) return false;
  if (!Device.isDevice) return false;

  // L'autorisation peut avoir été retirée depuis les réglages Android sans que l'app le
  // sache. On lit l'état réel plutôt que de faire confiance à notre propre drapeau.
  const { status } = await Notifications.getPermissionsAsync();
  return status === "granted";
}

/**
 * Met à jour la langue du jeton. Appelé au changement de langue : sans ça, un porteur
 * passé à l'arabe continuerait de recevoir des notifications en français.
 */
export async function synchroniserLangue(locale: Locale): Promise<void> {
  const token = await AsyncStorage.getItem(CLE_JETON);
  if (!token || !isConfigured()) return;

  await getSupabase().rpc("register_push_token", {
    p_token: token,
    p_locale: locale,
    p_platform: Platform.OS === "ios" ? "ios" : "android",
  });
}
