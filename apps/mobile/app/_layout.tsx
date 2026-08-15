import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { LocaleProvider } from "@/lib/locale";

/**
 * ⚠️ `expo-status-bar` est un COMPOSANT, pas un config plugin : ne jamais l'ajouter à
 * `app.json > plugins`, cela casse `expo export` (erreur recopiée depuis asso-jeunes
 * jusque dans mosquee-fitia — corrigée aux deux endroits, ne pas la réintroduire).
 */
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <LocaleProvider>
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="reglages"
              options={{ presentation: "modal", headerShown: false }}
            />
          </Stack>
        </LocaleProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
