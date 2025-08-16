import js from '@eslint/js';
import globals from 'globals';
import { defineConfig } from 'eslint/config';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

// Deprecated legacy config retained for compatibility; prefer root eslint.config.js
export default defineConfig([js.configs.recommended]);
