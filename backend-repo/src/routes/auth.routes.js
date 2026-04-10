import { Router } from 'express';
import AuthController from '../core/controllers/auth.controller.js';
import authMiddleware from '../core/middlewares/auth.middleware.js';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/me', authMiddleware, AuthController.getMe);

export default router;
