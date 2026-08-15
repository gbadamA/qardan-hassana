import {
  Activity,
  BookOpen,
  Download,
  FileCheck2,
  HeartHandshake,
  Leaf,
  MapPin,
  Receipt,
  Scale,
  ScrollText,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

/**
 * Table d'icônes explicite. Les contenus (`content/*.ts`, `@qardan/shared`) désignent une
 * icône par son NOM, pour rester sérialisables et migrables vers la base de données en
 * Phase 1 — mais on n'importe ici que celles réellement utilisées, pour ne pas embarquer
 * les ~1500 icônes de lucide dans le bundle.
 */
const ICONS: Record<string, LucideIcon> = {
  Activity,
  BookOpen,
  Download,
  FileCheck2,
  HeartHandshake,
  Leaf,
  MapPin,
  Receipt,
  Scale,
  ScrollText,
  ShieldCheck,
};

export function Icon({ name, className }: { name: string; className?: string }) {
  const Cmp = ICONS[name] ?? HeartHandshake;
  return <Cmp className={className} aria-hidden />;
}
