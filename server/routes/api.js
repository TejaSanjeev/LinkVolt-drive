import express from 'express';
import multer from 'multer';
import { uploadContent, getContent, downloadFile } from '../controllers/uploadController.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

router.post('/upload', upload.single('file'), uploadContent);
router.get('/:id', getContent);
router.get('/file/download/:filename', downloadFile);

export default router;