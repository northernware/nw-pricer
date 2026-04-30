"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-8 h-8" />;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="w-10 h-10 flex items-center justify-center border border-nw-graphite/20 hover:border-nw-acid transition-colors group"
      aria-label="Toggle theme"
    >
      <span
        className="iconify text-lg text-nw-graphite group-hover:text-nw-acid"
        data-icon={theme === "dark" ? "solar:sun-linear" : "solar:moon-linear"}
        suppressHydrationWarning
      ></span>
    </button>
  );
}
