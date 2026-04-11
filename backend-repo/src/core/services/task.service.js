import Task from '../../models/task.model.js';
import cache from '../../utils/cache.js';

const CACHE_TTL = 120;

const cacheKey = (scope, status = '', search = '') => `tasks:${scope}:${status}:${search}`;

const TaskService = {
  async getAllTasks({ search = '', status = '', userId } = {}) {
    const scope = userId ? String(userId) : 'admin';
    const key = cacheKey(scope, status, search);
    const cached = cache.get(key);
    if (cached) return cached;

    const query = {};
    if (userId) query.createdBy = userId;

    if (status && ['todo', 'in-progress', 'done'].includes(status)) {
      query.status = status;
    }

    if (search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const tasks = await Task.find(query)
      .populate('createdBy', 'name email')
      .sort({ order: 1, createdAt: -1 });

    cache.set(key, tasks, CACHE_TTL);
    return tasks;
  },

  async createTask({ title, description, status, createdBy }) {
    const maxOrderTask = await Task.findOne({ status: status || 'todo' })
      .sort({ order: -1 })
      .select('order');
    const order = maxOrderTask ? maxOrderTask.order + 1 : 0;

    const task = await Task.create({
      title,
      description,
      status: status || 'todo',
      createdBy,
      order,
    });

    await task.populate('createdBy', 'name email');

    cache.delByPrefix(`tasks:${String(createdBy)}`);
    cache.delByPrefix(`tasks:admin`);
    return task;
  },

  async updateTask(taskId, updateData, incomingUpdatedAt) {
    const existingTask = await Task.findById(taskId);

    if (!existingTask) {
      const err = new Error('Task not found');
      err.statusCode = 404;
      throw err;
    }

    if (incomingUpdatedAt) {
      const incomingTime = new Date(incomingUpdatedAt).getTime();
      const existingTime = new Date(existingTask.updatedAt).getTime();

      if (incomingTime < existingTime) {
        const err = new Error('Conflict: Task has been updated by another user. Please refresh.');
        err.statusCode = 409;
        err.isConflict = true;
        err.currentTask = existingTask;
        throw err;
      }
    }

    const allowedFields = ['title', 'description', 'status', 'order'];
    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) existingTask[field] = updateData[field];
    });

    await existingTask.save();
    await existingTask.populate('createdBy', 'name email');

    const ownerId = String(existingTask.createdBy._id ?? existingTask.createdBy);
    cache.delByPrefix(`tasks:${ownerId}`);
    cache.delByPrefix(`tasks:admin`);
    return existingTask;
  },

  async moveTask(taskId, newStatus, incomingUpdatedAt) {
    return TaskService.updateTask(taskId, { status: newStatus }, incomingUpdatedAt);
  },

  async deleteTask(taskId) {
    const task = await Task.findById(taskId);

    if (!task) {
      const err = new Error('Task not found');
      err.statusCode = 404;
      throw err;
    }

    await Task.findByIdAndDelete(taskId);

    cache.delByPrefix(`tasks:${String(task.createdBy)}`);
    cache.delByPrefix(`tasks:admin`);
    return task;
  },

  async getTaskById(taskId) {
    const task = await Task.findById(taskId).populate('createdBy', 'name email');

    if (!task) {
      const err = new Error('Task not found');
      err.statusCode = 404;
      throw err;
    }

    return task;
  },
};

export default TaskService;
