import db from '../models/db.js';
import generateUniqueId from '../utils/generateId.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const uploadContent = (req, res) => {
  const { text, expiry } = req.body;
  const file = req.file;

  if ((!text && !file) || (text && file)) {
    return res.status(400).json({ error: 'Please upload either a file or text, not both.' });
  }

  const id = generateUniqueId();
  const type = file ? 'file' : 'text';
  const content = file ? file.filename : text;
  const originalName = file ? file.originalname : null;

  const expiryMinutes = expiry ? parseInt(expiry) : 10;
  const expiresAt = new Date(Date.now() + expiryMinutes * 60000).toISOString();

  const query = `INSERT INTO uploads (id, type, content, originalName, expiresAt) VALUES (?, ?, ?, ?, ?)`;

  db.run(query, [id, type, content, originalName, expiresAt], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, linkId: id, expiresAt });
  });
};

export const getContent = (req, res) => {
  const { id } = req.params;

  db.get(`SELECT * FROM uploads WHERE id = ?`, [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Link not found or expired.' });

    if (new Date(row.expiresAt) < new Date()) {
        return res.status(410).json({ error: 'This link has expired.' });
    }

    if (row.type === 'text') {
      res.json({ type: 'text', content: row.content, expiresAt: row.expiresAt });
    } else {
      res.json({ 
        type: 'file', 
        filename: row.content, 
        originalName: row.originalName, 
        expiresAt: row.expiresAt 
      });
    }
  });
};

export const downloadFile = (req, res) => {
    const filename = req.params.filename;
    // Go up one level from controllers to reach uploads
    const filePath = path.join(__dirname, '../uploads', filename);
    
    if (fs.existsSync(filePath)) {
        res.download(filePath);
    } else {
        res.status(404).json({ error: 'File not found' });
    }
};