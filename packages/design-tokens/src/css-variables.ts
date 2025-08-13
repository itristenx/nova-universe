/**
 * CSS Custom Properties for Dynamic Theming
 * These variables can be used across all Nova Universe applications
 * Compatible with HeroUI and ShadCN theming systems
 */

export const cssVariables = `
:root {
  /* Primary Colors */
  --color-primary-50: 239 246 255;
  --color-primary-100: 219 234 254;
  --color-primary-200: 191 219 254;
  --color-primary-300: 147 197 253;
  --color-primary-400: 96 165 250;
  --color-primary-500: 59 130 246;
  --color-primary-600: 37 99 235;
  --color-primary-700: 29 78 216;
  --color-primary-800: 30 64 175;
  --color-primary-900: 30 58 138;
  --color-primary-950: 23 37 84;

  /* Secondary Colors */
  --color-secondary-50: 250 245 255;
  --color-secondary-100: 243 232 255;
  --color-secondary-200: 233 213 255;
  --color-secondary-300: 216 180 254;
  --color-secondary-400: 192 132 252;
  --color-secondary-500: 168 85 247;
  --color-secondary-600: 147 51 234;
  --color-secondary-700: 124 58 237;
  --color-secondary-800: 107 33 168;
  --color-secondary-900: 88 28 135;
  --color-secondary-950: 59 7 100;

  /* Accent Colors */
  --color-accent-50: 255 247 237;
  --color-accent-100: 255 237 213;
  --color-accent-200: 254 215 170;
  --color-accent-300: 253 186 116;
  --color-accent-400: 251 146 60;
  --color-accent-500: 249 115 22;
  --color-accent-600: 234 88 12;
  --color-accent-700: 194 65 12;
  --color-accent-800: 154 52 18;
  --color-accent-900: 124 45 18;
  --color-accent-950: 67 20 7;

  /* Neutral Colors */
  --color-neutral-50: 249 250 251;
  --color-neutral-100: 243 244 246;
  --color-neutral-200: 229 231 235;
  --color-neutral-300: 209 213 219;
  --color-neutral-400: 156 163 175;
  --color-neutral-500: 107 114 128;
  --color-neutral-600: 75 85 99;
  --color-neutral-700: 55 65 81;
  --color-neutral-800: 31 41 55;
  --color-neutral-900: 17 24 39;
  --color-neutral-950: 3 7 18;

  /* Semantic Colors */
  --color-success-50: 240 253 244;
  --color-success-100: 220 252 231;
  --color-success-200: 187 247 208;
  --color-success-300: 134 239 172;
  --color-success-400: 74 222 128;
  --color-success-500: 34 197 94;
  --color-success-600: 22 163 74;
  --color-success-700: 21 128 61;
  --color-success-800: 22 101 52;
  --color-success-900: 20 83 45;
  --color-success-950: 5 46 22;

  --color-warning-50: 254 252 232;
  --color-warning-100: 254 249 195;
  --color-warning-200: 254 240 138;
  --color-warning-300: 253 224 71;
  --color-warning-400: 250 204 21;
  --color-warning-500: 234 179 8;
  --color-warning-600: 202 138 4;
  --color-warning-700: 161 98 7;
  --color-warning-800: 133 77 14;
  --color-warning-900: 113 63 18;
  --color-warning-950: 66 32 6;

  --color-error-50: 254 242 242;
  --color-error-100: 254 226 226;
  --color-error-200: 254 202 202;
  --color-error-300: 252 165 165;
  --color-error-400: 248 113 113;
  --color-error-500: 239 68 68;
  --color-error-600: 220 38 38;
  --color-error-700: 185 28 28;
  --color-error-800: 153 27 27;
  --color-error-900: 127 29 29;
  --color-error-950: 69 10 10;

  --color-info-50: 239 246 255;
  --color-info-100: 219 234 254;
  --color-info-200: 191 219 254;
  --color-info-300: 147 197 253;
  --color-info-400: 96 165 250;
  --color-info-500: 59 130 246;
  --color-info-600: 37 99 235;
  --color-info-700: 29 78 216;
  --color-info-800: 30 64 175;
  --color-info-900: 30 58 138;
  --color-info-950: 23 37 84;

  /* Typography */
  --font-family-sans: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --font-family-mono: 'JetBrains Mono', 'Fira Code', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  --font-family-display: 'Inter', system-ui, sans-serif;

  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 2rem;
  --spacing-xl: 3rem;
  --spacing-2xl: 4rem;

  /* Border Radius */
  --radius-sm: 0.125rem;
  --radius-base: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-2xl: 1rem;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-base: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-md: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);

  /* Z-Index */
  --z-hide: -1;
  --z-base: 0;
  --z-docked: 10;
  --z-dropdown: 1000;
  --z-sticky: 1100;
  --z-banner: 1200;
  --z-overlay: 1300;
  --z-modal: 1400;
  --z-popover: 1500;
  --z-toast: 1700;
  --z-tooltip: 1800;

  /* Animation */
  --duration-75: 75ms;
  --duration-100: 100ms;
  --duration-150: 150ms;
  --duration-200: 200ms;
  --duration-300: 300ms;
  --duration-500: 500ms;
  --duration-700: 700ms;
  --duration-1000: 1000ms;

  --timing-linear: linear;
  --timing-ease: ease;
  --timing-ease-in: ease-in;
  --timing-ease-out: ease-out;
  --timing-ease-in-out: ease-in-out;
}

/* Dark mode overrides */
[data-theme="dark"] {
  --color-neutral-50: 3 7 18;
  --color-neutral-100: 17 24 39;
  --color-neutral-200: 31 41 55;
  --color-neutral-300: 55 65 81;
  --color-neutral-400: 75 85 99;
  --color-neutral-500: 107 114 128;
  --color-neutral-600: 156 163 175;
  --color-neutral-700: 209 213 219;
  --color-neutral-800: 229 231 235;
  --color-neutral-900: 243 244 246;
  --color-neutral-950: 249 250 251;
}

/* HeroUI compatibility */
.nextui-theme {
  --nextui-primary: rgb(var(--color-primary-500));
  --nextui-primary-50: rgb(var(--color-primary-50));
  --nextui-primary-100: rgb(var(--color-primary-100));
  --nextui-primary-200: rgb(var(--color-primary-200));
  --nextui-primary-300: rgb(var(--color-primary-300));
  --nextui-primary-400: rgb(var(--color-primary-400));
  --nextui-primary-500: rgb(var(--color-primary-500));
  --nextui-primary-600: rgb(var(--color-primary-600));
  --nextui-primary-700: rgb(var(--color-primary-700));
  --nextui-primary-800: rgb(var(--color-primary-800));
  --nextui-primary-900: rgb(var(--color-primary-900));
  
  --nextui-secondary: rgb(var(--color-secondary-500));
  --nextui-success: rgb(var(--color-success-500));
  --nextui-warning: rgb(var(--color-warning-500));
  --nextui-danger: rgb(var(--color-error-500));
}

/* ShadCN compatibility */
.shadcn-theme {
  --background: var(--color-neutral-50);
  --foreground: var(--color-neutral-950);
  --card: var(--color-neutral-50);
  --card-foreground: var(--color-neutral-950);
  --popover: var(--color-neutral-50);
  --popover-foreground: var(--color-neutral-950);
  --primary: var(--color-primary-500);
  --primary-foreground: var(--color-neutral-50);
  --secondary: var(--color-neutral-100);
  --secondary-foreground: var(--color-neutral-900);
  --muted: var(--color-neutral-100);
  --muted-foreground: var(--color-neutral-500);
  --accent: var(--color-neutral-100);
  --accent-foreground: var(--color-neutral-900);
  --destructive: var(--color-error-500);
  --destructive-foreground: var(--color-neutral-50);
  --border: var(--color-neutral-200);
  --input: var(--color-neutral-200);
  --ring: var(--color-primary-500);
  --radius: var(--radius-md);
}

[data-theme="dark"] .shadcn-theme {
  --background: var(--color-neutral-950);
  --foreground: var(--color-neutral-50);
  --card: var(--color-neutral-950);
  --card-foreground: var(--color-neutral-50);
  --popover: var(--color-neutral-950);
  --popover-foreground: var(--color-neutral-50);
  --primary: var(--color-primary-500);
  --primary-foreground: var(--color-neutral-50);
  --secondary: var(--color-neutral-800);
  --secondary-foreground: var(--color-neutral-50);
  --muted: var(--color-neutral-800);
  --muted-foreground: var(--color-neutral-400);
  --accent: var(--color-neutral-800);
  --accent-foreground: var(--color-neutral-50);
  --destructive: var(--color-error-500);
  --destructive-foreground: var(--color-neutral-50);
  --border: var(--color-neutral-800);
  --input: var(--color-neutral-800);
  --ring: var(--color-primary-500);
}
`;

export default cssVariables;
