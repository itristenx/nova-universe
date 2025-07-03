import adminConfig from '../cueit-admin/tailwind.config.js';

export default {
  ...adminConfig,
  content: ['./index.html', './src/**/*.{js,jsx}', ...adminConfig.content],
};

