import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import db from '../models/db.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const startCleanupJob = () => { 
 
  cron.schedule('*/5 * * * *', () => {
    console.log('🧹 Running cleanup job...');

    const now = new Date().toISOString();

   
    db.all(`SELECT * FROM uploads WHERE expiresAt < ?`, [now], (err, rows) => {
      if (err) {
        console.error('Error fetching expired rows:', err.message);
        return;
      }

      if (rows.length === 0) return;

      console.log(`Found ${rows.length} expired items. Deleting...`);

      rows.forEach((row) => {
        
        if (row.type === 'file' && row.content) {
          const filePath = path.join(__dirname, '../uploads', row.content);
          
          fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr && unlinkErr.code !== 'ENOENT') {
              
              console.error(`Failed to delete file ${row.content}:`, unlinkErr.message);
            } else {
              console.log(`Deleted file: ${row.content}`);
            }
          });
        }

       
        db.run(`DELETE FROM uploads WHERE id = ?`, [row.id], (delErr) => {
          if (delErr) {
            console.error(`Failed to delete DB record ${row.id}:`, delErr.message);
          } else {
            console.log(`Deleted DB record: ${row.id}`);
          }
        });
      });
    });
  });
};

export default startCleanupJob;