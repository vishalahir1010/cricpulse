import { Link } from 'react-router-dom';
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
      <h1>Favorites</h1>

      {loading && <TableSkeleton rows={4} />}

      {isEmpty && (
        <EmptyState
          title="No favorites yet"
          message="Favorite teams and players from their profile pages to see them here."
        />
      )}

      {!loading && favTeams?.length > 0 && (
        <section className="favorites-section">
          <h2>⭐ Teams</h2>
          <div className="favorites-section__list">
            {favTeams.map((t) => (
              <Link key={t.id} to={`/teams/${t.id}`} className="glass-card favorites-chip">{t.name}</Link>
            ))}
          </div>
        </section>
      )}

      {!loading && favPlayers?.length > 0 && (
        <section className="favorites-section">
          <h2>❤️ Players</h2>
          <div className="favorites-section__list">
            {favPlayers.map((p) => (
              <Link key={p.id} to={`/players/${p.id}`} className="glass-card favorites-chip">{p.name}</Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
