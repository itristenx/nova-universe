// Root ESLint flat config
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import pluginN from 'eslint-plugin-n';

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/.next/**',
      'prisma/generated/**',
      'prisma/**/generated/**',
      '**/*.min.js',
      '**/*.d.ts',
      'backups/**',
      'tmp/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
  },
  // Root tests (Node + Jest/Mocha)
  {
    files: [
      'test/**/*.{js,ts,cjs,mjs,jsx,tsx}',
      '**/*.{test,spec}.{js,ts,cjs,mjs,jsx,tsx}',
      'test-*.{js,cjs,mjs,ts}',
    ],
    languageOptions: {
      globals: { ...globals.node, ...globals.jest, ...globals.mocha },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  // Node/API and scripts
  {
    files: [
      'apps/api/**/*.{js,ts}',
      'apps/comms/**/*.{js,ts}',
      'scripts/**/*.{js,ts}',
      'tools/**/*.{js,ts}',
      'fix-lint-errors.js',
      '**/validate-*.js',
      'debug-*.js',
    ],
    languageOptions: { globals: { ...globals.node } },
    plugins: { n: pluginN },
    rules: {
      'n/no-unsupported-features/es-builtins': 'warn',
      'n/no-process-exit': 'off',
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  // Browser/React apps
  {
    files: ['apps/**/src/**/*.{js,jsx,ts,tsx}'],
    languageOptions: { globals: { ...globals.browser } },
    plugins: { 'react-hooks': reactHooks, 'jsx-a11y': jsxA11y },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
  },
  // Browser-based scripts
  {
    files: ['tools/scripts/scripts/ui-test-suite.js', 'tools/scripts/scripts/browser-test.js'],
    languageOptions: { globals: { ...globals.browser } },
  },
  // Mongo shell init scripts
  {
    files: ['tools/scripts/scripts/mongo-init/**/*.js'],
    languageOptions: {
      globals: { ...globals.es2024, db: true, print: true },
    },
  },
  // TypeScript specific tweaks
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  // General rule relaxations for large codebase
  {
    rules: {
      'no-empty': ['error', { allowEmptyCatch: true }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  },
];
