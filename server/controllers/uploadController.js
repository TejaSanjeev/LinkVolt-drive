import db from '../models/db.js';
import generateUniqueId from '../utils/generateId.js';
import bcrypt from 'bcryptjs';
import { supabase } from '../supabaseClient.js'; 


export const uploadContent = async (req, res) => {
    const { text, expiry, maxViews, password } = req.body;
    const file = req.file;
    const userId = req.user ? req.user.id : null; 
    if ((!text && !file) || (text && file)) {
        return res.status(400).json({ error: 'Please upload either a file or text.' });
    }

    const id = generateUniqueId();
    const type = file ? 'file' : 'text';
    const originalName = file ? file.originalname : null; 
    let content = text; 
  
    if (file) {
        const fileName = `${Date.now()}_${file.originalname}`;
        
        const { error } = await supabase.storage.from('uploads').upload(fileName, file.buffer, {
            contentType: file.mimetype
        });

        if (error) {
            console.error("Supabase Upload Error:", error);
            return res.status(500).json({ error: 'Failed to upload file to cloud storage.' });
        }

        content = fileName;
    } 
    let expiresAt;
    if (expiry) {
        expiresAt = new Date(expiry).toISOString();
        if (new Date(expiresAt) <= new Date()) {
            return res.status(400).json({ error: 'Expiry time must be in the future.' });
        }
    } else {
        expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); 
    }
    const limitViews = maxViews ? parseInt(maxViews) : null;
    let hashedPassword = null;
    if (password) {
        hashedPassword = await bcrypt.hash(password, 10);
    }
    const query = `INSERT INTO uploads (id, type, content, originalName, expiresAt, maxViews, password, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(query, [id, type, content, originalName, expiresAt, limitViews, hashedPassword, userId], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, linkId: id });
    });
};


export const getContent = (req, res) => {
  const { id } = req.params;
  const isVerification = req.method === 'POST'; 
  const { password } = req.body || {}; 

  db.get(`SELECT * FROM uploads WHERE id = ?`, [id], async (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Link not found.' });

    if (new Date(row.expiresAt) < new Date()) {
        return res.status(410).json({ error: 'This link has expired.' });
    }

    if (row.maxViews !== null && row.views >= row.maxViews) {
        return res.status(410).json({ error: 'Max views reached.' });
    }

    if (!isVerification) {
        return res.json({ 
            found: true, 
            type: row.type, 
            originalName: row.originalName,
            protected: !!row.password 
        });
    }

    if (row.password) {
        if (!password) {
            return res.status(401).json({ error: 'Password required' });
        }
        const isMatch = await bcrypt.compare(password, row.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Incorrect password' });
        }
    }

    db.run(`UPDATE uploads SET views = views + 1 WHERE id = ?`, [id]);
    if (row.type === 'text') {
      res.json({ type: 'text', content: row.content });
    } else {
      res.json({ 
        type: 'file', 
        filename: row.content, 
        originalName: row.originalName 
      });
    }
  });
};

export const downloadFile = async (req, res) => {
    const filename = req.params.filename;
    const { data } = supabase.storage.from('uploads').getPublicUrl(filename);
    if (data && data.publicUrl) {
        res.redirect(data.publicUrl);
    } else {
        res.status(404).json({ error: 'File not found' });
    }
};