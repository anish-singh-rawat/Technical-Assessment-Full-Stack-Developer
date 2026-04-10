import { useState, useCallback } from 'react';
import { useTasks } from '../context/TaskContext';
import { TASK_STATUS_LIST, COLUMN_CONFIG, DEBOUNCE_DELAY } from '../utils/constants';
import Navbar from '../components/Navbar';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import Modal from '../components/Modal';
import useDebounce from '../hooks/useDebounce';
import '../App.css';

export default function DashboardPage() {
  const { tasks, loading, createTask, updateTask, deleteTask, moveTask, fetchTasks } = useTasks();

  const [modal, setModal] = useState(null); // null | { mode: 'create' | 'edit', task?: {} }
  const [saving, setSaving] = useState(false);
  const [filters, setFilters] = useState({ search: '', status: '' });

  const debouncedFetch = useDebounce((f) => fetchTasks(f), DEBOUNCE_DELAY);

  const handleFilterChange = useCallback((e) => {
    const updated = { ...filters, [e.target.name]: e.target.value };
    setFilters(updated);
    debouncedFetch(updated);
  }, [filters, debouncedFetch]);

  const handleCreate = async (data) => {
    setSaving(true);
    try {
      await createTask(data);
      setModal(null);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (data) => {
    setSaving(true);
    try {
      await updateTask(modal.task._id, data);
      setModal(null);
    } finally {
      setSaving(false);
    }
  };

  const visibleTasks = tasks.filter((t) => {
    if (filters.status && t.status !== filters.status) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      return t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q);
    }
    return true;
  });

  const byStatus = (status) => visibleTasks.filter((t) => t.status === status);

  return (
    <>
      <Navbar />
      <div className="dashboard">
        <div className="dashboard-header">
          <h2>Tasks</h2>
          <button className="btn btn-primary btn-sm" style={{ width: 'auto' }} onClick={() => setModal({ mode: 'create' })}>
            + New task
          </button>
        </div>

        <div className="filters">
          <input
            name="search"
            placeholder="Search tasks..."
            value={filters.search}
            onChange={handleFilterChange}
          />
          <select name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="">All statuses</option>
            {TASK_STATUS_LIST.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <div className="board">
            {TASK_STATUS_LIST.map((status) => {
              const cfg = COLUMN_CONFIG[status];
              const col = byStatus(status);
              return (
                <div key={status} className="column">
                  <div className="column-header">
                    <div className="column-title">
                      <span className="col-dot" style={{ background: dotColor(status) }} />
                      {cfg.label}
                    </div>
                    <span className="col-count">{col.length}</span>
                  </div>
                  {col.length === 0 && <div className="empty-col">No tasks</div>}
                  {col.map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onEdit={(t) => setModal({ mode: 'edit', task: t })}
                      onDelete={deleteTask}
                      onMove={moveTask}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modal && (
        <Modal
          title={modal.mode === 'create' ? 'New task' : 'Edit task'}
          onClose={() => setModal(null)}
        >
          <TaskForm
            initial={modal.task}
            onSubmit={modal.mode === 'create' ? handleCreate : handleEdit}
            onClose={() => setModal(null)}
            loading={saving}
          />
        </Modal>
      )}
    </>
  );
}

function dotColor(status) {
  if (status === 'todo') return '#64748b';
  if (status === 'in-progress') return '#f59e0b';
  return '#10b981';
}
