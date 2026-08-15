import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { brand, gradient, palette } from "@qardan/design-tokens";

/**
 * Primitives visuelles du mobile.
 *
 * Elles lisent les MÊMES tokens que le site et le dashboard (`@qardan/design-tokens`) :
 * une couleur changée là-bas se répercute ici. On passe par les objets JS plutôt que par
 * des classes NativeWind pour tout ce qui touche aux props natives (dégradés, couleurs
 * d'`ActivityIndicator`, bordures d'ombre), que NativeWind ne convertit pas.
 */

export function Screen({ children }: { children: React.ReactNode }) {
  return <View style={{ flex: 1, backgroundColor: palette.light.bg }}>{children}</View>;
}

/** En-tête en dégradé signature — la signature visuelle de l'ONG. */
export function GradientHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <LinearGradient
      colors={[...gradient.emerald]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ paddingHorizontal: 20, paddingTop: 56, paddingBottom: 24 }}
    >
      <Text style={{ color: "#fff", fontSize: 26, fontWeight: "800" }}>{title}</Text>
      {subtitle ? (
        <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, marginTop: 6, lineHeight: 21 }}>
          {subtitle}
        </Text>
      ) : null}
      {children ? <View style={{ marginTop: 16 }}>{children}</View> : null}
    </LinearGradient>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: object }) {
  return (
    <View
      style={{
        backgroundColor: palette.light.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: palette.light.border,
        padding: 16,
        ...style,
      }}
    >
      {children}
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  busy = false,
  tone = "primary",
}: {
  label: string;
  onPress: () => void;
  busy?: boolean;
  tone?: "primary" | "accent";
}) {
  const bg = tone === "accent" ? brand.accent : brand.primary;
  const fg = tone === "accent" ? brand.ink : "#fff";

  return (
    <Pressable
      onPress={onPress}
      disabled={busy}
      style={({ pressed }) => ({
        backgroundColor: bg,
        opacity: busy ? 0.6 : pressed ? 0.85 : 1,
        borderRadius: 999,
        paddingVertical: 14,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 8,
      })}
    >
      {busy ? <ActivityIndicator color={fg} size="small" /> : null}
      <Text style={{ color: fg, fontWeight: "700", fontSize: 15 }}>{label}</Text>
    </Pressable>
  );
}

export function Pill({ label, color }: { label: string; color: string }) {
  return (
    <View
      style={{
        backgroundColor: `${color}1A`,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 4,
        alignSelf: "flex-start",
      }}
    >
      <Text style={{ color, fontSize: 12, fontWeight: "700" }}>{label}</Text>
    </View>
  );
}

export function Loading({ label }: { label: string }) {
  return (
    <View style={{ padding: 32, alignItems: "center", gap: 12 }}>
      <ActivityIndicator color={brand.primary} />
      <Text style={{ color: palette.light.textMuted, fontSize: 14 }}>{label}</Text>
    </View>
  );
}

export function Notice({ text, tone = "info" }: { text: string; tone?: "info" | "warning" }) {
  const color = tone === "warning" ? brand.warning : brand.leaf;
  return (
    <View
      style={{
        backgroundColor: `${color}1A`,
        borderRadius: 12,
        padding: 12,
        marginHorizontal: 20,
        marginTop: 12,
      }}
    >
      <Text style={{ color, fontSize: 13, lineHeight: 19 }}>{text}</Text>
    </View>
  );
}
