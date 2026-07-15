"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import styleConfig from "@/src/app/style/style.json";

const ThemeContext = createContext(null);

const COLOR_THEME_STORAGE_KEY = "app-color-theme";
const THEME_INITIALIZED_KEY = "app-theme-initialized";

const themeKeys = Object.keys(styleConfig.themes || {});
const fallbackThemeKey = "jobAppRuby"; // Red theme as default

const applyThemeToDocument = (colorThemeKey) => {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;
  const selectedTheme = styleConfig.themes?.[colorThemeKey] || styleConfig.themes?.[fallbackThemeKey];
  const colorMap = styleConfig.cssVariableMap || {};

  if (selectedTheme?.colors) {
    Object.entries(colorMap).forEach(([colorName, cssVariableName]) => {
      const value = selectedTheme.colors[colorName];
      if (value) {
        root.style.setProperty(cssVariableName, value);
      }
    });

    // Apply all theme colors as CSS variables
    Object.entries(selectedTheme.colors).forEach(([colorName, value]) => {
      const cssVarName = `--${colorName}`;
      root.style.setProperty(cssVarName, value);
    });
  }

  root.dataset.colorTheme = colorThemeKey;
};

// Initialize theme from localStorage before React renders (SSR safe)
const initializeThemeSync = () => {
  if (typeof window === "undefined") {
    return fallbackThemeKey;
  }

  try {
    const storedColorTheme = window.localStorage.getItem(COLOR_THEME_STORAGE_KEY);
    if (styleConfig.themes?.[storedColorTheme]) {
      applyThemeToDocument(storedColorTheme);
      return storedColorTheme;
    }
  } catch (e) {
    console.warn("Failed to load theme from localStorage:", e);
  }

  applyThemeToDocument(fallbackThemeKey);
  return fallbackThemeKey;
};

export const ThemeProvider = ({ children }) => {
  const [colorTheme, setColorTheme] = useState(() => {
    // Initialize synchronously from localStorage if available
    if (typeof window !== "undefined") {
      return window.localStorage.getItem(COLOR_THEME_STORAGE_KEY) || fallbackThemeKey;
    }
    return fallbackThemeKey;
  });

  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") {
      setMounted(true);
      setIsLoading(false);
      return;
    }

    // Mark as loading while theme initializes
    setIsLoading(true);

    // Apply theme immediately
    const storedColorTheme = window.localStorage.getItem(COLOR_THEME_STORAGE_KEY) || fallbackThemeKey;
    if (storedColorTheme !== colorTheme) {
      setColorTheme(storedColorTheme);
    }

    applyThemeToDocument(storedColorTheme);
    setMounted(true);

    // Small delay to ensure smooth transition
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === "undefined") {
      return;
    }

    applyThemeToDocument(colorTheme);
    try {
      window.localStorage.setItem(COLOR_THEME_STORAGE_KEY, colorTheme);
    } catch (e) {
      console.warn("Failed to save theme to localStorage:", e);
    }
  }, [colorTheme, mounted]);

  const setColorThemeWithSave = useCallback((newTheme) => {
    setColorTheme(newTheme);
  }, []);

  const themeOptions = useMemo(() => {
    return Object.entries(styleConfig.themes || {}).map(([key, value]) => ({
      key,
      name: value.name,
      description: value.description,
      colors: value.colors,
    }));
  }, []);

  const activeTheme = styleConfig.themes?.[colorTheme] || styleConfig.themes?.[fallbackThemeKey];

  const value = {
    colorTheme,
    setColorTheme: setColorThemeWithSave,
    themeOptions,
    activeTheme,
    mounted,
    isLoading,
    theme: "light", // Always light mode
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

// Export sync initialization for script injection
export { initializeThemeSync, applyThemeToDocument };

export { ThemeContext };
