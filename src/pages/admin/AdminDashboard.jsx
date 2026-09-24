import { NavLink, Outlet } from 'react-router-dom';
import AdminNews from './AdminNews';
import './AdminDashboard.css';

const TABS = [
  { to: 'news', label: 'News' },
  { to: 'comments', label: 'Comments' },
  { to: 'polls', label: 'Polls' },
  { to: 'users', label: 'Users' },
];

export default function AdminDashboard() {
  return (
    <div className="container admin-dashboard">
      <h1>Admin Dashboard</h1>

      <nav className="admin-dashboard__tabs">
        {TABS.map((t) => (
          <NavLink key={t.to} to={t.to} className={({ isActive }) => `admin-dashboard__tab${isActive ? ' admin-dashboard__tab--active' : ''}`}>
            {t.label}
          </NavLink>
        ))}
      </nav>

      <div className="admin-dashboard__content">
        <Outlet />
      </div>
    </div>
  );
}
