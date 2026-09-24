import { useState, useMemo, useCallback } from 'react';
import { useFetch } from '../hooks/useFetch';
import { useInterval } from '../hooks/useInterval';
import { getAllMatches } from '../services/api/cricketApi';
import MatchCard from '../components/match/MatchCard';
import { MatchSkeleton } from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import ErrorMessage from '../components/common/ErrorMessage';
import { MATCH_STATUS_FILTERS, MATCH_FORMATS } from '../utils/constants';
import './Live.css';

const LIVE_POLL_INTERVAL_MS = 60_000; // matches getAllMatches/getLiveMatches TTL — see cricketApi.js

export default function Live() {
  const [statusFilter, setStatusFilter] = useState('All');
  const [formatFilter, setFormatFilter] = useState(null);

  const { data: matches, loading, error, refetch } = useFetch(() => getAllMatches(), []);

  const hasLiveMatch = useMemo(
    () => (matches || []).some((m) => m.matchStarted && !m.matchEnded),
    [matches]
  );

  // Only poll while at least one match is actually live — no point
  // refetching every 60s to watch a purely upcoming/completed list.
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

        // matchType from the API is only ever test/odi/t20/t10 — it has no
        // concept of "league" vs "international". We approximate that
        // distinction from well-known league names in the match/series
        // name instead of a blind prefix match, which used to filter
        // every match out for these two chips.
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
      <div className="live-page__head">
        <h1 className="live-page__title">Live Matches</h1>
        {hasLiveMatch && (
          <span className="live-page__auto-refresh">
            <span className="live-dot" /> Auto-refreshing every 60s
          </span>
        )}
      </div>

      <div className="live-page__filters">
        {MATCH_STATUS_FILTERS.map((f) => (
          <button
            key={f}
            className={`filter-chip${statusFilter === f ? ' filter-chip--active' : ''}`}
            onClick={() => setStatusFilter(f)}
          >
            {f}
          </button>
        ))}
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
        <EmptyState title="No matches found" message="Try a different filter, or check back later." />
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="live-page__grid">
          {filtered.map((m) => <MatchCard key={m.id} match={m} />)}
        </div>
      )}
    </div>
  );
}
