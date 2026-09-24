import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import { useDebounce } from '../hooks/useDebounce';
import { searchPlayers } from '../services/api/cricketApi';
import PlayerCard from '../components/player/PlayerCard';
import Button from '../components/common/Button';
import { PlayerSkeleton } from '../components/common/Skeleton';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';
import './Players.css';

const PAGE_SIZE = 8;

export default function Players() {
  const [term, setTerm] = useState('kohli');
  const debouncedTerm = useDebounce(term, 400);

  const [players, setPlayers] = useState([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const loadFirstPage = useCallback(async () => {
    const q = debouncedTerm.trim();
    if (!q) {
      setPlayers([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const results = await searchPlayers(q, 0);
      setPlayers(results);
      setOffset(results.length);
      setHasMore(results.length === PAGE_SIZE);
    } catch (err) {
      setError(err.message || 'Could not search players');
    } finally {
      setLoading(false);
    }
  }, [debouncedTerm]);

  useEffect(() => {
    loadFirstPage();
  }, [loadFirstPage]);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    try {
      const results = await searchPlayers(debouncedTerm.trim(), offset);
      setPlayers((prev) => [...prev, ...results]);
      setOffset((prev) => prev + results.length);
      setHasMore(results.length === PAGE_SIZE);
    } catch {
      setError('Could not load more players');
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="container players-page">
      <div className="players-page__head">
        <h1>Players</h1>
        <Link to="/players/compare" className="players-page__compare-link">Compare Players →</Link>
      </div>

      <div className="players-page__search">
        <FiSearch size={16} />
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search players by name..."
        />
      </div>

      {loading && (
        <div className="players-grid">
          {Array.from({ length: 8 }).map((_, i) => <PlayerSkeleton key={i} />)}
        </div>
      )}

      {!loading && error && <ErrorMessage message={error} onRetry={loadFirstPage} />}

      {!loading && !error && !players.length && (
        <EmptyState title="No players found" message="Try a different search term." />
      )}

      {!loading && !error && players.length > 0 && (
        <>
          <div className="players-grid">
            {players.map((p) => <PlayerCard key={p.id} player={p} />)}
          </div>

          {hasMore && (
            <div className="players-page__load-more">
              <Button variant="outline" onClick={handleLoadMore} disabled={loadingMore}>
                {loadingMore ? 'Loading…' : 'Load more'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
