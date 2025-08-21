#!/usr/bin/env node
import { createApp } from './index.js';
import { logger } from './logger.js';

const PORT = Number(process.env.API_PORT || 3000);

(async () => {
  const { server } = await createApp();
  server.listen(PORT, () => {
    logger.info(`API listening on ${PORT}`);
  });
})();
