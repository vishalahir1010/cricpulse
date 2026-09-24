import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div>
          <span className="footer__logo">CRIC<span>PULSE</span></span>
          <p className="footer__tagline">Live Cricket. Real Stats. One Place.</p>
        </div>
        <div className="footer__links">
          <Link to="/matches">Matches</Link>
          <Link to="/series">Series</Link>
          <Link to="/players">Players</Link>
          <Link to="/news">News</Link>
        </div>
      </div>
      <p className="footer__copy">© {new Date().getFullYear()} CricPulse. All rights reserved.</p>
    </footer>
  );
}
