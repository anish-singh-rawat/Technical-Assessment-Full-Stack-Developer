import { Router } from 'express';
import { getUsers } from '../core/controllers/admin.controller.js';
import authMiddleware from '../core/middlewares/auth.middleware.js';
import ApiResponse from '../utils/apiResponse.js';

const router = Router();

router.use(authMiddleware);

router.use((req, res, next) => {
  if (req.user.role !== 'admin') {
    return ApiResponse.forbidden(res, 'Admin access required');
  }
  next();
});

router.get('/users', getUsers);

export default router;
