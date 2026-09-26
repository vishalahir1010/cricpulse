import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiHeart, FiArrowLeft, FiUser } from 'react-icons/fi';
import { useFetch } from '../hooks/useFetch';
import { getPlayerDetails } from '../services/api/cricketApi';
import { useAuth } from '../context/AuthContext';
import { toggleFavorite } from '../services/firebase/firestoreService';
import PlayerStatsTable from '../components/player/PlayerStatsTable';
import { MatchSkeleton } from '../components/common/Skeleton';
import ErrorMessage from '../components/common/ErrorMessage';
import './PlayerDetails.css';

function buildStatsByFormat(player) {
  const formats = ['test', 'odi', 't20'];
  const labels = { test: 'Test', odi: 'ODI', t20: 'T20' };
  return formats
    .filter((f) => player.battingStats?.[f] || player.bowlingStats?.[f])
    .map((f) => {
      const bat = player.battingStats?.[f] || {};
      const bowl = player.bowlingStats?.[f] || {};
      return {
        format: labels[f],
        matches: bat.Matches,
        runs: bat.Runs,
        avg: bat.Average,
        sr: bat.SR,
        hundreds: bat['100s'],
        fifties: bat['50s'],
        wickets: bowl.Wickets,
      };
    });
}

export default function PlayerDetails() {
  const { playerId } = useParams();
  const { user } = useAuth();
  const [favorited, setFavorited] = useState(false);

  const { data: player, loading, error, refetch } = useFetch(
    () => getPlayerDetails(playerId),
    [playerId]
  );

  const handleFavorite = async () => {
    if (!user) {
      toast.error('Log in to favorite players');
      return;
    }
    try {
      const isFav = await toggleFavorite(user.uid, 'player', { id: playerId, name: player.name });
      setFavorited(isFav);
      toast.success(isFav ? 'Added to favorites' : 'Removed from favorites');
    } catch {
      toast.error('Could not update favorites');
    }
  };

  if (loading) return <div className="container player-details-page"><MatchSkeleton /></div>;
  if (error || !player) {
    return (
      <div className="container player-details-page">
        <ErrorMessage message={error || 'Player not found'} onRetry={refetch} />
      </div>
    );
  }

  const statsByFormat = buildStatsByFormat(player);

  return (
    <div className="container player-details-page">
      <Link to="/players" className="match-details__back-link">
        <FiArrowLeft size={16} /> Back to Players
      </Link>

      <div className="player-details-hero glass-card">
        <div className="player-details-hero__avatar-wrap">
          <img
            src={player.playerImg || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(player.name)}&backgroundType=gradientLinear`}
            alt={player.name}
            className="player-details-hero__img"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(player.name)}&backgroundType=gradientLinear`;
            }}
          />
        </div>
        <div className="player-details-hero__info">
          <h1 className="page-title">{player.name}</h1>
          <p className="player-details-hero__meta">
            <span>{player.country || 'International'}</span>
            {player.role && <span className="player-details-hero__role-badge">{player.role}</span>}
          </p>
          <button
            className={`btn btn--sm ${favorited ? 'btn--primary' : 'btn--outline'}`}
            onClick={handleFavorite}
          >
            <FiHeart size={14} fill={favorited ? 'currentColor' : 'none'} />
            {favorited ? 'Favorited' : 'Favorite Player'}
          </button>
        </div>
      </div>

      <div className="player-details-section">
        <h2 className="player-details-section__title">Career Statistics</h2>
        {statsByFormat.length > 0 ? (
          <PlayerStatsTable statsByFormat={statsByFormat} />
        ) : (
          <p className="player-details-page__no-stats">
            Detailed career stats aren't available for this player on the current plan.
          </p>
        )}
      </div>
    </div>
  );
}
