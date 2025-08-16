import React from 'react';
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui';
export const _ThemeToggle = () => {
    const { mode, toggleTheme } = useTheme();
    const getIcon = () => {
        switch (mode) {
            case 'light':
                return React.createElement(SunIcon, { className: "h-5 w-5" });
            case 'dark':
                return React.createElement(MoonIcon, { className: "h-5 w-5" });
            case 'system':
                return React.createElement(ComputerDesktopIcon, { className: "h-5 w-5" });
            default:
                return React.createElement(SunIcon, { className: "h-5 w-5" });
        }
    };
    const getLabel = () => {
        switch (mode) {
            case 'light':
                return 'Switch to dark mode';
            case 'dark':
                return 'Switch to system mode';
            case 'system':
                return 'Switch to light mode';
            default:
                return 'Toggle theme';
        }
    };
    return (React.createElement(Button, { variant: "default", size: "sm", onClick: toggleTheme, className: "p-2", "aria-label": getLabel(), title: `Current: ${mode} mode` }, getIcon()));
};
