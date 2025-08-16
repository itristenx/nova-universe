import React from 'react';
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui';
export const _ThemeSelector = ({ className = '' }) => {
    const { mode, setTheme } = useTheme();
    const themes = [
        {
            value: 'light',
            label: 'Light',
            icon: SunIcon,
            description: 'Light mode'
        },
        {
            value: 'dark',
            label: 'Dark',
            icon: MoonIcon,
            description: 'Dark mode'
        },
        {
            value: 'system',
            label: 'System',
            icon: ComputerDesktopIcon,
            description: 'Follow system preference'
        }
    ];
    return (React.createElement("div", { className: `space-y-3 ${className}` },
        React.createElement("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300" }, "Theme Preference"),
        React.createElement("div", { className: "grid grid-cols-3 gap-3" }, themes.map((theme) => (React.createElement(Button, { key: theme.value, variant: mode === theme.value ? 'primary' : 'secondary', size: "sm", onClick: () => setTheme(theme.value), className: "flex flex-col items-center p-3 h-auto" },
            React.createElement(theme.icon, { className: "h-5 w-5 mb-1" }),
            React.createElement("span", { className: "text-xs" }, theme.label))))),
        React.createElement("p", { className: "text-xs text-gray-500 dark:text-gray-400" },
            "Current: ",
            themes.find(t => t.value === mode)?.description)));
};
