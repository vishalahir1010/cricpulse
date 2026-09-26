import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { useInterval } from '../hooks/useInterval';
import { getAllMatches } from '../services/api/cricketApi';
import MatchCard from '../components/match/MatchCard';
import { MatchSkeleton } from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import ErrorMessage from '../components/common/ErrorMessage';
import { MATCH_FORMATS } from '../utils/constants';
import './Live.css';

const LIVE_POLL_INTERVAL_MS = 60_000;

export default function Live() {
  const [statusFilter, setStatusFilter] = useState('Live');
  const [formatFilter, setFormatFilter] = useState(null);

  const { data: matches, loading, error, refetch } = useFetch(() => getAllMatches(), []);

  const liveMatches = useMemo(
    () => (matches || []).filter((m) => m.matchStarted && !m.matchEnded),
    [matches]
  );
  const liveCount = liveMatches.length;

  const hasLiveMatch = liveCount > 0;

  useInterval(useCallback(() => refetch(), [refetch]), hasLiveMatch ? LIVE_POLL_INTERVAL_MS : null);

  const filtered = useMemo(() => {
    if (!matches) return [];
    return matches.filter((m) => {
      const isLive = m.matchStarted && !m.matchEnded;
      const isUpcoming = !m.matchStarted;
      const isCompleted = m.matchEnded;

      if (statusFilter === 'Live' && !isLive) return false;
      if (statusFilter === 'Upcoming' && !isUpcoming) return false;
      if (statusFilter === 'Completed' && !isCompleted) return false;

      if (formatFilter) {
        const type = (m.matchType || '').toLowerCase();
        const name = (m.name || '').toLowerCase();
        const LEAGUE_KEYWORDS = ['ipl', 'psl', 'bbl', 'cpl', 'bpl', 't10 league', 'the hundred', 'super smash', 'lpl'];
        const isLeague = LEAGUE_KEYWORDS.some((kw) => name.includes(kw));

        if (formatFilter === 'Women' && !name.includes('women')) return false;
        if (formatFilter === 'League' && !isLeague) return false;
        if (formatFilter === 'International' && (isLeague || name.includes('women'))) return false;
        if (['Test', 'ODI', 'T20'].includes(formatFilter) && !type.includes(formatFilter.toLowerCase())) return false;
      }
      return true;
    });
  }, [matches, statusFilter, formatFilter]);

  return (
    <div className="container live-page">
      <div className="page-header live-page__header">
        <div>
          <h1 className="page-title">Live Matches</h1>
          <p className="page-subtitle">Watch live cricket matches, ball-by-ball, with real-time scores and updates.</p>
        </div>
        {hasLiveMatch && (
          <div className="live-page__auto-refresh">
            <span className="live-dot" /> Auto-refreshing every 60s
          </div>
        )}
      </div>

      <div className="live-page__filters">
        <button
          className={`filter-chip${statusFilter === 'Live' ? ' filter-chip--active' : ''}`}
          onClick={() => setStatusFilter('Live')}
        >
          <span className="live-dot" style={{ width: 6, height: 6 }} /> Live Now ({loading ? '…' : liveCount})
        </button>
        <button
          className={`filter-chip${statusFilter === 'All' ? ' filter-chip--active' : ''}`}
          onClick={() => setStatusFilter('All')}
        >
          All Matches
        </button>
        <button
          className={`filter-chip${statusFilter === 'Upcoming' ? ' filter-chip--active' : ''}`}
          onClick={() => setStatusFilter('Upcoming')}
        >
          Upcoming
        </button>
        <button
          className={`filter-chip${statusFilter === 'Completed' ? ' filter-chip--active' : ''}`}
          onClick={() => setStatusFilter('Completed')}
        >
          Completed
        </button>

        <span className="live-page__divider" />

        {MATCH_FORMATS.map((f) => (
          <button
            key={f}
            className={`filter-chip${formatFilter === f ? ' filter-chip--active' : ''}`}
            onClick={() => setFormatFilter(formatFilter === f ? null : f)}
          >
            {f}
          </button>
        ))}
      </div>

      {loading && (
        <div className="live-page__grid">
          {Array.from({ length: 6 }).map((_, i) => <MatchSkeleton key={i} />)}
        </div>
      )}

      {!loading && error && <ErrorMessage message={error} onRetry={refetch} />}

      {!loading && !error && filtered.length === 0 && (
        <EmptyState
          title={statusFilter === 'Live' ? 'No live matches right now' : 'No matches found'}
          message={statusFilter === 'Live' ? 'Check back soon, or browse upcoming fixtures.' : 'Try a different filter.'}
        />
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="live-page__grid">
          {filtered.map((m) => <MatchCard key={m.id} match={m} />)}
        </div>
      )}

      <div className="live-banner glass-card">
        <div className="live-banner__content">
          <h3>Cricket, Unfolded Live</h3>
          <p>Get real-time scores, ball-by-ball updates, and instant series standings.</p>
        </div>
        <Link to="/matches" className="btn btn--primary btn--md">
          Explore Schedule →
        </Link>
      </div>
    </div>
  );
}
