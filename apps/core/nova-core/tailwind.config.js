/** @type {import('tailwindcss').Config} */
import { heroUITheme } from '@nova-universe/design-tokens'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/design-system/src/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: 'class',
  theme: heroUITheme,
  plugins: [],
}
