import { Text, View } from "react-native";
import { formatMoney, type Locale, type ProgramSlug } from "@qardan/shared";
import { brand, palette } from "@qardan/design-tokens";
import type { MobileUi } from "@/content";
import { Card, PrimaryButton } from "./ui";

/**
 * Suivi d'une collecte, côté mobile.
 *
 * ⚠️ Les chiffres viennent de `public_campaigns()`, jamais de la table `donations` :
 * celle-ci contient les téléphones de tous les donateurs et la RLS en interdit la
 * lecture à un client anonyme — donc à l'application, qui n'a pas de compte.
 *
 * ⚠️ La progression est **plafonnée à 100 %** à l'affichage. Une collecte qui dépasse
 * son objectif est une bonne nouvelle ; une barre qui déborde de sa gouttière est un
 * bug visuel. Le montant réel, lui, reste affiché tel quel sous la barre.
 */

export type Campagne = {
  id: string;
  title_fr: string;
  title_ar: string | null;
  description_fr: string | null;
  description_ar: string | null;
  image_url: string | null;
  /** `null` pour une collecte non rattachée à un programme. */
  program: ProgramSlug | null;
  goal_fcfa: number;
  collected_fcfa: number;
  donors_count: number;
  ends_on: string | null;
  closed: boolean;
};

/** Jours restants, ou `null` si la collecte n'a pas d'échéance. */
function joursRestants(ends: string | null): number | null {
  if (!ends) return null;
  const reste = Math.ceil((new Date(`${ends}T23:59:59`).getTime() - Date.now()) / 86_400_000);
  return reste > 0 ? reste : 0;
}

export function CampaignCard({
  campagne,
  locale,
  ui,
  color,
  onSupport,
}: {
  campagne: Campagne;
  locale: Locale;
  ui: MobileUi;
  /** Teinte du programme : la barre appartient visuellement à l'écran qui la porte. */
  color?: string;
  onSupport: () => void;
}) {
  const titre = locale === "ar" && campagne.title_ar ? campagne.title_ar : campagne.title_fr;
  const texte =
    locale === "ar" && campagne.description_ar ? campagne.description_ar : campagne.description_fr;

  const teinte = color ?? brand.leaf;
  const pct = Math.min(100, Math.round((campagne.collected_fcfa / Math.max(1, campagne.goal_fcfa)) * 100));
  const reste = Math.max(0, campagne.goal_fcfa - campagne.collected_fcfa);
  const jours = joursRestants(campagne.ends_on);

  return (
    <Card style={{ gap: 12 }}>
      <Text style={{ fontSize: 15, fontWeight: "800", color: palette.light.text }}>{titre}</Text>

      {texte ? (
        <Text style={{ fontSize: 13, color: palette.light.textMuted, lineHeight: 19 }}>{texte}</Text>
      ) : null}

      {/* Gouttière + remplissage. `writingDirection: ltr` sur les nombres : en arabe, la
          phrase s'inverse mais « 395 000 / 2 500 000 » se lit toujours de gauche à droite. */}
      <View>
        <View
          style={{
            height: 8,
            borderRadius: 999,
            backgroundColor: palette.light.border,
            overflow: "hidden",
          }}
        >
          <View style={{ width: `${pct}%`, height: "100%", backgroundColor: teinte }} />
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 8,
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: "800", color: teinte, writingDirection: "ltr" }}>
            {formatMoney(campagne.collected_fcfa, locale)}
          </Text>
          <Text style={{ fontSize: 12, color: palette.light.textMuted, writingDirection: "ltr" }}>
            {pct} % {ui.campaigns.of} {formatMoney(campagne.goal_fcfa, locale)}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        <Text style={{ fontSize: 12, color: palette.light.textMuted }}>
          {campagne.donors_count} {ui.campaigns.donors}
        </Text>
        {jours !== null && !campagne.closed ? (
          <Text style={{ fontSize: 12, color: palette.light.textMuted }}>
            {jours} {ui.campaigns.daysLeft}
          </Text>
        ) : null}
      </View>

      {campagne.closed ? (
        <Text style={{ fontSize: 13, color: palette.light.textMuted, fontWeight: "600" }}>
          {ui.campaigns.closed}
        </Text>
      ) : (
        <>
          {reste > 0 ? (
            <Text style={{ fontSize: 13, color: palette.light.text }}>
              {ui.campaigns.remaining} {formatMoney(reste, locale)}
            </Text>
          ) : (
            <Text style={{ fontSize: 13, fontWeight: "700", color: brand.leaf }}>
              {ui.campaigns.goalReached}
            </Text>
          )}
          <PrimaryButton label={ui.campaigns.support} tone="accent" onPress={onSupport} />
        </>
      )}
    </Card>
  );
}
