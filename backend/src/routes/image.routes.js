import { Router } from 'express';
import { generate, enhance } from '../controllers/image.controller.js';

const router = Router();

router.post('/generate', generate);
router.post('/enhance-prompt', enhance);

export default router;
