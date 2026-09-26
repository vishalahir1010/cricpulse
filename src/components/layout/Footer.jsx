import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <span className="footer__logo">CRIC<span>PULSE</span></span>
          <p className="footer__tagline">Live Cricket. Real Stats. One Place.</p>
        </div>
        <div className="footer__links">
          <Link to="/">Home</Link>
          <Link to="/live">Live</Link>
          <Link to="/matches">Matches</Link>
          <Link to="/series">Series</Link>
          <Link to="/teams">Teams</Link>
          <Link to="/players">Players</Link>
          <Link to="/rankings">Rankings</Link>
          <Link to="/records">Records</Link>
          <Link to="/news">News</Link>
        </div>
      </div>
      <div className="container">
        <div className="footer__bottom">
          <p className="footer__copy">© {new Date().getFullYear()} CricPulse. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
