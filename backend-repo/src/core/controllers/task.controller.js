
const TaskController = {
  async getAllTasks(req, res, next) {
    try {
      const { search, status } = req.query;
      const tasks = await TaskService.getAllTasks({ search, status, userId: req.user._id });
      return ApiResponse.success(res, { tasks }, 'Tasks fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async createTask(req, res, next) {
    try {
      const { title, description, status } = req.body;

      if (!title || !title.trim()) {
        return ApiResponse.badRequest(res, 'Task title is required');
      }

      const task = await TaskService.createTask({
        title,
        description,
        status,
        createdBy: req.user._id,
      });

      const io = req.app.get('io');
      if (io) io.emit('task:create', task);

      return ApiResponse.created(res, { task }, 'Task created successfully');
    } catch (error) {
      next(error);
    }
  },

  async updateTask(req, res, next) {
    try {
      const { id } = req.params;
      const { title, description, status, order, updatedAt } = req.body;

      const task = await TaskService.updateTask(
        id,
        { title, description, status, order },
        updatedAt
      );

      const io = req.app.get('io');
      if (io) io.emit('task:update', task);

      return ApiResponse.success(res, { task }, 'Task updated successfully');
    } catch (error) {
      if (error.isConflict) {
        return ApiResponse.conflict(res, error.message);
      }
      next(error);
    }
  },

  async deleteTask(req, res, next) {
    try {
      const { id } = req.params;
      const task = await TaskService.deleteTask(id);

      const io = req.app.get('io');
      if (io) io.emit('task:delete', { id: task._id });

      return ApiResponse.success(res, { id: task._id }, 'Task deleted successfully');
    } catch (error) {
      next(error);
    }
  },
};

module.exports = TaskController;
