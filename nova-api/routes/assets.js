import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import db from '../db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|svg|ico/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get all assets
router.get('/', (req, res) => {
  db.all('SELECT * FROM assets ORDER BY uploaded_at DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json(rows);
  });
});

// Upload asset
router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { name, type } = req.body;
  if (!name || !type) {
    return res.status(400).json({ error: 'Name and type are required' });
  }

  const url = `/uploads/${req.file.filename}`;
  
  db.run(
    'INSERT INTO assets (name, type, filename, url) VALUES (?, ?, ?, ?)',
    [name, type, req.file.filename, url],
    function(err) {
      if (err) return res.status(500).json({ error: 'DB error' });
      
      res.json({
        id: this.lastID,
        name,
        type,
        filename: req.file.filename,
        url,
        uploaded_at: new Date().toISOString()
      });
    }
  );
});

// Delete asset
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  // Get asset info first
  db.get('SELECT * FROM assets WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    if (!row) return res.status(404).json({ error: 'Asset not found' });
    
    // Delete file from disk
    const filePath = path.join(uploadsDir, row.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Delete from database
    db.run('DELETE FROM assets WHERE id = ?', [id], (err) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      res.json({ message: 'Asset deleted' });
    });
  });
});

export default router;
