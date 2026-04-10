import TaskService from '../core/services/task.service.js';

const registerTaskSockets = (io) => {
  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('task:create', async (taskData) => {
      try {
        socket.broadcast.emit('task:create', taskData);
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
          socket.emit('task:conflict', {
            message: err.message,
            currentTask: err.currentTask,
          });
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
          socket.emit('task:conflict', {
            message: err.message,
            currentTask: err.currentTask,
          });
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
