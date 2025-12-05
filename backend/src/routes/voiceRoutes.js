import express from 'express';
import multer from 'multer';
import { processVoice } from '../controllers/voiceController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('audio'), processVoice);

export default router;