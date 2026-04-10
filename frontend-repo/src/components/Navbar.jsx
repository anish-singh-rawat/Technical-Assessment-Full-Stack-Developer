import { useAuth } from '../context/AuthContext';
import '../App.css';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <span className="navbar-brand">TaskBoard</span>
      <div className="navbar-right">
        <span className="navbar-user">{user?.name}</span>
        <span className={`role-badge ${user?.role}`}>{user?.role}</span>
        <button className="btn btn-ghost btn-sm" onClick={logout}>Logout</button>
      </div>
    </nav>
  );
}
