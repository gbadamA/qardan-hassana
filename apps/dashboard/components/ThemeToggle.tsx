"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";

/** Le libellé décrit l'ACTION (« passer en clair »), pas l'état courant. */
export function ThemeToggle({ labels }: { labels: { toLight: string; toDark: string } }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  const label = isDark ? labels.toLight : labels.toDark;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-light-border text-light-muted transition-colors hover:border-leaf hover:text-primary dark:border-dark-border dark:text-dark-muted dark:hover:text-leaf"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
