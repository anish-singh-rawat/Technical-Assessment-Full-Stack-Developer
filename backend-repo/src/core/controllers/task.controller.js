import TaskService from '../services/task.service.js';
import ApiResponse from '../../utils/apiResponse.js';

const emitToOwnerAndAdmins = (io, event, payload, ownerUserId) => {
  if (!io) return;
  const ownerRoom = `user:${String(ownerUserId)}`;
  io.to(ownerRoom).emit(event, payload);

  io.sockets.sockets.forEach((socket) => {
    if (socket.user?.role === 'admin' && String(socket.user._id) !== String(ownerUserId)) {
      socket.emit(event, payload);
    }
  });
};

export const getAllTasks = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const userId = req.user.role === 'admin' ? undefined : req.user._id;
    const tasks = await TaskService.getAllTasks({ search, status, userId });
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
    const { title, description, status, order, updatedAt } = req.body;

    const task = await TaskService.updateTask(id, { title, description, status, order }, updatedAt);

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
