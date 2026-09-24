import { NavLink, Link } from 'react-router-dom';
import { FiSun, FiMoon, FiMenu, FiSearch, FiUser, FiShield } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/live', label: 'Live' },
  { to: '/matches', label: 'Matches' },
  { to: '/series', label: 'Series' },
  { to: '/teams', label: 'Teams' },
  { to: '/players', label: 'Players' },
  { to: '/rankings', label: 'Rankings' },
  { to: '/records', label: 'Records' },
  { to: '/news', label: 'News' },
];

export default function Navbar({ onMenuClick }) {
  const { theme, toggleTheme } = useTheme();
  const { user, isAdmin } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar__inner container">
        <button className="navbar__hamburger" onClick={onMenuClick} aria-label="Open menu">
          <FiMenu size={22} />
        </button>

        <Link to="/" className="navbar__logo">
          CRIC<span>PULSE</span>
        </Link>

        <nav className="navbar__links">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `navbar__link${isActive ? ' navbar__link--active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="navbar__actions">
          {isAdmin && (
            <Link to="/admin/news" className="navbar__icon-btn" aria-label="Admin dashboard" title="Admin dashboard">
              <FiShield size={18} />
            </Link>
          )}
          <Link to="/search" className="navbar__icon-btn navbar__icon-btn--search" aria-label="Search">
            <FiSearch size={19} />
          </Link>
          <button className="navbar__icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <FiSun size={19} /> : <FiMoon size={19} />}
          </button>
          <Link to={user ? '/profile' : '/login'} className="navbar__icon-btn navbar__profile" aria-label="Profile">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="navbar__avatar" />
            ) : (
              <FiUser size={19} />
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
