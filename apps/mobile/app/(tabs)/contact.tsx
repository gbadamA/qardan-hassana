import { Linking, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { CONTACTS, CONTACTS_CONFIGURED, ORG } from "@qardan/shared";
import { brand, palette } from "@qardan/design-tokens";
import { useLocale } from "@/lib/locale";
import { Card, GradientHeader, Notice, Screen } from "@/components/ui";

/**
 * Contact — exigence du §5 du cahier des charges : « coordonnées du PCA, Secrétaire
 * Exécutif, Trésorier ; localisation ».
 *
 * ⚠️ Les trois responsables, pas seulement le PCA comme sur l'accueil. Chacun a un rôle
 * distinct : on n'appelle pas le Trésorier pour une question d'adhésion.
 *
 * ⚠️ Pas de carte intégrée, et c'est délibéré — même position que le site. L'adresse
 * exacte du siège n'est pas encore arrêtée (point ouvert du cahier). Épingler un point
 * approximatif enverrait des gens à une mauvaise porte : un quartier annoncé comme tel
 * est plus honnête qu'un plan faux. Le bouton ouvre donc une RECHERCHE dans l'application
 * de cartes, qui deviendra précise le jour où `dict.org.address` le sera.
 */
export default function ContactScreen() {
  const { dict, ui } = useLocale();

  const appeler = (phone: string) => void Linking.openURL(`tel:${phone}`);

  const whatsapp = (phone: string) => {
    // `wa.me` n'accepte que des chiffres : ni « + », ni espaces.
    const digits = phone.replace(/\D/g, "");
    void Linking.openURL(`https://wa.me/${digits}`);
  };

  const ouvrirCarte = () => {
    const requete = encodeURIComponent(`${ORG.name} ${dict.org.address}`);
    // Schéma natif sur iOS, `geo:` sur Android — les deux ouvrent l'app de cartes
    // installée plutôt que le navigateur.
    const url = Platform.select({
      ios: `maps:0,0?q=${requete}`,
      android: `geo:0,0?q=${requete}`,
      default: `https://www.openstreetmap.org/search?query=${requete}`,
    });
    void Linking.openURL(url);
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <GradientHeader title={ui.contact.title} subtitle={ui.contact.lead} />

        {!CONTACTS_CONFIGURED ? <Notice text={ui.contact.notConfigured} tone="warning" /> : null}

        <View style={{ padding: 20, gap: 16 }}>
          {CONTACTS.map((c) => (
            <Card key={c.role}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: brand.leaf }}>
                {dict.contactRoles[c.role].title}
              </Text>
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: "800",
                  color: palette.light.text,
                  marginTop: 4,
                }}
              >
                {c.name}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: palette.light.textMuted,
                  marginTop: 6,
                  lineHeight: 19,
                }}
              >
                {dict.contactRoles[c.role].short}
              </Text>

              {/* Numéro toujours lu de gauche à droite, même en arabe. */}
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "700",
                  color: palette.light.text,
                  marginTop: 12,
                  writingDirection: "ltr",
                }}
              >
                {c.phoneDisplay}
              </Text>

              <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
                <ActionButton label={ui.contact.call} onPress={() => appeler(c.phone)} primary />
                <ActionButton label={ui.contact.whatsapp} onPress={() => whatsapp(c.phone)} />
              </View>
            </Card>
          ))}

          {/* Localisation */}
          <Card>
            <Text style={{ fontSize: 15, fontWeight: "800", color: palette.light.text }}>
              {ui.contact.whereTitle}
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: palette.light.textMuted,
                marginTop: 8,
                lineHeight: 21,
              }}
            >
              {dict.org.address}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: palette.light.textMuted,
                marginTop: 8,
                lineHeight: 18,
                fontStyle: "italic",
              }}
            >
              {ui.contact.addressPending}
            </Text>
            <View style={{ marginTop: 12 }}>
              <ActionButton label={ui.contact.openMap} onPress={ouvrirCarte} primary />
            </View>
          </Card>

          {/* Écrire */}
          <Card>
            <Text style={{ fontSize: 15, fontWeight: "800", color: palette.light.text }}>
              {ui.contact.writeTitle}
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: palette.light.textMuted,
                marginTop: 8,
                writingDirection: "ltr",
              }}
            >
              {ORG.email}
            </Text>
            <View style={{ marginTop: 12 }}>
              <ActionButton
                label={ui.contact.sendEmail}
                onPress={() => void Linking.openURL(`mailto:${ORG.email}`)}
                primary
              />
            </View>
          </Card>

          <Text
            style={{
              fontSize: 12,
              color: palette.light.textMuted,
              lineHeight: 18,
              textAlign: "center",
            }}
          >
            {dict.org.legal}
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

/** Bouton d'action compact — plusieurs tiennent sur une ligne dans une carte. */
function ActionButton({
  label,
  onPress,
  primary = false,
}: {
  label: string;
  onPress: () => void;
  primary?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => ({
        flex: 1,
        borderRadius: 999,
        paddingVertical: 11,
        alignItems: "center",
        backgroundColor: primary ? brand.primary : palette.light.surface,
        borderWidth: primary ? 0 : 1,
        borderColor: palette.light.border,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <Text
        style={{
          color: primary ? "#fff" : palette.light.text,
          fontWeight: "700",
          fontSize: 14,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
