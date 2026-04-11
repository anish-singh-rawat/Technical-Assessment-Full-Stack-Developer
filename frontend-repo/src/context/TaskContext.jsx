import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from 'react';
import { taskApi } from '../services/api';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from './AuthContext';
import { PAGE_SIZE } from '../utils/constants';
import toast from 'react-hot-toast';

const TaskContext = createContext(null);

export const TaskProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: PAGE_SIZE, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const activeFiltersRef = useRef({});
  const taskMatchesFilters = useCallback((task) => {
    const { filterUserId } = activeFiltersRef.current;
    if (!filterUserId) return true;
    const creatorId = typeof task.createdBy === 'string'
      ? task.createdBy
      : task.createdBy?._id;
    return String(creatorId) === String(filterUserId);
  }, []);

  const socketHandlers = useMemo(() => ({
    'task:create': (newTask) => {
      if (!taskMatchesFilters(newTask)) return;
      setTasks((prev) => {
        if (prev.some((t) => t._id === newTask._id)) return prev;
        return [newTask, ...prev];
      });
    },
    'task:update': (updatedTask) => {
      if (!taskMatchesFilters(updatedTask)) return;
      setTasks((prev) => prev.map((t) => (t._id === updatedTask._id ? updatedTask : t)));
    },
    'task:move': (updatedTask) => {
      if (!taskMatchesFilters(updatedTask)) return;
      setTasks((prev) => prev.map((t) => (t._id === updatedTask._id ? updatedTask : t)));
    },
    'task:delete': ({ id }) => {
      setTasks((prev) => prev.filter((t) => String(t._id) !== String(id)));
    },
    'task:conflict': ({ message, currentTask }) => {
      toast.error(`Conflict: ${message}`);
      if (currentTask) {
        setTasks((prev) => prev.map((t) => (t._id === currentTask._id ? currentTask : t)));
      }
    },
    'task:error': ({ message }) => {
      toast.error(message);
    },
  }), [taskMatchesFilters]);

  const { emit } = useSocket(isAuthenticated ? socketHandlers : {});

  const fetchTasks = useCallback(async (filters = {}) => {
    if (!isAuthenticated) return;
    activeFiltersRef.current = filters;
    setLoading(true);
    setError(null);
    try {
      const { data } = await taskApi.getAll({ limit: PAGE_SIZE, ...filters });
      setTasks(data.data.tasks);
      setPagination(data.data.pagination);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to fetch tasks';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = useCallback(async (taskData) => {
    try {
      const { data } = await taskApi.create(taskData);
      const newTask = data.data.task;
      setTasks((prev) => {
        if (prev.some((t) => t._id === newTask._id)) return prev;
        return [newTask, ...prev];
      });
      toast.success('Task created!');
      return newTask;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
      throw err;
    }
  }, []);

  const updateTask = useCallback(async (id, updateData) => {
    const existing = tasks.find((t) => t._id === id);
    if (!existing) return;

    const optimistic = { ...existing, ...updateData, updatedAt: new Date().toISOString() };
    setTasks((prev) => prev.map((t) => (t._id === id ? optimistic : t)));

    try {
      const { data } = await taskApi.update(id, { ...updateData, updatedAt: existing.updatedAt });
      const updated = data.data.task;
      setTasks((prev) => prev.map((t) => (t._id === id ? updated : t)));
      toast.success('Task updated!');
      return updated;
    } catch (err) {
      setTasks((prev) => prev.map((t) => (t._id === id ? existing : t)));
      if (err.response?.status === 409) {
        toast.error('Update conflict — task was modified by another user');
      } else {
        toast.error(err.response?.data?.message || 'Failed to update task');
      }
      throw err;
    }
  }, [tasks]);

  const moveTask = useCallback(async (id, newStatus) => {
    const existing = tasks.find((t) => t._id === id);
    if (!existing || existing.status === newStatus) return;

    setTasks((prev) =>
      prev.map((t) => t._id === id ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t)
    );

    try {
      const { data } = await taskApi.update(id, { status: newStatus, updatedAt: existing.updatedAt });
      const updated = data.data.task;
      setTasks((prev) => prev.map((t) => (t._id === id ? updated : t)));
    } catch (err) {
      setTasks((prev) => prev.map((t) => (t._id === id ? existing : t)));
      if (err.response?.status === 409) {
        toast.error('Move conflict — task was modified by another user');
      } else {
        toast.error(err.response?.data?.message || 'Failed to move task');
      }
    }
  }, [tasks, emit]);

  const deleteTask = useCallback(async (id) => {
    const existing = tasks.find((t) => t._id === id);
    setTasks((prev) => prev.filter((t) => t._id !== id));
    try {
      await taskApi.delete(id);
      toast.success('Task deleted');
    } catch (err) {
      if (existing) setTasks((prev) => [...prev, existing]);
      toast.error(err.response?.data?.message || 'Failed to delete task');
    }
  }, [tasks]);

  return (
    <TaskContext.Provider value={{
      tasks, pagination, loading, error,
      fetchTasks, createTask, updateTask, moveTask, deleteTask,
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTasks must be used within TaskProvider');
  return ctx;
};

export default TaskContext;
