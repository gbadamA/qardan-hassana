import { ScrollView, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { PROGRAMS, formatDate, isProgramSlug, type ProgramSlug } from "@qardan/shared";
import { palette } from "@qardan/design-tokens";
import { useLocale } from "@/lib/locale";
import { useCachedQuery } from "@/lib/cache";
import { Card, GradientHeader, Loading, Notice, PrimaryButton, Screen, useContentPadding } from "@/components/ui";

type NewsRow = {
  id: string;
  slug: string;
  title_fr: string;
  title_ar: string | null;
  excerpt_fr: string | null;
  excerpt_ar: string | null;
  published_at: string | null;
  created_at: string;
};

/**
 * Détail d'un programme — exigence du §5 du cahier des charges.
 *
 * Le cahier demande « détail de chaque programme avec photos/actualités ». Les actualités
 * y sont : celles publiées SUR ce programme, filtrées en base. Les photos, non — il n'y a
 * pas encore de banque d'images de l'ONG, et poser des photos d'illustration génériques
 * sur des actions réelles serait un faux témoignage. Le bandeau prend donc la couleur du
 * programme : on identifie l'écran d'un coup d'œil, sans rien prétendre.
 */
export default function ProgramDetailScreen() {
  const { locale, dict, ui } = useLocale();

  // Marge basse : sans elle, le contenu passe sous la barre de geste du téléphone.
  const padBas = useContentPadding();
  const router = useRouter();
  const params = useLocalSearchParams<{ slug?: string }>();

  const slug: ProgramSlug | null =
    params.slug && isProgramSlug(params.slug) ? params.slug : null;

  const program = slug ? PROGRAMS.find((p) => p.slug === slug) : undefined;

  // ⚠️ La clé de cache inclut le slug : sans ça, les actualités du programme Social
  // s'afficheraient sous Environnement au retour hors connexion.
  const news = useCachedQuery<NewsRow[]>(
    `news.program.${slug ?? "aucun"}`,
    async (sb) =>
      sb
        .from("news")
        .select("id,slug,title_fr,title_ar,excerpt_fr,excerpt_ar,published_at,created_at")
        .eq("status", "publie")
        .eq("program", slug as ProgramSlug)
        .order("published_at", { ascending: false })
        .limit(10),
    [slug],
  );

  if (!program || !slug) {
    return (
      <Screen>
        <GradientHeader title={ui.programs.title} />
        <View style={{ padding: 20, gap: 16 }}>
          <Text style={{ fontSize: 14, color: palette.light.textMuted, lineHeight: 20 }}>
            {ui.programs.unknown}
          </Text>
          <PrimaryButton label={ui.programs.backToList} onPress={() => router.replace("/(tabs)/programmes")} />
        </View>
      </Screen>
    );
  }

  const labels = dict.programs[slug];

  return (
    <Screen>
      <ScrollView contentContainerStyle={padBas}>
        <GradientHeader title={labels.fullName} subtitle={labels.tagline} color={program.color} />

        {news.stale ? <Notice text={ui.settings.offline} tone="warning" /> : null}

        <View style={{ padding: 20, gap: 20 }}>
          {/* Ce que fait le programme */}
          <Card style={{ borderStartWidth: 4, borderStartColor: program.color }}>
            <Text style={{ fontSize: 15, fontWeight: "800", color: palette.light.text }}>
              {ui.programs.whatWeDo}
            </Text>
            <View style={{ marginTop: 12, gap: 10 }}>
              {labels.actions.map((action) => (
                <View key={action} style={{ flexDirection: "row", gap: 8 }}>
                  <View
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: program.color,
                      marginTop: 6,
                    }}
                  />
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 14,
                      color: palette.light.textMuted,
                      lineHeight: 21,
                    }}
                  >
                    {action}
                  </Text>
                </View>
              ))}
            </View>
          </Card>

          {/* Actualités de CE programme */}
          <View>
            <Text style={{ fontSize: 15, fontWeight: "800", color: palette.light.text }}>
              {ui.programs.relatedNews}
            </Text>

            {news.loading && !news.data ? <Loading label={ui.common.loading} /> : null}

            {!news.loading && (news.data?.length ?? 0) === 0 ? (
              <Text
                style={{
                  fontSize: 13,
                  color: palette.light.textMuted,
                  marginTop: 10,
                  lineHeight: 20,
                }}
              >
                {ui.programs.noNews}
              </Text>
            ) : null}

            <View style={{ marginTop: 12, gap: 12 }}>
              {(news.data ?? []).map((n) => {
                // Même convention que les autres écrans : l'arabe s'il existe, sinon le
                // français. Une actualité non traduite reste lisible plutôt que vide.
                const title = locale === "ar" && n.title_ar ? n.title_ar : n.title_fr;
                const excerpt = locale === "ar" && n.excerpt_ar ? n.excerpt_ar : n.excerpt_fr;
                return (
                  <Card key={n.id}>
                    <Text style={{ fontSize: 15, fontWeight: "700", color: palette.light.text }}>
                      {title}
                    </Text>
                    {excerpt ? (
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
                    ) : null}
                    <Text
                      style={{
                        fontSize: 12,
                        color: palette.light.textMuted,
                        marginTop: 8,
                        writingDirection: "ltr",
                      }}
                    >
                      {formatDate(n.published_at ?? n.created_at, locale)}
                    </Text>
                  </Card>
                );
              })}
            </View>
          </View>

          <PrimaryButton
            label={ui.programs.support}
            tone="accent"
            onPress={() => router.push({ pathname: "/(tabs)/don", params: { programme: slug } })}
          />

          <PrimaryButton
            label={ui.volunteer.cta}
            onPress={() => router.push("/benevole")}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}
