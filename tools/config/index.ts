// Configuration utilities and shared types for development tools
export interface ToolConfig {
  enabled: boolean;
  options?: Record<string, any>;
}

export interface BuildConfig {
  typescript: ToolConfig;
  eslint: ToolConfig;
  babel: ToolConfig;
}

export const defaultConfig: BuildConfig = {
  typescript: {
    enabled: true,
    options: {
      skipLibCheck: true,
      allowSyntheticDefaultImports: true,
    },
  },
  eslint: {
    enabled: true,
    options: {
      extends: ['@typescript-eslint/recommended'],
    },
  },
  babel: {
    enabled: true,
    options: {
      presets: ['@babel/preset-env', '@babel/preset-typescript'],
    },
  },
};

export default defaultConfig;
