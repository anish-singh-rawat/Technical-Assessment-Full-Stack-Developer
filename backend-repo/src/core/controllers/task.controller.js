import TaskService from '../services/task.service.js';
import ApiResponse from '../../utils/apiResponse.js';

export const getAllTasks = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const tasks = await TaskService.getAllTasks({ search, status });
    return ApiResponse.success(res, { tasks }, 'Tasks fetched');
  } catch (err) {
    next(err);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const { title, description, status } = req.body;

    if (!title?.trim()) {
      return ApiResponse.badRequest(res, 'Task title is required');
    }

    const task = await TaskService.createTask({
      title,
      description,
      status,
      createdBy: req.user._id,
    });

    req.app.get('io')?.emit('task:create', task);
    return ApiResponse.created(res, { task }, 'Task created');
  } catch (err) {
    next(err);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, status, order, updatedAt } = req.body;

    const task = await TaskService.updateTask(id, { title, description, status, order }, updatedAt);

    req.app.get('io')?.emit('task:update', task);
    return ApiResponse.success(res, { task }, 'Task updated');
  } catch (err) {
    if (err.isConflict) return ApiResponse.conflict(res, err.message);
    next(err);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await TaskService.deleteTask(id);

    req.app.get('io')?.emit('task:delete', { id: task._id });
    return ApiResponse.success(res, { id: task._id }, 'Task deleted');
  } catch (err) {
    next(err);
  }
};
