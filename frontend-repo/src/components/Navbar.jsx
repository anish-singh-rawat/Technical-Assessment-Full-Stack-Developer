import { useAuth } from '../context/AuthContext';
import '../App.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="sidebar-logo-text">
          Task<span>Board</span>
        </span>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-item active">
          <span className="nav-icon">▦</span>
          Dashboard
        </div>
        {isAdmin && (
          <div className="nav-item">
            <span className="nav-icon">👥</span>
            All Customers
          </div>
        )}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-logout" onClick={logout}>
          <span>⏻</span>
          LogOut
        </button>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Help</span>
      </div>
    </aside>
  );
}
