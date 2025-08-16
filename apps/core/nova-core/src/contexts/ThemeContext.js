import React, { createContext, useContext, useEffect, useState } from 'react';
import { colors } from '@nova-universe/design-tokens';
const ThemeContext = createContext(undefined);
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
export const ThemeProvider = ({ children }) => {
    const [mode, setMode] = useState(() => {
        const stored = localStorage.getItem('theme-mode');
        return stored || 'system';
    });
    const [isDark, setIsDark] = useState(false);
    useEffect(() => {
        const updateTheme = () => {
            let shouldBeDark = false;
            if (mode === 'dark') {
                shouldBeDark = true;
            }
            else if (mode === 'light') {
                shouldBeDark = false;
            }
            else {
                shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            }
            setIsDark(shouldBeDark);
            if (shouldBeDark) {
                document.documentElement.classList.add('dark');
            }
            else {
                document.documentElement.classList.remove('dark');
            }
            // Minimal CSS var updates now handled in TS ThemeContext.tsx
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
    const setTheme = (theme) => {
        setMode(theme);
    };
    const toggleTheme = () => {
        if (mode === 'light') {
            setMode('dark');
        }
        else if (mode === 'dark') {
            setMode('system');
        }
        else {
            setMode('light');
        }
    };
    return (React.createElement(ThemeContext.Provider, { value: { mode, isDark, setTheme, toggleTheme } }, children));
};
