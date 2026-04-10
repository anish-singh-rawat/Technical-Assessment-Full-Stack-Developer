import { Router } from 'express';
import { register, login, getMe } from '../core/controllers/auth.controller.js';
import authMiddleware from '../core/middlewares/auth.middleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, getMe);

export default router;
