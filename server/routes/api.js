import express from 'express';
import multer from 'multer';
import path from 'path';
import { uploadContent, getContent, downloadFile } from '../controllers/uploadController.js';
import { register, login, getMyUploads, deleteMyUpload } from '../controllers/authController.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.txt', '.docx', '.zip'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed: ${allowedExtensions.join(', ')}`));
  }
};


const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, 
    fileFilter: fileFilter
});


const uploadMiddleware = (req, res, next) => {
    const uploadSingle = upload.single('file');

    uploadSingle(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ error: 'File is too large. Max limit is 5MB.' });
            }
            return res.status(400).json({ error: err.message });
        } else if (err) {
            
            return res.status(400).json({ error: err.message });
        }
        
        next();
    });
};

router.post('/auth/register', register);
router.post('/auth/login', login);

router.get('/auth/verify', authenticateToken, (req, res) => {
  if (req.user) {
    res.json({ success: true, user: req.user });
  } else {
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
});

router.get('/user/uploads', authenticateToken, getMyUploads);
router.delete('/user/files/:id', authenticateToken, deleteMyUpload);

router.post('/upload', authenticateToken, uploadMiddleware, uploadContent);

router.get('/:id', getContent);
router.post('/:id/verify', getContent);


router.get('/file/download/:filename', downloadFile);

export default router;