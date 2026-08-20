import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, Switch, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { LOCALES, LOCALE_NAMES, ORG, type Locale } from "@qardan/shared";
import { brand, palette } from "@qardan/design-tokens";
import { useLocale } from "@/lib/locale";
import {
  activerNotifications,
  desactiverNotifications,
  notificationsActives,
  synchroniserLangue,
} from "@/lib/notifications";
import { Card, GradientHeader, Notice, PrimaryButton, Screen } from "@/components/ui";

export default function SettingsScreen() {
  const { locale, dict, ui, setLocale, needsRestart } = useLocale();
  const router = useRouter();

  const [pushActif, setPushActif] = useState(false);
  const [pushOccupe, setPushOccupe] = useState(false);
  const [pushMessage, setPushMessage] = useState<string | null>(null);

  // On lit l'état RÉEL du système, pas notre propre drapeau : l'autorisation peut avoir
  // été retirée depuis les réglages Android sans que l'application en soit informée.
  useEffect(() => {
    void notificationsActives().then(setPushActif);
  }, []);

  const basculerPush = useCallback(
    async (souhaite: boolean) => {
      setPushOccupe(true);
      setPushMessage(null);

      if (!souhaite) {
        await desactiverNotifications();
        setPushActif(false);
        setPushOccupe(false);
        return;
      }

      const r = await activerNotifications(locale);
      setPushActif(r.ok);
      if (!r.ok) {
        setPushMessage(
          r.raison === "refus"
            ? ui.settings.pushRefused
            : r.raison === "simulateur"
              ? ui.settings.pushDeviceOnly
              : ui.settings.pushUnavailable,
        );
      }
      setPushOccupe(false);
    },
    [locale, ui],
  );

  // Changer de langue doit changer la langue des notifications reçues.
  useEffect(() => {
    if (pushActif) void synchroniserLangue(locale);
  }, [locale, pushActif]);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <GradientHeader title={ui.settings.title} />

        <View style={{ padding: 20, gap: 16 }}>
          <Card>
            <Text style={{ fontSize: 15, fontWeight: "700", color: palette.light.text }}>
              {ui.settings.language}
            </Text>

            <View style={{ gap: 8, marginTop: 12 }}>
              {LOCALES.map((l: Locale) => {
                const active = l === locale;
                return (
                  <Pressable
                    key={l}
                    onPress={() => void setLocale(l)}
                    style={{
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: active ? brand.leaf : palette.light.border,
                      backgroundColor: active ? `${brand.leaf}12` : palette.light.surface,
                      padding: 14,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: active ? "700" : "500",
                        color: palette.light.text,
                      }}
                    >
                      {LOCALE_NAMES[l]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/*
              Honnêteté sur une limite RÉELLE de React Native : le sens de lecture est
              fixé par la couche native au démarrage. Tant que l'app n'a pas redémarré,
              l'arabe s'affiche mais la mise en page reste de gauche à droite.
            */}
            {needsRestart ? <Notice text={ui.settings.rtlNotice} tone="warning" /> : null}
          </Card>

          <Card>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: "700", color: palette.light.text }}>
                  {ui.settings.notifications}
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: palette.light.textMuted,
                    marginTop: 6,
                    lineHeight: 19,
                  }}
                >
                  {ui.settings.notificationsHint}
                </Text>
              </View>
              <Switch
                value={pushActif}
                disabled={pushOccupe}
                onValueChange={(v) => void basculerPush(v)}
                trackColor={{ true: brand.leaf, false: palette.light.border }}
              />
            </View>
            {pushMessage ? <Notice text={pushMessage} tone="warning" /> : null}
          </Card>

          <Card>
            <Text style={{ fontSize: 15, fontWeight: "700", color: palette.light.text }}>
              {ORG.name}
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: palette.light.textMuted,
                marginTop: 8,
                lineHeight: 19,
              }}
            >
              {dict.org.legal}
            </Text>
            <Text style={{ fontSize: 20, color: brand.leaf, marginTop: 12, textAlign: "right" }}>
              {ORG.nameArabic}
            </Text>
          </Card>

          <PrimaryButton label={ui.common.close} onPress={() => router.back()} />
        </View>
      </ScrollView>
    </Screen>
  );
}
