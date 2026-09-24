import { NavLink } from 'react-router-dom';
import { FiX } from 'react-icons/fi';
import './HamburgerMenu.css';

const LINKS = [
  { to: '/series', label: 'Series' },
  { to: '/teams', label: 'Teams' },
  { to: '/players', label: 'Players' },
  { to: '/rankings', label: 'Rankings' },
  { to: '/records', label: 'Records' },
  { to: '/news', label: 'News' },
];

export default function HamburgerMenu({ open, onClose }) {
  return (
    <>
      <div className={`menu-overlay${open ? ' menu-overlay--open' : ''}`} onClick={onClose} />
      <aside className={`hamburger-menu${open ? ' hamburger-menu--open' : ''}`}>
        <div className="hamburger-menu__header">
          <span className="hamburger-menu__logo">CRIC<span>PULSE</span></span>
          <button onClick={onClose} aria-label="Close menu">
            <FiX size={22} />
          </button>
        </div>
        <nav className="hamburger-menu__links">
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} onClick={onClose} className="hamburger-menu__link">
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
