import { useState, useCallback, useEffect, useRef } from 'react';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import { TASK_STATUS_LIST, TASK_PRIORITY_LIST, COLUMN_CONFIG, DEBOUNCE_DELAY, PAGE_SIZE } from '../utils/constants';
import { adminApi } from '../services/api';
import Navbar from '../components/Navbar';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import Modal from '../components/Modal';
import useDebounce from '../hooks/useDebounce';
import '../App.css';

export default function DashboardPage() {
  const { tasks, pagination, loading, createTask, updateTask, deleteTask, moveTask, fetchTasks } = useTasks();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    sortBy: 'createdAt_desc',
    page: 1,
    filterUserId: '',
  });

  // Admin: customer list for dropdown
  const [customers, setCustomers] = useState([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!isAdmin) return;
    adminApi.getUsers()
      .then(({ data }) => setCustomers(data.data.users))
      .catch(() => {});
  }, [isAdmin]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const doFetch = useCallback((f) => fetchTasks(f), [fetchTasks]);
  const debouncedFetch = useDebounce(doFetch, DEBOUNCE_DELAY);

  const applyFilter = useCallback((patch) => {
    const updated = { ...filters, page: 1, ...patch };
    setFilters(updated);
    debouncedFetch(updated);
  }, [filters, debouncedFetch]);

  const handleFilterChange = useCallback((e) => {
    applyFilter({ [e.target.name]: e.target.value });
  }, [applyFilter]);

  const handlePageChange = useCallback((newPage) => {
    const updated = { ...filters, page: newPage };
    setFilters(updated);
    fetchTasks(updated);
  }, [filters, fetchTasks]);

  // Admin customer picker
  const selectedCustomer = customers.find((c) => c._id === filters.filterUserId);
  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.email.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const selectCustomer = (id) => {
    setShowDropdown(false);
    setCustomerSearch('');
    applyFilter({ filterUserId: id });
  };

  const handleCreate = async (data) => {
    setSaving(true);
    try { await createTask(data); setModal(null); }
    finally { setSaving(false); }
  };

  const handleEdit = async (data) => {
    setSaving(true);
    try { await updateTask(modal.task._id, data); setModal(null); }
    finally { setSaving(false); }
  };

  const byStatus = (status) => tasks.filter((t) => t.status === status);

  return (
    <>
      <Navbar />
      <div className="dashboard">
        <div className="dashboard-header">
          <h2>Tasks {isAdmin && <span className="role-badge admin" style={{ marginLeft: 8 }}>Admin</span>}</h2>
          <button className="btn btn-primary btn-sm" style={{ width: 'auto' }} onClick={() => setModal({ mode: 'create' })}>
            + New task
          </button>
        </div>

        {/* ── Filters ── */}
        <div className="filters">
          <input
            name="search"
            placeholder="Search tasks..."
            value={filters.search}
            onChange={handleFilterChange}
          />
          <select name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="">All statuses</option>
            {TASK_STATUS_LIST.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select name="priority" value={filters.priority} onChange={handleFilterChange}>
            <option value="">All priorities</option>
            {TASK_PRIORITY_LIST.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <select name="sortBy" value={filters.sortBy} onChange={handleFilterChange}>
            <option value="createdAt_desc">Newest first</option>
            <option value="createdAt_asc">Oldest first</option>
            <option value="priority">By priority</option>
          </select>

          {/* Admin: customer filter dropdown */}
          {isAdmin && (
            <div className="customer-picker" ref={dropdownRef}>
              <div
                className="customer-picker-input"
                onClick={() => setShowDropdown((v) => !v)}
              >
                {selectedCustomer ? (
                  <span>{selectedCustomer.name}</span>
                ) : (
                  <span className="placeholder">All customers</span>
                )}
                <span className="picker-arrow">▾</span>
              </div>
              {showDropdown && (
                <div className="customer-dropdown">
                  <input
                    autoFocus
                    placeholder="Search customer..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="customer-list">
                    <div
                      className={`customer-option ${!filters.filterUserId ? 'active' : ''}`}
                      onClick={() => selectCustomer('')}
                    >
                      All customers
                    </div>
                    {filteredCustomers.map((c) => (
                      <div
                        key={c._id}
                        className={`customer-option ${filters.filterUserId === c._id ? 'active' : ''}`}
                        onClick={() => selectCustomer(c._id)}
                      >
                        <span>{c.name}</span>
                        <span className="customer-email">{c.email}</span>
                      </div>
                    ))}
                    {filteredCustomers.length === 0 && (
                      <div className="customer-empty">No customers found</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Board ── */}
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
                      <span className="col-dot" style={{ background: cfg.dotColor }} />
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

        {/* ── Pagination ── */}
        {pagination.totalPages > 1 && (
          <div className="pagination">
            <button
              className="btn btn-ghost btn-sm"
              disabled={pagination.page <= 1}
              onClick={() => handlePageChange(pagination.page - 1)}
            >
              ← Prev
            </button>
            <div className="pagination-pages">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  className={`page-btn ${p === pagination.page ? 'active' : ''}`}
                  onClick={() => handlePageChange(p)}
                >
                  {p}
                </button>
              ))}
            </div>
            <button
              className="btn btn-ghost btn-sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => handlePageChange(pagination.page + 1)}
            >
              Next →
            </button>
            <span className="pagination-info">
              {((pagination.page - 1) * PAGE_SIZE) + 1}–{Math.min(pagination.page * PAGE_SIZE, pagination.total)} of {pagination.total}
            </span>
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
