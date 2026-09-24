import { Link } from 'react-router-dom';
import './PlayerCard.css';

// `player` follows CricAPI players shape: { id, name, country, role?, playerImg? }
// The free /players search endpoint rarely includes playerImg (only the
// single-player /players_info detail call does), so most cards fall back —
// a per-player generated avatar (initials, colored by name) looks far
// better than one generic icon repeated across every card.
function fallbackAvatar(name) {
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundType=gradientLinear`;
}

export default function PlayerCard({ player }) {
  return (
    <Link to={`/players/${player.id}`} className="player-card glass-card">
      <img
        src={player.playerImg || fallbackAvatar(player.name)}
        alt={player.name}
        className="player-card__img"
      />
      <span className="player-card__name">{player.name}</span>
      {player.country && <span className="player-card__country">{player.country}</span>}
      {player.role && <span className="player-card__role">{player.role}</span>}
    </Link>
  );
}
