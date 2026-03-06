"use client";

import { Moon, Sun } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { useTheme } from "@/components/theme-provider";

export default function ThemeToggleWithIcon() {
  const { theme, setTheme } = useTheme();

  const isDark = theme === "dark";

  return (
    <Toggle
      id="theme-toggle"
      aria-label="Chuyen giao dien sang toi"
      variant="outline"
      size="lg"
      pressed={isDark}
      onPressedChange={(pressed) => setTheme(pressed ? "dark" : "light")}
      className="w-full justify-start gap-3 px-4"
    >
      {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      <span>{isDark ? "Đang dùng giao diện tối" : "Đang dùng giao diện sáng"}</span>
    </Toggle>
  );
}