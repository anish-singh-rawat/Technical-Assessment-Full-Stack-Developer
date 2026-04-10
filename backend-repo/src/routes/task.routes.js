import { Router } from 'express';
import TaskController from '../core/controllers/task.controller.js';
import authMiddleware from '../core/middlewares/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', TaskController.getAllTasks);
router.post('/', TaskController.createTask);
router.put('/:id', TaskController.updateTask);
router.delete('/:id', TaskController.deleteTask);

export default router;
