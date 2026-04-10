import { TASK_STATUS, TASK_STATUS_LIST } from '../utils/constants';
import '../App.css';

const fmt = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const statusClass = {
  [TASK_STATUS.TODO]: 'status-todo',
  [TASK_STATUS.IN_PROGRESS]: 'status-in-progress',
  [TASK_STATUS.DONE]: 'status-done',
};

export default function TaskCard({ task, onEdit, onDelete, onMove }) {
  const otherStatuses = TASK_STATUS_LIST.filter((s) => s !== task.status);

  return (
    <div className="task-card">
      <div className="task-card-title">{task.title}</div>
      {task.description && <div className="task-card-desc">{task.description}</div>}
      <div className="task-card-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className={`status-badge ${statusClass[task.status]}`}>{task.status}</span>
          <span className="task-date">{fmt(task.createdAt)}</span>
        </div>
        <div className="task-card-actions">
          <div className="move-btns">
            {otherStatuses.map((s) => (
              <button key={s} className="move-btn" onClick={() => onMove(task._id, s)} title={`Move to ${s}`}>
                → {s === TASK_STATUS.TODO ? 'Todo' : s === TASK_STATUS.IN_PROGRESS ? 'Progress' : 'Done'}
              </button>
            ))}
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => onEdit(task)}>Edit</button>
          <button className="btn btn-danger btn-sm" onClick={() => onDelete(task._id)}>Del</button>
        </div>
      </div>
    </div>
  );
}
