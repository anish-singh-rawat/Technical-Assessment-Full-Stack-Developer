import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import TaskService from '../core/services/task.service.js';

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
    console.log(`Client connected: ${socket.id} (user: ${userId})`);

    socket.join(`user:${userId}`);
    socket.on('task:create', async (taskData) => {
      try {
        const task = await TaskService.createTask({
          title: taskData.title,
          description: taskData.description,
          status: taskData.status,
          createdBy: socket.user._id,
        });
        io.emit('task:create', task);
      } catch (err) {
        socket.emit('task:error', { message: err.message });
      }
    });

    socket.on('task:update', async ({ taskId, updateData, updatedAt }) => {
      try {
        const updatedTask = await TaskService.updateTask(taskId, updateData, updatedAt);
        io.emit('task:update', updatedTask);
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
        io.emit('task:delete', { id: task._id });
      } catch (err) {
        socket.emit('task:error', { message: err.message });
      }
    });

    socket.on('task:move', async ({ taskId, newStatus, updatedAt }) => {
      try {
        const updatedTask = await TaskService.moveTask(taskId, newStatus, updatedAt);
        io.emit('task:move', updatedTask);
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
