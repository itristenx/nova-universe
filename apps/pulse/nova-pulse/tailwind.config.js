/** @type {import('tailwindcss').Config} */
import { heroUITheme } from '@nova-universe/design-tokens';

const config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../../packages/design-system/src/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: heroUITheme,
  plugins: [],
};

export default config;
