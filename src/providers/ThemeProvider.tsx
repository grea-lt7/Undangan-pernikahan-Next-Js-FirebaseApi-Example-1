"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { fetchTheme } from "@/lib/api";
import type { ThemeMode } from "@/types/invitation";

interface ThemeProviderProps {
  children: ReactNode;
}

type Theme = ThemeMode;

interface ThemeContextValue {
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  const resolveTheme = useCallback((value: Theme) => {
    if (value !== "system") return value;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }, []);

  const setTheme = useCallback(
    (value: Theme) => {
      setThemeState(value);
      window.localStorage.setItem("wedding-theme", value);
      setResolvedTheme(resolveTheme(value));
    },
    [resolveTheme]
  );

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("wedding-theme");
    const initialTheme: Theme =
      storedTheme === "light" || storedTheme === "dark" || storedTheme === "system"
        ? storedTheme
        : "system";

    setThemeState(initialTheme);
    setResolvedTheme(resolveTheme(initialTheme));
    fetchTheme()
      .then((remoteTheme) => {
        if (remoteTheme?.mode !== "light" && remoteTheme?.mode !== "dark" && remoteTheme?.mode !== "system") return;
        setThemeState(remoteTheme.mode);
        setResolvedTheme(resolveTheme(remoteTheme.mode));
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "TimeoutError") {
          console.warn("Firebase tema tidak merespons; menggunakan tema perangkat.");
          return;
        }
        console.error("Gagal memuat tema undangan:", error);
      });
  }, [resolveTheme]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
  }, [resolvedTheme]);

  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => setResolvedTheme(resolveTheme("system"));
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [resolveTheme, theme]);

  const contextValue = useMemo(
    () => ({ resolvedTheme, setTheme }),
    [resolvedTheme, setTheme]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
