import { Link } from 'react-router-dom';
import './TeamCard.css';

export default function TeamCard({ team }) {
  return (
    <Link to={`/teams/${team.id}`} className="team-card glass-card">
      {team.img && <img src={team.img} alt={team.name} className="team-card__logo" />}
      <span className="team-card__name">{team.name}</span>
    </Link>
  );
}
