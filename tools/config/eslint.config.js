import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";

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
      "@typescript-eslint/no-explicit-any": "off",
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
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      "@typescript-eslint/no-explicit-any": "off",
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
