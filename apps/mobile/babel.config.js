/**
 * ⚠️ Deux pièges déjà payés sur asso-jeunes et mosquee-fitia :
 *
 *  1. Avec Reanimated 4, le plugin s'appelle **`react-native-worklets/plugin`**,
 *     PAS `react-native-reanimated/plugin` (qui n'existe plus).
 *  2. Il doit être le **DERNIER** de la liste, sans exception : il réécrit les
 *     fonctions worklet et doit voir le code déjà transformé par les autres plugins.
 */
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: ["react-native-worklets/plugin"],
  };
};
