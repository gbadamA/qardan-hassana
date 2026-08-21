const { getDefaultConfig } = require("expo/metro-config");

/**
 * ⚠️ **Configuration Metro volontairement MINIMALE.**
 *
 * Ne pas ajouter de `watchFolders`, `nodeModulesPaths` ni `disableHierarchicalLookup`
 * « pour le monorepo » : Expo gère les monorepos automatiquement depuis le SDK 52, et
 * c'est précisément une config manuelle de ce genre qui a cassé le bundle d'asso-jeunes
 * (« Unable to resolve ./Libraries/.../ActivityIndicator from react-native/index.js »).
 *
 * Ne pas non plus toucher à `unstable_enablePackageExports` : le passer à `false`
 * répare react-native mais casse gesture-handler.
 */
module.exports = getDefaultConfig(__dirname);
