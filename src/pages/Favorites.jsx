import { Link } from 'react-router-dom';
import { FiStar, FiShield, FiUser, FiChevronRight } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useFetch } from '../hooks/useFetch';
import { getFavorites } from '../services/firebase/firestoreService';
import { TableSkeleton } from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import './Favorites.css';

export default function Favorites() {
  const { user } = useAuth();

  const { data: favTeams, loading: teamsLoading } = useFetch(
    () => (user ? getFavorites(user.uid, 'team') : Promise.resolve([])),
    [user?.uid]
  );
  const { data: favPlayers, loading: playersLoading } = useFetch(
    () => (user ? getFavorites(user.uid, 'player') : Promise.resolve([])),
    [user?.uid]
  );

  const loading = teamsLoading || playersLoading;
  const isEmpty = !loading && !favTeams?.length && !favPlayers?.length;

  return (
    <div className="container favorites-page">
      <div className="page-header">
        <h1 className="page-title">Favorites</h1>
        <p className="page-subtitle">Your saved cricket teams and players for quick tracking.</p>
      </div>

      {loading && <TableSkeleton rows={4} />}

      {isEmpty && (
        <EmptyState
          title="No favorites yet"
          message="Star teams and players from their respective profile pages to track them quickly here."
        />
      )}

      {!loading && favTeams?.length > 0 && (
        <section className="favorites-section">
          <div className="favorites-section__head">
            <FiShield className="favorites-section__icon" />
            <h2>Favorite Teams ({favTeams.length})</h2>
          </div>
          <div className="favorites-grid">
            {favTeams.map((t) => (
              <Link key={t.id} to={`/teams/${t.id}`} className="favorites-card glass-card">
                <span className="favorites-card__title">{t.name}</span>
                <FiChevronRight className="favorites-card__arrow" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {!loading && favPlayers?.length > 0 && (
        <section className="favorites-section">
          <div className="favorites-section__head">
            <FiUser className="favorites-section__icon" />
            <h2>Favorite Players ({favPlayers.length})</h2>
          </div>
          <div className="favorites-grid">
            {favPlayers.map((p) => (
              <Link key={p.id} to={`/players/${p.id}`} className="favorites-card glass-card">
                <span className="favorites-card__title">{p.name}</span>
                <FiChevronRight className="favorites-card__arrow" />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
