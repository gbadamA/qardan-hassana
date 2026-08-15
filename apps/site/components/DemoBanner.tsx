import { AlertTriangle } from "lucide-react";
import { IS_DEMO_CONTENT, type SiteUi } from "@/content";

/**
 * Bandeau d'honnêteté. Les chiffres, articles et rapports du site sont pour l'instant
 * des placeholders : tant que le client n'a pas fourni ses contenus réels, le site ne
 * doit pas se faire passer pour publiable.
 *
 * ➜ Disparaît en basculant `IS_DEMO_CONTENT` à `false` dans `content/shared.ts`.
 */
export function DemoBanner({ ui }: { ui: SiteUi }) {
  if (!IS_DEMO_CONTENT) return null;

  return (
    <div className="border-b border-warning/30 bg-warning/10 print:hidden">
      <div className="container-content flex items-start gap-3 py-2.5 text-caption text-warning">
        <AlertTriangle className="mt-px h-4 w-4 shrink-0" aria-hidden />
        <p>
          <strong className="font-semibold">{ui.demoBanner.title}</strong> {ui.demoBanner.text}{" "}
          <code className="ltr-nums">apps/site/content/</code>
        </p>
      </div>
    </div>
  );
}
