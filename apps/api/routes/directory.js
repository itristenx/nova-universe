import express from 'express';
import { getConfig, searchDirectory, createUser } from '../directory.js';

const router = express.Router();

// Get directory config
/**
 * @swagger
 * /api/v1/directory/config:
 *   get:
 *     summary: Get directory config
 *     responses:
 *       200:
 *         description: Directory config
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: Database error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 errorCode:
 *                   type: string
 */
router.get('/config', async (req, res) => {
  try {
    const cfg = await getConfig();
    res.json(cfg);
  } catch {
    res.status(500).json({ error: 'Database error', errorCode: 'DB_ERROR' });
  }
});

// Update directory config (stub, implement as needed)
// router.put('/config', ...)

/**
 * @swagger
 * /api/v1/directory/search:
 *   get:
 *     summary: Search the directory
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query string
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Directory search failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 errorCode:
 *                   type: string
 */
router.get('/search', async (req, res) => {
  try {
    const q = (req.query.q || '').toLowerCase();
    const results = await searchDirectory(q);
    res.json(results);
  } catch {
    res.status(500).json({ error: 'Directory search failed', errorCode: 'DIRECTORY_SEARCH_ERROR' });
  }
});

/**
 * @swagger
 * /api/v1/directory/user:
 *   post:
 *     summary: Create a user in the local directory
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *       400:
 *         description: Name and email are required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 errorCode:
 *                   type: string
 *       500:
 *         description: Failed to create user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 errorCode:
 *                   type: string
 */
router.post('/user', async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res
      .status(400)
      .json({ error: 'Name and email are required', errorCode: 'NAME_EMAIL_REQUIRED' });
  }
  try {
    const id = await createUser(name, email);
    res.json({ id, name, email });
  } catch {
    res.status(500).json({ error: 'Failed to create user', errorCode: 'CREATE_USER_ERROR' });
  }
});

export default router;
