import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../models/db.js';
import generateUniqueId from '../utils/generateId.js';
import { supabase } from '../supabaseClient.js';

const SECRET_KEY = 'supersecretkey'; 

export const register = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
      return res.status(400).json({ error: 'Missing fields' });
  }
  if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const id = generateUniqueId();

  db.run(`INSERT INTO users (id, username, password) VALUES (?, ?, ?)`, 
    [id, username, hashedPassword], 
    function(err) {
      if (err) {
          return res.status(400).json({ error: 'Username already exists' });
      }
      res.json({ success: true });
    }
  );
};

export const login = (req, res) => {
  const { username, password } = req.body;

  db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
    if (err || !user) {
        return res.status(400).json({ error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: user.id, username: user.username }, 
      SECRET_KEY, 
      { expiresIn: '1h' }
    );

    res.json({ success: true, token, username });
  });
};

export const getMyUploads = (req, res) => {
  const userId = req.user.id;
  const now = new Date().toISOString(); 

  const query = `
    SELECT * FROM uploads 
    WHERE userId = ? 
    AND (expiresAt > ? OR expiresAt IS NULL)
    ORDER BY createdAt DESC
  `;

  db.all(query, [userId, now], (err, rows) => {
    if (err) {
        return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
};

export const deleteMyUpload = (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  // 1. Find the file first to check ownership and get the Supabase filename
  db.get(`SELECT * FROM uploads WHERE id = ? AND userId = ?`, [id, userId], async (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Content not found or unauthorized' });

    if (row.type === 'file') {
        const { error } = await supabase
            .storage
            .from('uploads')
            .remove([row.content]); // row.content stores the unique filename

        if (error) {
            console.error("⚠️ Supabase Removal Warning:", error.message);
            // We continue to delete the DB record so the dashboard stays in sync
        } else {
            console.log(`✅ Supabase file deleted: ${row.content}`);
        }
    }

    // 2. Delete the record from the SQLite Database
    db.run(`DELETE FROM uploads WHERE id = ?`, [id], (err) => {
      if (err) {
          return res.status(500).json({ error: err.message });
      }
      res.json({ success: true });
    });
  });
};