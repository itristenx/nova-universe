import express from 'express';

const router = express.Router();

// Load modules from configuration file
import fs from 'fs';
import path from 'path';

const modulesFilePath = path.resolve(__dirname, '../../config/modules.json');
let modules = [];
try {
  const data = fs.readFileSync(modulesFilePath, 'utf-8');
  modules = JSON.parse(data);
} catch (error) {
  console.error('Failed to load modules configuration:', error);
}
router.get('/api/v1/modules', (req, res) => {
  res.json(modules);
});

router.post('/api/v1/modules/:name/enable', (req, res) => {
  const mod = modules.find(m => m.name === req.params.name);
  if (!mod) return res.status(404).json({ error: 'Not found' });
  mod.enabled = true;
  res.json(mod);
});

router.post('/api/v1/modules/:name/disable', (req, res) => {
  const mod = modules.find(m => m.name === req.params.name);
  if (!mod) return res.status(404).json({ error: 'Not found' });
  mod.enabled = false;
  res.json(mod);
});

export default router;
