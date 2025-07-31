import express from 'express';

const router = express.Router();

// Simple in-memory list of modules and whether they are enabled
const modules = [
  { name: 'helix', displayName: 'Helix (Identity)', enabled: true },
  { name: 'lore', displayName: 'Lore (Knowledge Base)', enabled: true },
  { name: 'pulse', displayName: 'Pulse (Technician Portal)', enabled: true },
  { name: 'comms', displayName: 'Comms (Slack)', enabled: false },
];

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
