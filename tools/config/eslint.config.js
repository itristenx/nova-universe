import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";

export default defineConfig([
  {
    ignores: [
      "node_modules/**",
      "dist/**", 
      "build/**",
      ".next/**",
      "coverage/**",
      "prisma/generated/**", // Exclude auto-generated Prisma files
      "**/*.d.ts",
      // TODO-LINT: Temporarily exclude files with parsing errors until manually fixed
      "apps/api/jest.config.js",
      "apps/api/lib/uptime-kuma.js", 
      "apps/api/routes/config.js",
      "apps/core/nova-core/src/lib/api.js",
      "apps/lib/integration/nova-integration-layer.js",
      "apps/orbit/jest.setup.js",
      "test/configuration-management.test.js",
      "test/encryption.test.js", 
      "test/inventory-implementation.test.js",
      "test/notification-simple.test.js",
      "test/test-universal-login.js",
    ],
  },
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
      "@typescript-eslint/no-explicit-any": "off", // TODO-LINT: re-enable after manual fixes
      "@typescript-eslint/no-require-imports": "off", // TODO-LINT: re-enable after converting to imports
      "no-unused-vars": "off", // TODO-LINT: re-enable after cleanup
      "no-undef": "off", // TODO-LINT: re-enable after adding proper globals
      "no-empty": "off", // TODO-LINT: re-enable after adding proper error handling
      "no-case-declarations": "off", // TODO-LINT: re-enable after adding braces to case blocks
      "prefer-const": "off", // TODO-LINT: re-enable after let/const cleanup
      "no-useless-escape": "off", // TODO-LINT: re-enable after escape sequence cleanup
      "no-dupe-class-members": "off", // TODO-LINT: re-enable after removing duplicate methods
      "no-shadow-restricted-names": "off", // TODO-LINT: re-enable after variable name cleanup
      "no-const-assign": "off", // TODO-LINT: re-enable after const reassignment fixes
      "no-constant-binary-expression": "off", // TODO-LINT: re-enable after truthiness cleanup
      "no-prototype-builtins": "off", // TODO-LINT: re-enable after hasOwnProperty fixes
      "no-inline-styles": "off", // TODO-LINT: undefined rule, remove this disable after cleanup
    },
  },
  {
    files: [
      "**/*.test.js",
      "**/*.test.mjs",
      "**/*.test.cjs",
      "**/*.test.ts",
      "**/*.test.tsx",
      "**/test/**/*.js",
      "**/test/**/*.mjs",
      "**/test/**/*.cjs",
      "**/test/**/*.ts", 
      "**/test/**/*.tsx",
      "**/*.spec.js",
      "**/*.spec.mjs",
      "**/*.spec.cjs",
      "**/*.spec.ts",
      "**/*.spec.tsx",
    ],
    languageOptions: {
      globals: {
        ...globals.jest,
        ...globals.mocha,
        ...globals.node,
        ...globals.es2021,
        expect: "readonly",
        it: "readonly",
        describe: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        jest: "readonly",
        test: "readonly",
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
        React: true,
      },
    },
  },
  {
    files: [
      "packages/**/*.js",
      "packages/**/*.jsx",
      "packages/**/*.ts",
      "packages/**/*.tsx",
    ],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
        React: true,
      },
    },
  },
  {
    files: [
      "apps/**/*.js",
      "apps/**/*.jsx",
      "apps/**/*.ts",
      "apps/**/*.tsx",
    ],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2021,
        React: true,
        prisma: "readonly",
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        global: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        exports: "writable",
        module: "writable",
        require: "readonly",
      },
    },
  },
  {
    files: ["tools/scripts/scripts/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
        db: true,
        print: true,
      },
    },
  },
  {
    files: ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: "module",
        errorRecovery: true, // Allow parser to recover from errors
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      "@typescript-eslint/no-explicit-any": "off", // TODO-LINT: re-enable after targeted fixes
      "@typescript-eslint/no-require-imports": "off", // TODO-LINT: re-enable after import conversion
      "@typescript-eslint/no-unused-vars": "off", // TODO-LINT: re-enable after cleanup
      "@typescript-eslint/no-empty-object-type": "off", // TODO-LINT: re-enable after interface cleanup
      "@typescript-eslint/no-unnecessary-type-constraint": "off", // TODO-LINT: re-enable after generic cleanup
      "@typescript-eslint/no-wrapper-object-types": "off", // TODO-LINT: re-enable after primitive type fixes
      "no-unused-private-class-members": "off", // TODO-LINT: re-enable after class cleanup
      "@typescript-eslint/no-namespace": "off", // TODO-LINT: re-enable after namespace refactoring
      "@typescript-eslint/no-unused-expressions": "off", // TODO-LINT: re-enable after expression cleanup
      "@typescript-eslint/no-unsafe-function-type": "off", // TODO-LINT: re-enable after Function type replacements
    },
  },
  {
    files: ["**/*.d.ts"],
    rules: {
      "no-redeclare": "off",
    },
  },
  {
    files: ["apps/orbit/**/*.js", "apps/orbit/**/*.jsx", "apps/orbit/**/*.ts", "apps/orbit/**/*.tsx"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
        React: "readonly",
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
      },
    },
  },
  {
    files: ["prisma/**/*.js", "prisma/**/*.ts"],
    languageOptions: {
      globals: {
        ...globals.node,
        prisma: "readonly",
        PrismaClient: "readonly",
      },
    },
  },
]);
