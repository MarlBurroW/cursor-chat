import { Switch } from "./ui/switch";
import { useThemeStore } from "@/stores/theme";
import { useEffect } from "react";
import { Moon, Sun } from "lucide-react";

export const ThemeToggle = () => {
  const { isDark, toggleTheme } = useThemeStore();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  return (
    <div className="flex items-center gap-2">
      <Sun className="h-4 w-4" />
      <Switch
        checked={isDark}
        onCheckedChange={toggleTheme}
        aria-label="Toggle theme"
      />
      <Moon className="h-4 w-4" />
    </div>
  );
};
