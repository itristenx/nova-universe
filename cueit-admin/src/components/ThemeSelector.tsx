import React from 'react';
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui';

interface ThemeSelectorProps {
  className?: string;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ className = '' }) => {
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
  ] as const;

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Theme Preference
      </label>
      <div className="grid grid-cols-3 gap-3">
        {themes.map((theme) => (
          <Button
            key={theme.value}
            variant={mode === theme.value ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setTheme(theme.value)}
            className="flex flex-col items-center p-3 h-auto"
          >
            <theme.icon className="h-5 w-5 mb-1" />
            <span className="text-xs">{theme.label}</span>
          </Button>
        ))}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Current: {themes.find(t => t.value === mode)?.description}
      </p>
    </div>
  );
};
