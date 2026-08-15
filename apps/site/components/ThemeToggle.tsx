"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";

export function ThemeToggle({
  labels,
  onDark = false,
}: {
  labels: { toLight: string; toDark: string; lightMode: string; darkMode: string };
  onDark?: boolean;
}) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? labels.toLight : labels.toDark}
      title={isDark ? labels.lightMode : labels.darkMode}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
        onDark
          ? "border-white/25 text-white hover:bg-white/15"
          : "border-light-border text-light-muted hover:border-leaf hover:text-primary dark:border-dark-border dark:text-dark-muted dark:hover:text-leaf"
      }`}
    >
      {isDark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
    </button>
  );
}
