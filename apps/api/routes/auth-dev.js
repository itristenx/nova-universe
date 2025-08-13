import express from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/environment.js';
import { memoryDB } from '../lib/memoryStore.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

const isTestMode = process.env.NODE_ENV !== 'production' || process.env.TEST_MODE === 'true';

// POST /api/auth/register
router.post('/register', async (req, res) => {
  if (!isTestMode) return res.status(404).end();
  try {
    const { email, password, first_name, last_name, role } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });
    const user = await memoryDB.createUser({ email, password, first_name, last_name, role });
    return res.status(201).json(user);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  if (!isTestMode) return res.status(404).end();
  try {
    const { email, password } = req.body || {};
    const user = await memoryDB.getUserByEmail(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, email: user.email, roles: [user.role] }, config.jwtSecret, { expiresIn: '2h', issuer: 'nova-universe-api', audience: 'nova-universe' });
    return res.json({ token });
  } catch (e) {
    return res.status(500).json({ error: 'Login failed' });
  }
});

export default router;