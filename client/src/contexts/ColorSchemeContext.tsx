import React, { createContext, useContext, useEffect, useState } from "react";

export type ColorScheme = "blue" | "green" | "purple" | "red";

interface ColorSchemeContextType {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
}

const ColorSchemeContext = createContext<ColorSchemeContextType | undefined>(undefined);

const colorSchemes = {
  blue: {
    primary: '#3b82f6',
    secondary: '#60a5fa',
    accent: '#2563eb',
  },
  green: {
    primary: '#10b981',
    secondary: '#34d399',
    accent: '#059669',
  },
  purple: {
    primary: '#a855f7',
    secondary: '#c084fc',
    accent: '#9333ea',
  },
  red: {
    primary: '#ef4444',
    secondary: '#f87171',
    accent: '#dc2626',
  },
};

export function ColorSchemeProvider({ children }: { children: React.ReactNode }) {
  const [colorScheme, setColorScheme] = useState<ColorScheme>(() => {
    const saved = localStorage.getItem('colorScheme');
    return (saved as ColorScheme) || 'blue';
  });

  useEffect(() => {
    localStorage.setItem('colorScheme', colorScheme);
    
    // Apply CSS variables
    const root = document.documentElement;
    const colors = colorSchemes[colorScheme];
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-secondary', colors.secondary);
    root.style.setProperty('--color-accent', colors.accent);
  }, [colorScheme]);

  return (
    <ColorSchemeContext.Provider value={{ colorScheme, setColorScheme }}>
      {children}
    </ColorSchemeContext.Provider>
  );
}

export function useColorScheme() {
  const context = useContext(ColorSchemeContext);
  if (!context) {
    throw new Error("useColorScheme must be used within ColorSchemeProvider");
  }
  return context;
}
