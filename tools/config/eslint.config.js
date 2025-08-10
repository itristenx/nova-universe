import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";

export default defineConfig([
  // Linter options
  {
    linterOptions: {
      noInlineConfig: true,
      reportUnusedDisableDirectives: false,
    },
  },
  // Global ignores for generated and build artifacts
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/.next/**",
      "**/.vite/**",
      "prisma/generated/**",
      "prisma/**/generated/**",
      "**/public/sw.js",
      "apps/orbit/jest.setup.js",
      "apps/orbit/jest.config.js",
      "apps/orbit/next.config.js",
    ],
  },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.es2024,
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  // Jest setup/env files
  {
    files: ["**/jest.setup.{js,ts}", "**/jest.config.{js,ts}", "**/setupTests.{js,ts}", "**/jest.d.ts"],
    languageOptions: {
      parser: tsParser,
      globals: {
        ...globals.jest,
        ...globals.node,
        ...globals.browser,
      },
    },
    rules: {
      "no-undef": "off",
    },
  },
  // Test files
  {
    files: [
      "**/*.test.js",
      "**/*.test.mjs",
      "**/*.test.cjs",
      "**/*.test.ts",
      "**/*.test.tsx",
      "**/*.spec.js",
      "**/*.spec.mjs",
      "**/*.spec.cjs",
      "**/*.spec.ts",
      "**/*.spec.tsx",
      "**/test/**/*.{js,jsx,ts,tsx}",
      "**/__tests__/**/*.{js,jsx,ts,tsx}",
    ],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parser: tsParser,
      globals: {
        ...globals.jest,
        ...globals.mocha,
        ...globals.node,
        ...globals.browser,
        ...globals.es2024,
      },
    },
    rules: {
      "no-undef": "off",
    },
  },
  {
    files: [
      "src/**/*.{js,jsx,ts,tsx}",
      "public/**/*.{js,jsx,ts,tsx}",
      "assets/**/*.{js,jsx}",
    ],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.es2024,
        React: true,
      },
    },
  },
  {
    files: [
      "packages/**/*.{js,jsx,ts,tsx}",
    ],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.es2024,
        React: true,
      },
    },
  },
  {
    files: [
      "apps/**/*.{js,jsx,ts,tsx}",
    ],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.es2024,
        React: true,
      },
    },
  },
  {
    files: ["tools/scripts/scripts/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.es2024,
        db: true,
        print: true,
      },
    },
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      "@typescript-eslint/no-explicit-any": "off",
      // TS handles undefined checking; avoid false positives on types like NodeJS.Timeout
      "no-undef": "off",
    },
  },
  {
    files: ["**/*.d.ts"],
    rules: {
      "no-redeclare": "off",
    },
  },
]);
