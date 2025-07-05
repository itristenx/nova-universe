import daisyui from 'daisyui';
import theme from '../design/theme.js';

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: theme.fonts.sans,
      },
      spacing: theme.spacing,
      colors: {
        primary: theme.colors.primary,
        secondary: theme.colors.secondary,
        accent: theme.colors.accent,
        surface: theme.colors.surface,
        content: theme.colors.content,
        logoShadow: theme.colors.logoShadow,
        reactShadow: theme.colors.reactShadow,
        muted: theme.colors.muted,
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        cueit: {
          primary: theme.colors.primary,
          secondary: theme.colors.secondary,
          accent: theme.colors.accent,
          'base-100': theme.colors.base,
          'base-content': theme.colors.content,
        },
      },
      'light',
      'dark',
    ],
  },
};
