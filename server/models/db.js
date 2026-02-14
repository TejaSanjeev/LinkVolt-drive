// ... imports remain the same
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sqlite = sqlite3.verbose();
const dbPath = path.resolve(__dirname, 'linkvault.db');

const db = new sqlite.Database(dbPath, (err) => {
  if (err) console.error(err.message);
  else console.log('Connected to SQLite database.');
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS uploads (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    content TEXT,
    originalName TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    expiresAt DATETIME,
    views INTEGER DEFAULT 0,
    maxViews INTEGER,
    password TEXT  -- New Column
  )`);
});

export default db;