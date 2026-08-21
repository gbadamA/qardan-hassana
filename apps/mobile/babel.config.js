/**
 * ⚠️ NativeWind a été RETIRÉ (2026-08-20).
 *
 * Il était câblé ici via `jsxImportSource: "nativewind"`, ce qui faisait passer CHAQUE
 * élément JSX de l'application par son runtime — alors que le code n'utilisait pas une
 * seule classe `className`. Du risque au démarrage, sans le moindre bénéfice.
 * L'app style tout par objets `style` et jetons partagés (`@qardan/design-tokens`).
 *
 * ⚠️ Deux pièges déjà payés sur asso-jeunes et mosquee-fitia, toujours valables :
 *  1. Avec Reanimated 4, le plugin s'appelle **`react-native-worklets/plugin`**,
 *     PAS `react-native-reanimated/plugin` (qui n'existe plus).
 *  2. Il doit être le **DERNIER** de la liste, sans exception : il réécrit les
 *     fonctions worklet et doit voir le code déjà transformé par les autres plugins.
 */
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: ["react-native-worklets/plugin"],
  };
};
