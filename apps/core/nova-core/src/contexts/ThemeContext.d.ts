import React from 'react';
type ThemeMode = 'light' | 'dark' | 'system';
interface ThemeContextType {
  mode: ThemeMode;
  isDark: boolean;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}
export declare const useTheme: () => ThemeContextType;
interface ThemeProviderProps {
  children: React.ReactNode;
}
export declare const ThemeProvider: React.FC<ThemeProviderProps>;
export {};
//# sourceMappingURL=ThemeContext.d.ts.map
