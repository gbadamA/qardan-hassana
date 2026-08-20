import { Tabs } from "expo-router";
import { Text, View } from "react-native";
import { brand, palette } from "@qardan/design-tokens";
import { useLocale } from "@/lib/locale";

/**
 * Barre d'onglets.
 *
 * Icônes en caractères plutôt qu'une bibliothèque d'icônes : `lucide-react-native`
 * tirerait `react-native-svg` sur chaque écran pour quatre pictogrammes. Sur des
 * téléphones d'entrée de gamme, chaque milliseconde de démarrage compte.
 */
function TabIcon({ glyph, focused }: { glyph: string; focused: boolean }) {
  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.55 }}>{glyph}</Text>
    </View>
  );
}

export default function TabsLayout() {
  const { ui } = useLocale();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: brand.primary,
        tabBarInactiveTintColor: palette.light.textMuted,
        tabBarStyle: {
          backgroundColor: palette.light.surface,
          borderTopColor: palette.light.border,
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: ui.tabs.home,
          tabBarIcon: ({ focused }) => <TabIcon glyph="🏠" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="programmes"
        options={{
          title: ui.tabs.programs,
          tabBarIcon: ({ focused }) => <TabIcon glyph="🤝" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="actualites"
        options={{
          title: ui.tabs.news,
          tabBarIcon: ({ focused }) => <TabIcon glyph="📰" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="don"
        options={{
          title: ui.tabs.donate,
          tabBarIcon: ({ focused }) => <TabIcon glyph="💚" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="contact"
        options={{
          title: ui.tabs.contact,
          tabBarIcon: ({ focused }) => <TabIcon glyph="📞" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
