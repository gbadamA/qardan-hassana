import { Linking, Pressable, ScrollView, Text, View } from "react-native";
import { Link, useRouter } from "expo-router";
import { CONTACTS, ORG, PROGRAMS, formatDate } from "@qardan/shared";
import { brand, palette } from "@qardan/design-tokens";
import { useLocale } from "@/lib/locale";
import { useCachedQuery } from "@/lib/cache";
import { Card, GradientHeader, Loading, Notice, Pill, PrimaryButton, Screen } from "@/components/ui";

type NewsRow = {
  id: string;
  slug: string;
  program: (typeof PROGRAMS)[number]["slug"];
  title_fr: string;
  title_ar: string | null;
  excerpt_fr: string;
  excerpt_ar: string | null;
  published_at: string | null;
  created_at: string;
};

export default function HomeScreen() {
  const { locale, dict, ui } = useLocale();
  const pca = CONTACTS[0];

  const router = useRouter();

  const news = useCachedQuery<NewsRow[]>(
    "news.published",
    async (sb) =>
      sb
        .from("news")
        .select("id,slug,program,title_fr,title_ar,excerpt_fr,excerpt_ar,published_at,created_at")
        .eq("status", "publie")
        .order("published_at", { ascending: false })
        .limit(3),
    [],
  );

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <GradientHeader title={ORG.shortName} subtitle={ui.home.lead}>
          <Text style={{ color: brand.accent, fontSize: 22, textAlign: "right", marginBottom: 12 }}>
            {ORG.nameArabic}
          </Text>
          <Link href="/(tabs)/don" asChild>
            <Pressable>
              <View
                style={{
                  backgroundColor: brand.accent,
                  borderRadius: 999,
                  paddingVertical: 13,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: brand.ink, fontWeight: "700", fontSize: 15 }}>
                  {ui.home.donate}
                </Text>
              </View>
            </Pressable>
          </Link>
        </GradientHeader>

        {news.stale ? <Notice text={ui.settings.offline} tone="warning" /> : null}

        {/* Programmes */}
        <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: "800", color: palette.light.text }}>
            {ui.home.ourPrograms}
          </Text>

          <View style={{ gap: 12, marginTop: 12 }}>
            {PROGRAMS.map((p) => {
              const labels = dict.programs[p.slug];
              return (
                <Card key={p.slug} style={{ borderStartWidth: 4, borderStartColor: p.color }}>
                  <Text style={{ fontSize: 16, fontWeight: "700", color: palette.light.text }}>
                    {labels.name}
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
                </Card>
              );
            })}
          </View>
        </View>

        {/* Actualités */}
        <View style={{ paddingHorizontal: 20, paddingTop: 28 }}>
          <Text style={{ fontSize: 18, fontWeight: "800", color: palette.light.text }}>
            {ui.home.latestNews}
          </Text>

          {news.loading && !news.data ? <Loading label={ui.common.loading} /> : null}

          {!news.loading && (news.data?.length ?? 0) === 0 ? (
            <Text style={{ color: palette.light.textMuted, fontSize: 14, marginTop: 12 }}>
              {ui.home.noNews}
            </Text>
          ) : null}

          <View style={{ gap: 12, marginTop: 12 }}>
            {(news.data ?? []).map((n) => {
              const program = PROGRAMS.find((p) => p.slug === n.program);
              // Version arabe manquante → on retombe sur le français plutôt que sur du vide.
              const title = locale === "ar" && n.title_ar ? n.title_ar : n.title_fr;
              const excerpt = locale === "ar" && n.excerpt_ar ? n.excerpt_ar : n.excerpt_fr;

              return (
                <Card key={n.id}>
                  <Pill
                    label={dict.programs[n.program].name}
                    color={program?.color ?? brand.primary}
                  />
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "700",
                      color: palette.light.text,
                      marginTop: 8,
                    }}
                  >
                    {title}
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      color: palette.light.textMuted,
                      marginTop: 6,
                      lineHeight: 19,
                    }}
                  >
                    {excerpt}
                  </Text>
                  <Text style={{ fontSize: 12, color: palette.light.textMuted, marginTop: 8 }}>
                    {formatDate(n.published_at ?? n.created_at, locale)}
                  </Text>
                </Card>
              );
            })}
          </View>
        </View>

        {/* Rejoindre l'ONG — donner de son temps plutôt que de son argent, c'est un
            engagement d'une autre nature : il mérite sa place sur l'accueil, pas d'être
            enterré dans un sous-écran. */}
        <View style={{ paddingHorizontal: 20, paddingTop: 28, gap: 12 }}>
          <PrimaryButton
            label={ui.myDonations.title}
            onPress={() => router.push("/mes-dons")}
          />
          <PrimaryButton
            label={ui.volunteer.cta}
            onPress={() => router.push("/benevole")}
          />
        </View>

        {/* Contact direct — dans un quartier, on appelle, on n'écrit pas. */}
        {pca ? (
          <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
            <PrimaryButton
              label={`${ui.home.callUs} — ${pca.phoneDisplay}`}
              onPress={() => void Linking.openURL(`tel:${pca.phone}`)}
            />
          </View>
        ) : null}

        <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
          <Link href="/reglages" asChild>
            <Pressable>
              <Text style={{ color: brand.primary, fontSize: 14, fontWeight: "600" }}>
                {ui.settings.title}
              </Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </Screen>
  );
}
