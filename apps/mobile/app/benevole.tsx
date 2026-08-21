import { useState } from "react";
import { Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import {
  AVAILABILITIES,
  PROGRAMS,
  translateError,
  volunteerApplicationSchema,
  type Availability,
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
  useContentPadding,
} from "@/components/ui";

/**
 * Candidature bénévole / adhésion — exigence du §5 du cahier des charges.
 *
 * ⚠️ Le schéma Zod est celui de `@qardan/shared` : rigoureusement le même que sur le site
 * ET rejoué côté base par la fonction `submit_volunteer_application`. Une candidature
 * refusée ici l'est aussi là-bas, et pour la même raison.
 *
 * ⚠️ L'écriture passe par une RPC `security definer`, pas par un `insert()`. Un visiteur
 * anonyme n'a aucun droit de lecture sur `volunteer_applications` — et un `insert().select()`
 * exigerait de relire la ligne, ce que PostgREST refuserait sous un message trompeur.
 */
export default function VolunteerScreen() {
  const { dict, ui } = useLocale();

  // Marge basse : sans elle, le contenu passe sous la barre de geste du téléphone.
  const padBas = useContentPadding();
  const padBas32 = useContentPadding(32);
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [programs, setPrograms] = useState<ProgramSlug[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [skills, setSkills] = useState("");
  const [motivation, setMotivation] = useState("");
  const [wantsMembership, setWantsMembership] = useState(false);

  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);

  /** Bascule d'un élément dans une sélection multiple. */
  function toggle<T>(list: T[], value: T): T[] {
    return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
  }

  async function submit() {
    setGlobalError(null);

    const parsed = volunteerApplicationSchema.safeParse({
      fullName,
      phone,
      email,
      city,
      // Champ texte au clavier numérique : `Number("")` vaut 0, que le schéma refuse
      // avec « année de naissance invalide » — le bon message, pas un plantage.
      birthYear: Number(birthYear),
      programs,
      availability,
      skills,
      motivation,
      wantsMembership,
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

    const { data, error } = await getSupabase().rpc("submit_volunteer_application", {
      p_full_name: parsed.data.fullName,
      p_phone: parsed.data.phone,
      p_city: parsed.data.city,
      p_motivation: parsed.data.motivation,
      p_programs: parsed.data.programs,
      p_availability: parsed.data.availability,
      p_birth_year: parsed.data.birthYear,
      p_email: parsed.data.email || null,
      p_skills: parsed.data.skills || null,
      p_wants_membership: parsed.data.wantsMembership,
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
        <ScrollView contentContainerStyle={padBas32}>
          <GradientHeader title={ui.volunteer.successTitle} subtitle={ui.volunteer.successLead} />
          <View style={{ padding: 20, gap: 16 }}>
            <Card>
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "800",
                  color: brand.primary,
                  textAlign: "center",
                  letterSpacing: 1,
                  writingDirection: "ltr",
                }}
              >
                {reference}
              </Text>
            </Card>

            <Text style={{ fontSize: 13, color: palette.light.textMuted, lineHeight: 20 }}>
              {ui.volunteer.nextStep}
            </Text>

            <PrimaryButton label={ui.volunteer.backHome} onPress={() => router.replace("/(tabs)")} />
          </View>
        </ScrollView>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={padBas} keyboardShouldPersistTaps="handled">
        <GradientHeader title={ui.volunteer.title} subtitle={ui.volunteer.lead} />

        <View style={{ padding: 20, gap: 20 }}>
          <Field
            label={ui.volunteer.fullName}
            value={fullName}
            onChangeText={setFullName}
            error={errors.fullName}
            autoCapitalize="words"
          />

          <Field
            label={ui.volunteer.phone}
            value={phone}
            onChangeText={setPhone}
            error={errors.phone}
            keyboardType="phone-pad"
            placeholder="07 00 00 00 00"
          />

          <Field
            label={ui.volunteer.email}
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            hint={ui.volunteer.optional}
          />

          <Field
            label={ui.volunteer.city}
            value={city}
            onChangeText={setCity}
            error={errors.city}
            autoCapitalize="words"
          />

          <Field
            label={ui.volunteer.birthYear}
            value={birthYear}
            onChangeText={setBirthYear}
            error={errors.birthYear}
            keyboardType="number-pad"
            placeholder="1995"
          />

          {/* Programmes — sélection MULTIPLE : un bénévole peut servir sur deux terrains. */}
          <View>
            <Text style={styles.label}>{ui.volunteer.programs}</Text>
            <View style={{ gap: 8 }}>
              {PROGRAMS.map((p) => (
                <Choice
                  key={p.slug}
                  label={dict.programs[p.slug].name}
                  color={p.color}
                  active={programs.includes(p.slug)}
                  onPress={() => setPrograms((prev) => toggle(prev, p.slug))}
                />
              ))}
            </View>
            {errors.programs ? <Text style={styles.error}>{errors.programs}</Text> : null}
          </View>

          <View>
            <Text style={styles.label}>{ui.volunteer.availability}</Text>
            <View style={{ gap: 8 }}>
              {AVAILABILITIES.map((a) => (
                <Choice
                  key={a}
                  label={dict.availability[a]}
                  active={availability.includes(a)}
                  onPress={() => setAvailability((prev) => toggle(prev, a))}
                />
              ))}
            </View>
            {errors.availability ? <Text style={styles.error}>{errors.availability}</Text> : null}
          </View>

          <Field
            label={ui.volunteer.skills}
            value={skills}
            onChangeText={setSkills}
            error={errors.skills}
            hint={ui.volunteer.optional}
            multiline
          />

          <Field
            label={ui.volunteer.motivation}
            value={motivation}
            onChangeText={setMotivation}
            error={errors.motivation}
            hint={ui.volunteer.motivationHint}
            multiline
          />

          <Pressable
            onPress={() => setWantsMembership((v) => !v)}
            accessibilityRole="switch"
            accessibilityState={{ checked: wantsMembership }}
            style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
          >
            <Switch
              value={wantsMembership}
              onValueChange={setWantsMembership}
              trackColor={{ true: brand.leaf, false: palette.light.border }}
            />
            <Text style={{ flex: 1, fontSize: 14, color: palette.light.text, lineHeight: 20 }}>
              {ui.volunteer.membership}
            </Text>
          </Pressable>

          {globalError ? <Text style={styles.error}>{globalError}</Text> : null}

          <PrimaryButton
            label={busy ? ui.volunteer.submitting : ui.volunteer.submit}
            busy={busy}
            tone="accent"
            onPress={submit}
          />

          <Notice text={ui.volunteer.privacy} />
        </View>
      </ScrollView>
    </Screen>
  );
}

/** Champ de saisie avec libellé, aide facultative et message d'erreur. */
function Field({
  label,
  value,
  onChangeText,
  error,
  hint,
  multiline = false,
  ...input
}: {
  label: string;
  value: string;
  /**
   * ⚠️ Nommée `onChangeText` et non `onChange` : `TextInput` possède déjà une prop
   * `onChange` qui reçoit un ÉVÉNEMENT, pas une chaîne. Les deux signatures se
   * télescopaient et le typecheck refusait chaque appel.
   */
  onChangeText: (v: string) => void;
  error?: string;
  hint?: string;
  multiline?: boolean;
} & React.ComponentProps<typeof TextInput>) {
  return (
    <View>
      <Text style={styles.label}>
        {label}
        {hint ? (
          <Text style={{ fontWeight: "400", color: palette.light.textMuted }}> — {hint}</Text>
        ) : null}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={palette.light.textMuted}
        multiline={multiline}
        style={[
          styles.input,
          multiline ? { minHeight: 96, textAlignVertical: "top" as const } : null,
          error ? { borderColor: brand.danger } : null,
        ]}
        {...input}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}
