import express from 'express';
import db from '../db.js';

const router = express.Router();

// Get all roles
router.get('/', (req, res) => {
  db.all('SELECT * FROM roles ORDER BY name', (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json(rows);
  });
});

// Create role
router.post('/', (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Role name is required' });

  db.run(
    'INSERT INTO roles (name, description) VALUES (?, ?)',
    [name, description || ''],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Role already exists' });
        }
        return res.status(500).json({ error: 'DB error' });
      }
      res.json({ id: this.lastID, name, description });
    }
  );
});

// Update role
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  db.run(
    'UPDATE roles SET name=?, description=? WHERE id=?',
    [name, description || '', id],
    (err) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      res.json({ message: 'Role updated' });
    }
  );
});

// Delete role
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  // Don't allow deleting admin role
  if (id === '1') {
    return res.status(400).json({ error: 'Cannot delete admin role' });
  }

  db.serialize(() => {
    // Remove role assignments
    db.run('DELETE FROM user_roles WHERE role_id=?', [id]);
    // Remove role permissions
    db.run('DELETE FROM role_permissions WHERE role_id=?', [id]);
    // Delete role
    db.run('DELETE FROM roles WHERE id=?', [id], (err) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      res.json({ message: 'Role deleted' });
    });
  });
});

// Get permissions
router.get('/permissions', (req, res) => {
  db.all('SELECT * FROM permissions ORDER BY name', (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json(rows);
  });
});

// Get role permissions
router.get('/:id/permissions', (req, res) => {
  const { id } = req.params;

  db.all(
    `SELECT p.* FROM permissions p
     JOIN role_permissions rp ON p.id = rp.permission_id
     WHERE rp.role_id = ?`,
    [id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      res.json(rows);
    }
  );
});

// Update role permissions
router.put('/:id/permissions', (req, res) => {
  const { id } = req.params;
  const { permissionIds } = req.body;

  if (!Array.isArray(permissionIds)) {
    return res.status(400).json({ error: 'Permission IDs must be an array' });
  }

  db.serialize(() => {
    // Remove existing permissions
    db.run('DELETE FROM role_permissions WHERE role_id=?', [id]);
    
    // Add new permissions
    if (permissionIds.length > 0) {
      const stmt = db.prepare('INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)');
      permissionIds.forEach(permissionId => {
        stmt.run(id, permissionId);
      });
      stmt.finalize((err) => {
        if (err) return res.status(500).json({ error: 'DB error' });
        res.json({ message: 'Role permissions updated' });
      });
    } else {
      res.json({ message: 'Role permissions updated' });
    }
  });
});

export default router;
