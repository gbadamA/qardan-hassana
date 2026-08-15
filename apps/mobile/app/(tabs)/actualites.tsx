import { RefreshControl, ScrollView, Text, View } from "react-native";
import { PROGRAMS, formatDate } from "@qardan/shared";
import { brand, palette } from "@qardan/design-tokens";
import { useLocale } from "@/lib/locale";
import { useCachedQuery } from "@/lib/cache";
import { Card, GradientHeader, Loading, Notice, Pill, Screen } from "@/components/ui";

type NewsRow = {
  id: string;
  program: (typeof PROGRAMS)[number]["slug"];
  title_fr: string;
  title_ar: string | null;
  excerpt_fr: string;
  excerpt_ar: string | null;
  body_fr: string;
  body_ar: string | null;
  reading_minutes: number;
  published_at: string | null;
  created_at: string;
};

export default function NewsScreen() {
  const { locale, dict, ui } = useLocale();

  const news = useCachedQuery<NewsRow[]>(
    "news.all",
    async (sb) =>
      sb
        .from("news")
        .select(
          "id,program,title_fr,title_ar,excerpt_fr,excerpt_ar,body_fr,body_ar,reading_minutes,published_at,created_at",
        )
        .eq("status", "publie")
        .order("published_at", { ascending: false }),
    [],
  );

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={news.loading} onRefresh={() => void news.reload()} />
        }
      >
        <GradientHeader title={ui.news.title} />

        {news.stale ? <Notice text={ui.settings.offline} tone="warning" /> : null}
        {news.error && !news.data ? <Notice text={news.error} tone="warning" /> : null}

        {news.loading && !news.data ? <Loading label={ui.common.loading} /> : null}

        {!news.loading && (news.data?.length ?? 0) === 0 ? (
          <Text
            style={{
              color: palette.light.textMuted,
              fontSize: 14,
              textAlign: "center",
              marginTop: 32,
            }}
          >
            {ui.news.empty}
          </Text>
        ) : null}

        <View style={{ padding: 20, gap: 14 }}>
          {(news.data ?? []).map((n) => {
            const program = PROGRAMS.find((p) => p.slug === n.program);
            const title = locale === "ar" && n.title_ar ? n.title_ar : n.title_fr;
            const excerpt = locale === "ar" && n.excerpt_ar ? n.excerpt_ar : n.excerpt_fr;
            const body = locale === "ar" && n.body_ar ? n.body_ar : n.body_fr;

            return (
              <Card key={n.id}>
                <Pill
                  label={dict.programs[n.program].name}
                  color={program?.color ?? brand.primary}
                />
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "800",
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

                {/* Corps : les lignes commençant par « ## » sont des sous-titres,
                    même convention que le site et le back-office. */}
                <View style={{ marginTop: 10, gap: 6 }}>
                  {body
                    .split("\n")
                    .filter((l) => l.trim().length > 0)
                    .map((line, i) =>
                      line.startsWith("## ") ? (
                        <Text
                          key={i}
                          style={{
                            fontSize: 14,
                            fontWeight: "700",
                            color: palette.light.text,
                            marginTop: 6,
                          }}
                        >
                          {line.replace("## ", "")}
                        </Text>
                      ) : (
                        <Text
                          key={i}
                          style={{ fontSize: 13, color: palette.light.text, lineHeight: 20 }}
                        >
                          {line}
                        </Text>
                      ),
                    )}
                </View>

                <Text style={{ fontSize: 12, color: palette.light.textMuted, marginTop: 12 }}>
                  {formatDate(n.published_at ?? n.created_at, locale)} · {n.reading_minutes}{" "}
                  {ui.news.readingTime}
                </Text>
              </Card>
            );
          })}
        </View>
      </ScrollView>
    </Screen>
  );
}
