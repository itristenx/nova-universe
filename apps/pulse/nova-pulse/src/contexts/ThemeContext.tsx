import React, { createContext, useContext, useEffect, useState } from 'react';
import { colors, fonts, spacing } from '@nova-universe/theme';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  mode: ThemeMode;
  isDark: boolean;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem('theme-mode');
    return (stored as ThemeMode) || 'system';
  });

  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const updateTheme = () => {
      let shouldBeDark = false;
      if (mode === 'dark') {
        shouldBeDark = true;
      } else if (mode === 'light') {
        shouldBeDark = false;
      } else {
        shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      setIsDark(shouldBeDark);
      if (shouldBeDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      // Inject design tokens as CSS variables at root
      Object.entries(colors).forEach(([key, value]) => {
        document.documentElement.style.setProperty(`--color-${key}`, value);
      });
      Object.entries(fonts).forEach(([key, value]) => {
        document.documentElement.style.setProperty(`--font-${key}`, Array.isArray(value) ? value.join(', ') : value);
      });
      Object.entries(spacing).forEach(([key, value]) => {
        document.documentElement.style.setProperty(`--spacing-${key}`, value);
      });
    };
    updateTheme();
    if (mode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', updateTheme);
      return () => mediaQuery.removeEventListener('change', updateTheme);
    }
  }, [mode]);

  useEffect(() => {
    localStorage.setItem('theme-mode', mode);
  }, [mode]);

  const setTheme = (theme: ThemeMode) => {
    setMode(theme);
  };

  const toggleTheme = () => {
    if (mode === 'light') {
      setMode('dark');
    } else if (mode === 'dark') {
      setMode('system');
    } else {
      setMode('light');
    }
  };

  return (
    <ThemeContext.Provider value={{ mode, isDark, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
