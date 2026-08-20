import { useState } from "react";
import { Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import {
  MIN_AMOUNT,
  PAYMENT_METHODS,
  PROGRAMS,
  SUGGESTED_AMOUNTS,
  donationIntentSchema,
  formatMoney,
  impactTierOf,
  isProgramSlug,
  translateError,
  type PaymentMethodId,
  type ProgramSlug,
} from "@qardan/shared";
import { brand, palette } from "@qardan/design-tokens";
import { useLocale } from "@/lib/locale";
import { getSupabase, isConfigured } from "@/lib/supabase";
import {
  Card,
  Choice,
  GradientHeader,
  Notice,
  PrimaryButton,
  Screen,
  formStyles as styles,
} from "@/components/ui";

/**
 * Don depuis le mobile.
 *
 * ⚠️ Le parcours est le MÊME que sur le site, et pour la même raison : le don est une
 * PREUVE, pas un encaissement. L'app enregistre une intention et rend une référence ;
 * le versement se fait ensuite depuis l'application Mobile Money de l'opérateur.
 *
 * ⚠️ La validation Zod est celle de `@qardan/shared` — donc rigoureusement identique à
 * celle du site et à celle rejouée côté serveur. Les messages sont des CLÉS traduites
 * ici : le schéma ne connaît pas la langue de l'utilisateur.
 */
export default function DonateScreen() {
  const { locale, dict, ui } = useLocale();
  const params = useLocalSearchParams<{ programme?: string }>();

  const preselected =
    params.programme && isProgramSlug(params.programme) ? params.programme : null;

  const [amount, setAmount] = useState<number>(5000);
  const [customAmount, setCustomAmount] = useState("");
  const [program, setProgram] = useState<ProgramSlug | null>(preselected);
  const [method, setMethod] = useState<PaymentMethodId>("orange-money");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [anonymous, setAnonymous] = useState(false);

  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);

  const effectiveAmount = customAmount ? Number(customAmount) || 0 : amount;

  async function submit() {
    setGlobalError(null);

    const parsed = donationIntentSchema.safeParse({
      amount: effectiveAmount,
      program,
      frequency: "ponctuel",
      method,
      donorName: name,
      donorPhone: phone,
      donorEmail: "",
      anonymous,
      message: "",
    });

    if (!parsed.success) {
      const out: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "_");
        if (!out[key]) out[key] = translateError(dict, issue.message);
      }
      setErrors(out);
      return;
    }

    setErrors({});

    if (!isConfigured()) {
      setGlobalError(ui.common.error);
      return;
    }

    setBusy(true);

    // Même RPC que le site : elle écrit et ne renvoie que la référence. Un client
    // anonyme n'a pas le droit de relire la table `donations` — et c'est voulu.
    const { data, error } = await getSupabase().rpc("submit_public_donation", {
      p_amount: parsed.data.amount,
      p_program: parsed.data.program,
      p_method: parsed.data.method,
      p_frequency: parsed.data.frequency,
      p_donor_name: parsed.data.donorName,
      p_donor_phone: parsed.data.donorPhone,
      p_donor_email: null,
      p_anonymous: parsed.data.anonymous,
      p_message: null,
    });

    setBusy(false);

    if (error) {
      setGlobalError(error.message);
      return;
    }
    setReference(String(data));
  }

  if (reference) {
    return (
      <Screen>
        <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
          <GradientHeader title={ui.donate.successTitle} subtitle={ui.donate.successLead} />
          <View style={{ padding: 20, gap: 16 }}>
            <Card>
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "800",
                  color: brand.primary,
                  textAlign: "center",
                  letterSpacing: 1,
                }}
              >
                {reference}
              </Text>
            </Card>

            <Notice text={`${ui.donate.notPaid} ${dict.paymentInstructions[method]}`} tone="warning" />

            <Text style={{ fontSize: 13, color: palette.light.textMuted, lineHeight: 20 }}>
              {ui.donate.keepRef}
            </Text>

            <PrimaryButton
              label={ui.donate.again}
              onPress={() => {
                setReference(null);
                setName("");
                setPhone("");
              }}
            />
          </View>
        </ScrollView>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <GradientHeader title={ui.donate.title} subtitle={ui.donate.lead} />

        <View style={{ padding: 20, gap: 20 }}>
          {/* Montant */}
          <View>
            <Text style={styles.label}>{ui.donate.amount}</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {SUGGESTED_AMOUNTS.map((value) => {
                const active = !customAmount && amount === value;
                return (
                  <Pressable
                    key={value}
                    onPress={() => {
                      setAmount(value);
                      setCustomAmount("");
                    }}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: active ? brand.accent : palette.light.border,
                      backgroundColor: active ? `${brand.accent}1A` : palette.light.surface,
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: "700",
                        fontSize: 14,
                        color: active ? brand.accentHover : palette.light.text,
                      }}
                    >
                      {formatMoney(value, locale)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <TextInput
              value={customAmount}
              onChangeText={setCustomAmount}
              placeholder={ui.donate.other}
              placeholderTextColor={palette.light.textMuted}
              keyboardType="number-pad"
              style={[styles.input, { marginTop: 10 }]}
            />
            {errors.amount ? <Text style={styles.error}>{errors.amount}</Text> : null}

            <Text style={{ fontSize: 13, color: brand.primary, marginTop: 10, lineHeight: 19 }}>
              {ui.donate.impact} : {dict.impact[impactTierOf(effectiveAmount)]}.
            </Text>
          </View>

          {/* Programme */}
          <View>
            <Text style={styles.label}>{ui.donate.program}</Text>
            <View style={{ gap: 8 }}>
              <Choice
                label={ui.donate.general}
                active={program === null}
                onPress={() => setProgram(null)}
              />
              {PROGRAMS.map((p) => (
                <Choice
                  key={p.slug}
                  label={dict.programs[p.slug].name}
                  color={p.color}
                  active={program === p.slug}
                  onPress={() => setProgram(p.slug)}
                />
              ))}
            </View>
          </View>

          {/* Moyen de paiement */}
          <View>
            <Text style={styles.label}>{ui.donate.method}</Text>
            <View style={{ gap: 8 }}>
              {PAYMENT_METHODS.map((m) => (
                <Choice
                  key={m.id}
                  label={dict.paymentMethods[m.id].label}
                  hint={dict.paymentMethods[m.id].hint}
                  active={method === m.id}
                  onPress={() => setMethod(m.id)}
                />
              ))}
            </View>
          </View>

          {/* Coordonnées */}
          <View style={{ gap: 12 }}>
            <View>
              <Text style={styles.label}>{ui.donate.name}</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder={dict.fields.fullNamePlaceholder}
                placeholderTextColor={palette.light.textMuted}
                style={styles.input}
              />
              {errors.donorName ? <Text style={styles.error}>{errors.donorName}</Text> : null}
            </View>

            <View>
              <Text style={styles.label}>{ui.donate.phone}</Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder={dict.fields.phonePlaceholder}
                placeholderTextColor={palette.light.textMuted}
                keyboardType="phone-pad"
                style={styles.input}
              />
              {errors.donorPhone ? <Text style={styles.error}>{errors.donorPhone}</Text> : null}
            </View>

            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Switch
                value={anonymous}
                onValueChange={setAnonymous}
                trackColor={{ true: brand.leaf, false: palette.light.border }}
              />
              <Text style={{ fontSize: 14, color: palette.light.text }}>{ui.donate.anonymous}</Text>
            </View>
          </View>

          {globalError ? <Text style={styles.error}>{globalError}</Text> : null}

          <PrimaryButton
            label={busy ? ui.donate.submitting : ui.donate.submit}
            busy={busy}
            tone="accent"
            onPress={submit}
          />

          <Text style={{ fontSize: 12, color: palette.light.textMuted, lineHeight: 18 }}>
            {formatMoney(MIN_AMOUNT, locale)} minimum.
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}
