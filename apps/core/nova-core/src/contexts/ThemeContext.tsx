import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
// @ts-ignore - design-tokens provides JS build without types
import { colors, themeCSS, themeUtils } from '@nova-universe/design-tokens';

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
    try {
      const stored = localStorage.getItem('theme-mode');
      return (stored as ThemeMode) || 'system';
    } catch {
      return 'system';
    }
  });

  const [isDark, setIsDark] = useState(false);
  const styleTagRef = useRef<HTMLStyleElement | null>(null);

  useEffect(() => {
    // Inject theme CSS once
    if (!styleTagRef.current) {
      const styleTag = document.createElement('style');
      styleTag.setAttribute('id', 'nova-theme-css');
      styleTag.textContent = themeCSS;
      document.head.appendChild(styleTag);
      styleTagRef.current = styleTag;
    }

    const applyMode = () => {
      // Set data-theme and manage dark class via utilities
      const mapped = mode === 'system' ? 'auto' : (mode as 'light' | 'dark');
      themeUtils.setTheme(mapped);

      const effective = themeUtils.getEffectiveTheme();
      const shouldBeDark = effective === 'dark';
      setIsDark(shouldBeDark);

      // Update meta theme-color for iOS/Safari chrome coherence
      const metaTheme = document.querySelector('meta[name="theme-color"]');
      if (metaTheme) {
        metaTheme.setAttribute('content', shouldBeDark ? colors.neutral[900] : colors.neutral[50]);
      }
    };

    applyMode();

    if (mode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyMode();
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
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
