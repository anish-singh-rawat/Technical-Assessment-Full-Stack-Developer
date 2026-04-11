import { TASK_STATUS, TASK_STATUS_LIST } from '../utils/constants';
import '../App.css';

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const fmtTime = (d) =>
  new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

const statusClass = {
  [TASK_STATUS.TODO]: 'status-todo',
  [TASK_STATUS.IN_PROGRESS]: 'status-in-progress',
  [TASK_STATUS.DONE]: 'status-done',
};

const priorityClass = {
  high: 'priority-high',
  medium: 'priority-medium',
  low: 'priority-low',
};

export default function TaskCard({ task, onEdit, onDelete, onMove }) {
  const otherStatuses = TASK_STATUS_LIST.filter((s) => s !== task.status);

  return (
    <div className="task-card">
      <div className="task-card-header">
        <span className={`priority-badge ${priorityClass[task.priority] || 'priority-medium'}`}>
          {task.priority || 'medium'}
        </span>
        <span className={`status-badge ${statusClass[task.status]}`}>{task.status}</span>
      </div>

      <div className="task-card-title">{task.title}</div>
      {task.description && <div className="task-card-desc">{task.description}</div>}

      {task.createdBy?.name && (
        <div className="task-creator">by {task.createdBy.name}</div>
      )}

      <div className="task-timestamps">
        <span>Created: {fmtDate(task.createdAt)} {fmtTime(task.createdAt)}</span>
        {task.updatedAt !== task.createdAt && (
          <span>Updated: {fmtDate(task.updatedAt)} {fmtTime(task.updatedAt)}</span>
        )}
      </div>

      <div className="task-card-actions">
        <div className="move-btns">
          {otherStatuses.map((s) => (
            <button key={s} className="move-btn" onClick={() => onMove(task._id, s)} title={`Move to ${s}`}>
              → {s === TASK_STATUS.TODO ? 'Todo' : s === 'in-progress' ? 'Progress' : 'Done'}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => onEdit(task)}>Edit</button>
          <button className="btn btn-danger btn-sm" onClick={() => onDelete(task._id)}>Del</button>
        </div>
      </div>
    </div>
  );
}
