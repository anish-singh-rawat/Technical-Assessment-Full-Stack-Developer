import TaskService from '../services/task.service.js';
import ApiResponse from '../../utils/apiResponse.js';

const emitToOwnerAndAdmins = (io, event, payload, ownerUserId) => {
  if (!io) return;
  io.to(`user:${String(ownerUserId)}`).emit(event, payload);
  io.sockets.sockets.forEach((socket) => {
    if (socket.user?.role === 'admin' && String(socket.user._id) !== String(ownerUserId)) {
      socket.emit(event, payload);
    }
  });
};

export const getAllTasks = async (req, res, next) => {
  try {
    const { search, status, priority, sortBy, page, limit, filterUserId } = req.query;

    const isAdmin = req.user.role === 'admin';

    const result = await TaskService.getAllTasks({
      search,
      status,
      priority,
      sortBy,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      userId: isAdmin ? undefined : req.user._id,
      filterUserId: isAdmin ? filterUserId : undefined,
    });

    return ApiResponse.success(res, result, 'Tasks fetched');
  } catch (err) {
    next(err);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority } = req.body;

    if (!title?.trim()) {
      return ApiResponse.badRequest(res, 'Task title is required');
    }

    const task = await TaskService.createTask({
      title,
      description,
      status,
      priority,
      createdBy: req.user._id,
    });

    const io = req.app.get('io');
    emitToOwnerAndAdmins(io, 'task:create', task, task.createdBy._id ?? task.createdBy);

    return ApiResponse.created(res, { task }, 'Task created');
  } catch (err) {
    next(err);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, order, updatedAt } = req.body;

    const task = await TaskService.updateTask(id, { title, description, status, priority, order }, updatedAt);

    const io = req.app.get('io');
    emitToOwnerAndAdmins(io, 'task:update', task, task.createdBy._id ?? task.createdBy);

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

    const io = req.app.get('io');
    emitToOwnerAndAdmins(io, 'task:delete', { id: task._id }, task.createdBy);

    return ApiResponse.success(res, { id: task._id }, 'Task deleted');
  } catch (err) {
    next(err);
  }
};
