import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import './PlayerCard.css';

function fallbackAvatar(name) {
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundType=gradientLinear`;
}

export default function PlayerCard({ player }) {
  const subtitle = [player.country, player.role].filter(Boolean).join(' · ');

  return (
    <div className="player-card glass-card">
      <div className="player-card__avatar-wrap">
        <img
          src={player.playerImg || fallbackAvatar(player.name)}
          alt={player.name}
          className="player-card__img"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = fallbackAvatar(player.name);
          }}
        />
      </div>
      <div className="player-card__info">
        <h3 className="player-card__name">{player.name}</h3>
        <p className="player-card__meta">{subtitle || 'Cricket Player'}</p>
      </div>
      <Link to={`/players/${player.id}`} className="player-card__action">
        View Profile <FiArrowRight size={13} />
      </Link>
    </div>
  );
}
