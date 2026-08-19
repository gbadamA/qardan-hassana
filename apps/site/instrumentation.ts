/**
 * ⚠️ TEMPORAIRE — instrumentation de diagnostic.
 *
 * Next masque le message des erreurs de rendu serveur en production (« The specific
 * message is omitted… ») et ne laisse qu'un `digest`. Le journal de build Vercel devient
 * alors illisible : on sait qu'une page échoue, pas pourquoi.
 *
 * `onRequestError` reçoit l'erreur ORIGINALE, y compris pendant la génération statique.
 * On la réémet en clair pour la lire dans le journal de build, puis ce fichier sera retiré.
 */
export async function onRequestError(
  error: unknown,
  request: unknown,
  context: unknown,
): Promise<void> {
  const e = error as Error;
  console.error("\n══════ ERREUR DE RENDU (diagnostic) ══════");
  console.error("contexte :", JSON.stringify(context));
  console.error("requête  :", JSON.stringify(request));
  console.error("message  :", e?.message);
  console.error("pile     :\n" + e?.stack);
  console.error("══════════════════════════════════════════\n");
}
