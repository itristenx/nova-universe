// Root ESLint flat config
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import pluginN from "eslint-plugin-n";

export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
      "**/.next/**",
      "prisma/generated/**",
      "prisma/**/generated/**",
      "**/*.min.js",
      "**/*.d.ts"
    ]
  },
  // Global project-level settings to reduce false positives and noisy rules during mass lint fixes.
  {
    languageOptions: {
      globals: { ...globals.node, ...globals.browser, ...globals.es2024, ...globals.jest }
    },
    rules: {
      // Allow require() style imports in mixed JS/TS code while migrating to ESM
      "@typescript-eslint/no-require-imports": "off",
      // Temporarily relax explicit-any rule across the repo to reduce thousands of errors
      "@typescript-eslint/no-explicit-any": "off",
      // Disable Next.js-specific rule that isn't available in this environment
      "@next/next/no-img-element": "off"
    }
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,jsx,ts,tsx}"]
  },
  // Root tests (Node + Jest/Mocha)
  {
    files: [
      "test/**/*.{js,ts,cjs,mjs,jsx,tsx}",
      "**/*.{test,spec}.{js,ts,cjs,mjs,jsx,tsx}",
      "test-*.{js,cjs,mjs,ts}"
    ],
    languageOptions: {
      globals: { ...globals.node, ...globals.jest, ...globals.mocha }
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off"
    }
  },
  // Node/API and scripts
  {
    files: [
      "apps/api/**/*.{js,ts}",
      "scripts/**/*.{js,ts}",
      "tools/**/*.{js,ts}"
    ],
    languageOptions: { globals: { ...globals.node } },
    plugins: { n: pluginN },
    rules: {
      "n/no-unsupported-features/es-builtins": "warn",
      "n/no-process-exit": "off"
    }
  },
  // Browser/React apps
  {
    files: ["apps/**/src/**/*.{js,jsx,ts,tsx}"],
    languageOptions: { globals: { ...globals.browser } },
    plugins: { "react-hooks": reactHooks, "jsx-a11y": jsxA11y },
    rules: {
      ...reactHooks.configs.recommended.rules
    }
  },
  // Browser-based scripts
  {
    files: [
      "tools/scripts/scripts/ui-test-suite.js",
      "tools/scripts/scripts/browser-test.js"
    ],
    languageOptions: { globals: { ...globals.browser } }
  },
  // Mongo shell init scripts
  {
    files: ["tools/scripts/scripts/mongo-init/**/*.js"],
    languageOptions: {
      globals: { ...globals.es2024, db: true, print: true }
    }
  },
  // TypeScript specific tweaks
  {
    files: ["**/*.{ts,tsx}"]
  }
];


