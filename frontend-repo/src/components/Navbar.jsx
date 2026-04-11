import { useAuth } from '../context/AuthContext';
import '../App.css';

export default function Navbar() {
  const { logout } = useAuth();

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
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-logout" onClick={logout}>
          <span>⏻</span>
          LogOut
        </button>
      </div>
    </aside>
  );
}
