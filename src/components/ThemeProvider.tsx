import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => (
  <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
    {children}
  </NextThemesProvider>
);

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground transition-colors"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
};
