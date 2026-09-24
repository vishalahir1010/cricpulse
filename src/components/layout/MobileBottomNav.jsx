import { NavLink } from 'react-router-dom';
import { FiHome, FiRadio, FiCalendar, FiSearch, FiUser } from 'react-icons/fi';
import './MobileBottomNav.css';

const ITEMS = [
  { to: '/', icon: FiHome, label: 'Home', end: true },
  { to: '/live', icon: FiRadio, label: 'Live' },
  { to: '/matches', icon: FiCalendar, label: 'Matches' },
  { to: '/search', icon: FiSearch, label: 'Search' },
  { to: '/profile', icon: FiUser, label: 'Profile' },
];

export default function MobileBottomNav() {
  return (
    <nav className="bottom-nav">
      {ITEMS.map(({ to, icon: Icon, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => `bottom-nav__item${isActive ? ' bottom-nav__item--active' : ''}`}
        >
          <Icon size={20} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
