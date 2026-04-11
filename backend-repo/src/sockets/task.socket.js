import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import TaskService from '../core/services/task.service.js';

export const emitToOwnerAndAdmins = (io, event, payload, ownerUserId) => {
  if (!io) return;
  const ownerRoom = `user:${String(ownerUserId)}`;
  io.to(ownerRoom).emit(event, payload);
  io.to('admins').emit(event, payload);
};

const registerTaskSockets = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('_id name email role');
      if (!user) return next(new Error('User not found'));

      socket.user = user;
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = String(socket.user._id);
    const role = socket.user.role;
    console.log(`Client connected: ${socket.id} (user: ${userId}, role: ${role})`);

    socket.join(`user:${userId}`);

    if (role === 'admin') {
      socket.join('admins');
      console.log(`Admin ${userId} joined 'admins' room`);
    }

    socket.on('task:create', async (taskData) => {
      try {
        const task = await TaskService.createTask({
          title: taskData.title,
          description: taskData.description,
          status: taskData.status,
          priority: taskData.priority,
          createdBy: socket.user._id,
        });
        emitToOwnerAndAdmins(io, 'task:create', task, task.createdBy._id ?? task.createdBy);
      } catch (err) {
        socket.emit('task:error', { message: err.message });
      }
    });

    socket.on('task:update', async ({ taskId, updateData, updatedAt }) => {
      try {
        const task = await TaskService.updateTask(taskId, updateData, updatedAt);
        emitToOwnerAndAdmins(io, 'task:update', task, task.createdBy._id ?? task.createdBy);
      } catch (err) {
        if (err.isConflict) {
          socket.emit('task:conflict', { message: err.message, currentTask: err.currentTask });
        } else {
          socket.emit('task:error', { message: err.message });
        }
      }
    });

    socket.on('task:delete', async ({ taskId }) => {
      try {
        const task = await TaskService.deleteTask(taskId);
        emitToOwnerAndAdmins(io, 'task:delete', { id: task._id }, task.createdBy);
      } catch (err) {
        socket.emit('task:error', { message: err.message });
      }
    });

    socket.on('task:move', async ({ taskId, newStatus, updatedAt }) => {
      try {
        const task = await TaskService.moveTask(taskId, newStatus, updatedAt);
        emitToOwnerAndAdmins(io, 'task:move', task, task.createdBy._id ?? task.createdBy);
      } catch (err) {
        if (err.isConflict) {
          socket.emit('task:conflict', { message: err.message, currentTask: err.currentTask });
        } else {
          socket.emit('task:error', { message: err.message });
        }
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`Client disconnected: ${socket.id} — Reason: ${reason}`);
    });
  });
};

export default registerTaskSockets;
