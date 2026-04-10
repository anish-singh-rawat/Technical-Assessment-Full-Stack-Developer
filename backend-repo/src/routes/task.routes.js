import { Router } from 'express';
import { getAllTasks, createTask, updateTask, deleteTask } from '../core/controllers/task.controller.js';
import authMiddleware from '../core/middlewares/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', getAllTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;
