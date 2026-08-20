import { useCallback, useEffect, useState } from "react";
import { RefreshControl, ScrollView, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { ORG, formatDate, formatMoney } from "@qardan/shared";
import { brand, palette } from "@qardan/design-tokens";
import { useLocale } from "@/lib/locale";
import {
  ajouterDon,
  lireDons,
  rafraichir,
  retirerDon,
  type DonSuivi,
} from "@/lib/mes-dons";
import {
  Card,
  GradientHeader,
  Loading,
  Notice,
  PrimaryButton,
  Screen,
  formStyles as styles,
} from "@/components/ui";

/**
 * « Mes dons » — exigence du §5 du cahier des charges.
 *
 * ⚠️ Sans compte, par choix : l'historique vit sur cet appareil. On le DIT à
 * l'utilisateur au lieu de le laisser croire à un espace personnel synchronisé — il
 * perdrait sa liste en changeant de téléphone sans comprendre pourquoi.
 *
 * ⚠️ Un reçu n'est proposé que pour un don VALIDÉ. Émettre un justificatif pour une
 * somme que l'ONG n'a pas encaissée serait une fausse attestation, et le donateur
 * pourrait s'en servir de bonne foi.
 */
export default function MyDonationsScreen() {
  const { locale, dict, ui } = useLocale();
  const router = useRouter();

  const [dons, setDons] = useState<DonSuivi[]>([]);
  const [chargement, setChargement] = useState(true);
  const [refresh, setRefresh] = useState(false);

  // Ajout manuel : un don fait depuis le site, ou depuis un autre téléphone.
  const [ref, setRef] = useState("");
  const [tel, setTel] = useState("");
  const [erreurAjout, setErreurAjout] = useState<string | null>(null);
  const [ajoutEnCours, setAjoutEnCours] = useState(false);

  const charger = useCallback(async () => {
    const locaux = await lireDons();
    setDons(await rafraichir(locaux));
    setChargement(false);
    setRefresh(false);
  }, []);

  useEffect(() => {
    void charger();
  }, [charger]);

  async function ajouterManuellement() {
    setErreurAjout(null);
    if (!ref.trim() || tel.replace(/\D/g, "").length < 8) {
      setErreurAjout(ui.myDonations.addInvalid);
      return;
    }

    setAjoutEnCours(true);

    // On VÉRIFIE avant d'enregistrer : ajouter une ligne qui n'existe pas côté serveur
    // remplirait l'écran d'entrées « inconnu » sans que l'utilisateur sache pourquoi.
    const [teste] = await rafraichir([
      {
        reference: ref.trim().toUpperCase(),
        phone: tel.trim(),
        amount: 0,
        program: null,
        method: "orange-money",
        createdAt: new Date().toISOString(),
      },
    ]);

    setAjoutEnCours(false);

    // ⚠️ `const [x] = tableau` ne garantit rien au type : `rafraichir` renvoie autant
    // d'éléments qu'on lui en donne, mais TypeScript l'ignore. On vérifie.
    if (!teste || teste.status === "inconnu") {
      setErreurAjout(ui.myDonations.addNotFound);
      return;
    }

    await ajouterDon({
      reference: teste.reference,
      phone: tel.trim(),
      amount: teste.amount,
      program: teste.program,
      method: teste.method,
      createdAt: teste.createdAt,
    });
    setRef("");
    setTel("");
    void charger();
  }

  async function partagerRecu(don: DonSuivi) {
    const html = recuHtml(don, locale, dict, ui);
    const { uri } = await Print.printToFileAsync({ html });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: ui.myDonations.receipt,
        UTI: "com.adobe.pdf",
      });
    }
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refresh}
            onRefresh={() => {
              setRefresh(true);
              void charger();
            }}
          />
        }
      >
        <GradientHeader title={ui.myDonations.title} subtitle={ui.myDonations.lead} />

        <Notice text={ui.myDonations.deviceOnly} tone="warning" />

        <View style={{ padding: 20, gap: 16 }}>
          {chargement ? <Loading label={ui.common.loading} /> : null}

          {!chargement && dons.length === 0 ? (
            <Text style={{ fontSize: 14, color: palette.light.textMuted, lineHeight: 21 }}>
              {ui.myDonations.empty}
            </Text>
          ) : null}

          {dons.map((d) => {
            const teinte =
              d.status === "valide"
                ? brand.leaf
                : d.status === "rejete"
                  ? brand.danger
                  : brand.warning;

            return (
              <Card key={d.reference} style={{ borderStartWidth: 4, borderStartColor: teinte }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "800",
                    color: palette.light.text,
                    writingDirection: "ltr",
                  }}
                >
                  {d.reference}
                </Text>

                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "800",
                    color: brand.primary,
                    marginTop: 6,
                    writingDirection: "ltr",
                  }}
                >
                  {formatMoney(d.amount, locale)}
                </Text>

                <Text style={{ fontSize: 13, color: palette.light.textMuted, marginTop: 6 }}>
                  {d.program ? dict.programs[d.program].name : ui.donate.general}
                  {" · "}
                  {dict.paymentMethods[d.method].label}
                </Text>

                <Text
                  style={{
                    fontSize: 12,
                    color: palette.light.textMuted,
                    marginTop: 4,
                    writingDirection: "ltr",
                  }}
                >
                  {formatDate(d.createdAt, locale)}
                </Text>

                <Text style={{ fontSize: 13, fontWeight: "700", color: teinte, marginTop: 10 }}>
                  {ui.myDonations.statuses[d.status]}
                </Text>

                <View style={{ marginTop: 12, gap: 8 }}>
                  {d.status === "valide" ? (
                    <PrimaryButton
                      label={ui.myDonations.receipt}
                      onPress={() => void partagerRecu(d)}
                    />
                  ) : (
                    <Text
                      style={{ fontSize: 12, color: palette.light.textMuted, lineHeight: 18 }}
                    >
                      {ui.myDonations.receiptWhenValidated}
                    </Text>
                  )}

                  <PrimaryButton
                    label={ui.myDonations.forget}
                    tone="accent"
                    onPress={() => void retirerDon(d.reference).then(charger)}
                  />
                </View>
              </Card>
            );
          })}

          {/* Retrouver un don fait ailleurs */}
          <Card>
            <Text style={{ fontSize: 15, fontWeight: "800", color: palette.light.text }}>
              {ui.myDonations.addTitle}
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: palette.light.textMuted,
                marginTop: 6,
                lineHeight: 19,
              }}
            >
              {ui.myDonations.addLead}
            </Text>

            <View style={{ marginTop: 12, gap: 10 }}>
              <TextInput
                value={ref}
                onChangeText={setRef}
                placeholder="DON-2026-0001"
                placeholderTextColor={palette.light.textMuted}
                autoCapitalize="characters"
                style={styles.input}
              />
              <TextInput
                value={tel}
                onChangeText={setTel}
                placeholder="07 00 00 00 00"
                placeholderTextColor={palette.light.textMuted}
                keyboardType="phone-pad"
                style={styles.input}
              />
              {erreurAjout ? <Text style={styles.error}>{erreurAjout}</Text> : null}
              <PrimaryButton
                label={ajoutEnCours ? ui.myDonations.adding : ui.myDonations.add}
                busy={ajoutEnCours}
                onPress={() => void ajouterManuellement()}
              />
            </View>
          </Card>

          <PrimaryButton label={ui.common.close} onPress={() => router.back()} />
        </View>
      </ScrollView>
    </Screen>
  );
}

/**
 * Reçu au format HTML, converti en PDF par `expo-print`.
 *
 * ⚠️ Il porte la mention du numéro de transaction manquant et la date de validation :
 * un reçu d'ONG sert à justifier un versement, il doit dire QUAND l'argent a été
 * constaté reçu, pas quand le donateur a rempli le formulaire.
 */
function recuHtml(
  don: DonSuivi,
  locale: "fr" | "ar",
  dict: ReturnType<typeof useLocale>["dict"],
  ui: ReturnType<typeof useLocale>["ui"],
): string {
  const rtl = locale === "ar";
  const programme = don.program ? dict.programs[don.program].name : ui.donate.general;

  return `<!doctype html>
<html lang="${locale}" dir="${rtl ? "rtl" : "ltr"}">
  <head><meta charset="utf-8" />
    <style>
      body { font-family: -apple-system, Roboto, sans-serif; color: #0B1410; padding: 40px; }
      .entete { border-bottom: 3px solid #0F5C2E; padding-bottom: 16px; margin-bottom: 28px; }
      .org { font-size: 22px; font-weight: 800; color: #0F5C2E; }
      .legal { font-size: 11px; color: #566A5E; margin-top: 4px; }
      .titre { font-size: 17px; font-weight: 700; margin-bottom: 18px; }
      table { width: 100%; border-collapse: collapse; }
      td { padding: 9px 0; border-bottom: 1px solid #DBE7DE; font-size: 13px; }
      td.cle { color: #566A5E; width: 45%; }
      td.val { font-weight: 700; text-align: ${rtl ? "left" : "right"}; }
      .montant { font-size: 26px; font-weight: 800; color: #0F5C2E; margin: 24px 0; text-align: center; }
      .pied { margin-top: 34px; font-size: 11px; color: #566A5E; line-height: 1.6; }
      /* Références et montants : toujours de gauche à droite, même en arabe. */
      .ltr { direction: ltr; unicode-bidi: isolate; display: inline-block; }
    </style>
  </head>
  <body>
    <div class="entete">
      <div class="org">${ORG.name}</div>
      <div class="legal">${dict.org.legal}</div>
    </div>

    <div class="titre">${ui.myDonations.receiptTitle}</div>

    <div class="montant ltr">${formatMoney(don.amount, locale)}</div>

    <table>
      <tr><td class="cle">${ui.myDonations.receiptRef}</td>
          <td class="val"><span class="ltr">${don.reference}</span></td></tr>
      <tr><td class="cle">${ui.donate.program}</td><td class="val">${programme}</td></tr>
      <tr><td class="cle">${ui.donate.method}</td>
          <td class="val">${dict.paymentMethods[don.method].label}</td></tr>
      <tr><td class="cle">${ui.myDonations.receiptDeclared}</td>
          <td class="val"><span class="ltr">${formatDate(don.createdAt, locale)}</span></td></tr>
      <tr><td class="cle">${ui.myDonations.receiptValidated}</td>
          <td class="val"><span class="ltr">${
            don.validatedAt ? formatDate(don.validatedAt, locale) : "—"
          }</span></td></tr>
    </table>

    <div class="pied">${ui.myDonations.receiptFooter}</div>
  </body>
</html>`;
}
