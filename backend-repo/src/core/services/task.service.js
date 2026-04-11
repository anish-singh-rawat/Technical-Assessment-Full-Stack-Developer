import Task from '../../models/task.model.js';
import cache from '../../utils/cache.js';

const CACHE_TTL = 60;
const VALID_STATUSES = ['todo', 'in-progress', 'done'];
const VALID_PRIORITIES = ['low', 'medium', 'high'];
const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

const cacheKey = (scope, params) =>
  `tasks:${scope}:${JSON.stringify(params)}`;

const TaskService = {
  /**
   * @param {object} opts
   * @param {string}  opts.search
   * @param {string}  opts.status
   * @param {string}  opts.priority
   * @param {string}  opts.sortBy   - 'createdAt_desc' | 'createdAt_asc' | 'priority'
   * @param {number}  opts.page
   * @param {number}  opts.limit
   * @param {*}       opts.userId   - undefined = admin (all tasks), ObjectId = owner filter
   * @param {*}       opts.filterUserId - admin filtering by a specific customer's id
   */
  async getAllTasks({
    search = '',
    status = '',
    priority = '',
    sortBy = 'createdAt_desc',
    page = 1,
    limit = 10,
    userId,
    filterUserId,
  } = {}) {
    const scope = userId ? String(userId) : 'admin';
    const params = { search, status, priority, sortBy, page, limit, filterUserId: filterUserId ? String(filterUserId) : '' };
    const key = cacheKey(scope, params);
    const cached = cache.get(key);
    if (cached) return cached;

    const query = {};

    if (userId) {
      query.createdBy = userId;
    } else if (filterUserId) {
      query.createdBy = filterUserId;
    }

    if (status && VALID_STATUSES.includes(status)) query.status = status;
    if (priority && VALID_PRIORITIES.includes(priority)) query.priority = priority;

    if (search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    let sort = {};
    if (sortBy === 'createdAt_asc') sort = { createdAt: 1 };
    else if (sortBy === 'priority') sort = { priority: 1, createdAt: -1 };
    else sort = { createdAt: -1 };

    const skip = (page - 1) * limit;
    const total = await Task.countDocuments(query);

    let tasks = await Task.find(query)
      .populate('createdBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    if (sortBy === 'priority') {
      tasks = tasks.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
    }

    const result = {
      tasks,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };

    cache.set(key, result, CACHE_TTL);
    return result;
  },

  async createTask({ title, description, status, priority, createdBy }) {
    const maxOrderTask = await Task.findOne({ status: status || 'todo' })
      .sort({ order: -1 })
      .select('order');
    const order = maxOrderTask ? maxOrderTask.order + 1 : 0;

    const task = await Task.create({
      title,
      description,
      status: status || 'todo',
      priority: priority || 'medium',
      createdBy,
      order,
    });

    await task.populate('createdBy', 'name email');

    cache.delByPrefix(`tasks:${String(createdBy)}`);
    cache.delByPrefix('tasks:admin');
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

    const allowedFields = ['title', 'description', 'status', 'priority', 'order'];
    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) existingTask[field] = updateData[field];
    });

    await existingTask.save();
    await existingTask.populate('createdBy', 'name email');

    const ownerId = String(existingTask.createdBy._id ?? existingTask.createdBy);
    cache.delByPrefix(`tasks:${ownerId}`);
    cache.delByPrefix('tasks:admin');
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
    cache.delByPrefix('tasks:admin');
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
