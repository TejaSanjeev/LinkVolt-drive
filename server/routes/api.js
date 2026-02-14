import express from 'express';
import multer from 'multer';
import path from 'path';
import { uploadContent, getContent, downloadFile } from '../controllers/uploadController.js';

const router = express.Router();

// 1. Configure Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// 2. Configure Filter (STRICT ALLOWLIST)
const fileFilter = (req, file, cb) => {
  // Define exactly what extensions are allowed
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.txt', '.docx', '.zip'];
  
  // Get the extension of the uploaded file
  const ext = path.extname(file.originalname).toLowerCase();

  // Check if it matches our list
  if (allowedExtensions.includes(ext)) {
    cb(null, true); // Accept file
  } else {
    // Reject file with a specific error message
    cb(new Error(`Invalid file type. Allowed: ${allowedExtensions.join(', ')}`));
  }
};

// 3. Configure Multer with Limits and Filter
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB Limit
    fileFilter: fileFilter
});

// 4. Helper Middleware to catch Multer errors
const uploadMiddleware = (req, res, next) => {
    const uploadSingle = upload.single('file');

    uploadSingle(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading (e.g. File too large)
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ error: 'File is too large. Max limit is 5MB.' });
            }
            return res.status(400).json({ error: err.message });
        } else if (err) {
            // An error from our fileFilter occurred
            return res.status(400).json({ error: err.message });
        }
        // Everything went fine
        next();
    });
};

// Routes
router.post('/upload', uploadMiddleware, uploadContent);
router.get('/:id', getContent);
router.post('/:id/verify', getContent);
router.get('/file/download/:filename', downloadFile);

export default router;