import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { I18nManager } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DEFAULT_LOCALE,
  getDictionary,
  isLocale,
  isRtl,
  type Dictionary,
  type Locale,
} from "@qardan/shared";
import { getMobileUi, type MobileUi } from "@/content";

const STORAGE_KEY = "qardan.locale";

type LocaleState = {
  locale: Locale;
  dict: Dictionary;
  ui: MobileUi;
  /** `true` tant que la préférence n'a pas été relue du stockage. */
  loading: boolean;
  setLocale: (next: Locale) => Promise<void>;
  /** Une bascule FR↔AR a été demandée mais exige un redémarrage de l'app. */
  needsRestart: boolean;
};

const LocaleContext = createContext<LocaleState>({
  locale: DEFAULT_LOCALE,
  dict: getDictionary(DEFAULT_LOCALE),
  ui: getMobileUi(DEFAULT_LOCALE),
  loading: true,
  setLocale: async () => {},
  needsRestart: false,
});

/**
 * Langue de l'application, persistée sur l'appareil.
 *
 * ⚠️ **Le RTL en React Native n'est pas comme sur le web.** Le web change de sens en
 * posant `dir="rtl"`, à chaud. En natif, `I18nManager.forceRTL()` ne prend effet
 * qu'au **redémarrage du processus** : la mise en page est décidée au démarrage par la
 * couche native, pas par React. Basculer en arabe sans relancer donne une interface
 * moitié LTR moitié RTL — pire que pas de RTL du tout.
 *
 * On assume donc le comportement : on enregistre la préférence, on demande le
 * basculement natif, et on prévient l'utilisateur que l'app doit redémarrer. Aucun
 * `RNRestart` ici : cette bibliothèque ne fonctionne pas dans Expo Go, et une app qui
 * se tue elle-même passe pour un plantage.
 */
export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [loading, setLoading] = useState(true);
  const [needsRestart, setNeedsRestart] = useState(false);

  useEffect(() => {
    let cancelled = false;

    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (cancelled) return;
        const next = stored && isLocale(stored) ? stored : DEFAULT_LOCALE;
        setLocaleState(next);

        // Aligner la couche native sur la préférence enregistrée, au démarrage —
        // c'est le seul moment où `forceRTL` produit un résultat cohérent.
        const shouldBeRtl = isRtl(next);
        if (I18nManager.isRTL !== shouldBeRtl) {
          I18nManager.allowRTL(shouldBeRtl);
          I18nManager.forceRTL(shouldBeRtl);
        }
      })
      .catch(() => {
        /* stockage indisponible : on reste en français */
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const setLocale = useCallback(
    async (next: Locale) => {
      if (next === locale) return;
      await AsyncStorage.setItem(STORAGE_KEY, next);
      setLocaleState(next);

      const shouldBeRtl = isRtl(next);
      if (I18nManager.isRTL !== shouldBeRtl) {
        I18nManager.allowRTL(shouldBeRtl);
        I18nManager.forceRTL(shouldBeRtl);
        setNeedsRestart(true);
      }
    },
    [locale],
  );

  return (
    <LocaleContext.Provider
      value={{
        locale,
        dict: getDictionary(locale),
        ui: getMobileUi(locale),
        loading,
        setLocale,
        needsRestart,
      }}
    >
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
