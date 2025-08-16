#!/usr/bin/env node
import { createApp } from './index.js';

const PORT = Number(process.env.API_PORT || 3000);

(async () => {
  const { server } = await createApp(); // TODO-LINT: move to async function
  server.listen(PORT, () => {
    console.log(`API listening on ${PORT}`);
  });
})();
