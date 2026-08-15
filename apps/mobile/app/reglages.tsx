import { Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { LOCALES, LOCALE_NAMES, ORG, type Locale } from "@qardan/shared";
import { brand, palette } from "@qardan/design-tokens";
import { useLocale } from "@/lib/locale";
import { Card, GradientHeader, Notice, PrimaryButton, Screen } from "@/components/ui";

export default function SettingsScreen() {
  const { locale, dict, ui, setLocale, needsRestart } = useLocale();
  const router = useRouter();

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
