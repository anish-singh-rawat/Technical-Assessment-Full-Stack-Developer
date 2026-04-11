import { Router } from 'express';
import { register, login, refreshToken, getMe } from '../core/controllers/auth.controller.js';
import authMiddleware from '../core/middlewares/auth.middleware.js';
import { authLimiter } from '../core/middlewares/rateLimiter.js';

const router = Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/refresh', refreshToken);
router.get('/me', authMiddleware, getMe);

export default router;
