import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    rules: {
      // Add custom rules here
    },
  },
  {
    files: [
      "**/*.test.js",
      "**/*.test.mjs",
      "**/*.test.cjs",
      "**/test/**/*.js",
      "**/test/**/*.mjs",
      "**/test/**/*.cjs",
      "**/*.spec.js",
      "**/*.spec.mjs",
      "**/*.spec.cjs",
    ],
    languageOptions: {
      globals: {
        ...globals.jest,
        ...globals.mocha,
        ...globals.node,
        ...globals.es2021,
      },
    },
  },
  {
    files: [
      "src/**/*.js",
      "src/**/*.jsx",
      "src/**/*.ts",
      "src/**/*.tsx",
      "public/**/*.js",
      "public/**/*.jsx",
      "public/**/*.ts",
      "public/**/*.tsx",
      "assets/**/*.js",
      "assets/**/*.jsx",
    ],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
  },
  {
    files: ["**/*.jsx", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },
]);
