import { Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { PROGRAMS } from "@qardan/shared";
import { palette } from "@qardan/design-tokens";
import { useLocale } from "@/lib/locale";
import { Card, GradientHeader, PrimaryButton, Screen } from "@/components/ui";

export default function ProgramsScreen() {
  const { dict, ui } = useLocale();
  const router = useRouter();

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <GradientHeader title={ui.programs.title} />

        <View style={{ padding: 20, gap: 16 }}>
          {PROGRAMS.map((p) => {
            const labels = dict.programs[p.slug];
            return (
              <Pressable
                key={p.slug}
                onPress={() => router.push({ pathname: "/programme/[slug]", params: { slug: p.slug } })}
                accessibilityRole="button"
                accessibilityHint={ui.programs.openDetail}
              >
                <Card style={{ borderStartWidth: 4, borderStartColor: p.color }}>
                <Text style={{ fontSize: 17, fontWeight: "800", color: palette.light.text }}>
                  {labels.fullName}
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: palette.light.textMuted,
                    marginTop: 4,
                    lineHeight: 19,
                  }}
                >
                  {labels.tagline}
                </Text>

                <View style={{ marginTop: 12, gap: 8 }}>
                  {labels.actions.map((action) => (
                    <View key={action} style={{ flexDirection: "row", gap: 8 }}>
                      <View
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: p.color,
                          marginTop: 6,
                        }}
                      />
                      <Text
                        style={{
                          flex: 1,
                          fontSize: 13,
                          color: palette.light.textMuted,
                          lineHeight: 19,
                        }}
                      >
                        {action}
                      </Text>
                    </View>
                  ))}
                </View>

                <View style={{ marginTop: 16, gap: 8 }}>
                  <PrimaryButton
                    label={ui.programs.support}
                    tone="accent"
                    onPress={() => router.push({ pathname: "/(tabs)/don", params: { programme: p.slug } })}
                  />
                  <Text
                    style={{ fontSize: 12, color: p.color, fontWeight: "700", textAlign: "center" }}
                  >
                    {ui.programs.openDetail}
                  </Text>
                </View>
                </Card>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </Screen>
  );
}
