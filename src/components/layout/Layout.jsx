import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import HamburgerMenu from './HamburgerMenu';
import MobileBottomNav from './MobileBottomNav';
import Footer from './Footer';
import InstallPrompt from '../common/InstallPrompt';

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="app-shell">
      <Navbar onMenuClick={() => setMenuOpen(true)} />
      <HamburgerMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <main className="app-main">
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
      <InstallPrompt />
    </div>
  );
}
