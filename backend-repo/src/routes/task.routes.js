const express = require('express');
const router = express.Router();
const TaskController = require('../controllers/task.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// All task routes are protected
router.use(authMiddleware);

router.get('/', TaskController.getAllTasks);
router.post('/', TaskController.createTask);
router.put('/:id', TaskController.updateTask);
router.delete('/:id', TaskController.deleteTask);

module.exports = router;
