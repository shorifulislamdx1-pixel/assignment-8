"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

type Theme = "light" | "dark";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    document.documentElement.style.colorScheme = nextTheme;
    localStorage.setItem("booknook-theme", nextTheme);
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      onClick={toggleTheme}
      aria-label={
        mounted
          ? `Switch to ${theme === "dark" ? "light" : "dark"} theme`
          : "Toggle color theme"
      }
      title={
        mounted
          ? `Switch to ${theme === "dark" ? "light" : "dark"} theme`
          : "Toggle color theme"
      }
      className="rounded-full border-line/80 bg-surface/60 text-muted hover:text-ink"
    >
      {theme === "dark" ? <Sun /> : <Moon />}
    </Button>
  );
}
