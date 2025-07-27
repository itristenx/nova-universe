import React from 'react';
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui';

export const ThemeToggle: React.FC = () => {
  const { mode, toggleTheme } = useTheme();

  const getIcon = () => {
    switch (mode) {
      case 'light':
        return <SunIcon className="h-5 w-5" />;
      case 'dark':
        return <MoonIcon className="h-5 w-5" />;
      case 'system':
        return <ComputerDesktopIcon className="h-5 w-5" />;
      default:
        return <SunIcon className="h-5 w-5" />;
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

  return (
    <Button
      variant="default"
      size="sm"
      onClick={toggleTheme}
      className="p-2"
      aria-label={getLabel()}
      title={`Current: ${mode} mode`}
    >
      {getIcon()}
    </Button>
  );
};
