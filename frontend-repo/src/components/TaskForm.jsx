import { useState } from 'react';
import { TASK_STATUS_LIST, TASK_PRIORITY_LIST } from '../utils/constants';
import '../App.css';

export default function TaskForm({ initial = {}, onSubmit, onClose, loading }) {
  const [form, setForm] = useState({
    title: initial.title || '',
    description: initial.description || '',
    status: initial.status || 'todo',
    priority: initial.priority || 'medium',
  });

  const handle = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSubmit(form);
  };

  return (
    <form onSubmit={submit}>
      <div className="form-group">
        <label>Title</label>
        <input name="title" value={form.title} onChange={handle} required autoFocus />
      </div>
      <div className="form-group">
        <label>Description</label>
        <textarea name="description" value={form.description} onChange={handle} rows={3} />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Status</label>
          <select name="status" value={form.status} onChange={handle}>
            {TASK_STATUS_LIST.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Priority</label>
          <select name="priority" value={form.priority} onChange={handle}>
            {TASK_PRIORITY_LIST.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="modal-actions">
        <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-primary btn-sm" style={{ width: 'auto' }} disabled={loading}>
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
}
