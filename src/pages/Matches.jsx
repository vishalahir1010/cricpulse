import { useState, useMemo } from 'react';
import { useFetch } from '../hooks/useFetch';
import { getAllMatches } from '../services/api/cricketApi';
import MatchCard from '../components/match/MatchCard';
import { MatchSkeleton } from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import ErrorMessage from '../components/common/ErrorMessage';
import { formatMatchDate } from '../utils/formatters';
import './Matches.css';

function isSameDay(dateStr, ref) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  return d.toDateString() === ref.toDateString();
}

export default function Matches() {
  const [tab, setTab] = useState('All');
  const { data: matches, loading, error, refetch } = useFetch(() => getAllMatches(), []);

  const counts = useMemo(() => {
    if (!matches) return { live: 0, upcoming: 0, completed: 0, all: 0 };
    return {
      live: matches.filter((m) => m.matchStarted && !m.matchEnded).length,
      upcoming: matches.filter((m) => !m.matchStarted).length,
      completed: matches.filter((m) => m.matchEnded).length,
      all: matches.length,
    };
  }, [matches]);

  const filteredMatches = useMemo(() => {
    if (!matches) return [];
    if (tab === 'Live') return matches.filter((m) => m.matchStarted && !m.matchEnded);
    if (tab === 'Upcoming') return matches.filter((m) => !m.matchStarted);
    if (tab === 'Completed') return matches.filter((m) => m.matchEnded);
    return matches;
  }, [matches, tab]);

  const groups = useMemo(() => {
    if (!filteredMatches) return null;
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const weekAhead = new Date();
    weekAhead.setDate(today.getDate() + 7);

    const result = { live: [], today: [], tomorrow: [], thisWeek: [], upcoming: [], completed: [] };

    filteredMatches.forEach((m) => {
      const date = new Date(m.date || m.dateTimeGMT);
      if (m.matchStarted && !m.matchEnded) {
        result.live.push(m);
      } else if (m.matchEnded) {
        result.completed.push(m);
      } else if (isSameDay(date, today)) {
        result.today.push(m);
      } else if (isSameDay(date, tomorrow)) {
        result.tomorrow.push(m);
      } else if (date <= weekAhead) {
        result.thisWeek.push(m);
      } else {
        result.upcoming.push(m);
      }
    });
    return result;
  }, [filteredMatches]);

  const renderSection = (title, list) => {
    if (!list?.length) return null;
    return (
      <section className="matches-section">
        <div className="matches-section__header">
          <span className="matches-section__dot" />
          <h2>{title}</h2>
          <span className="matches-section__count">({list.length})</span>
        </div>
        <div className="matches-grid">
          {list.map((m) => <MatchCard key={m.id} match={m} />)}
        </div>
      </section>
    );
  };

  return (
    <div className="container matches-page">
      <div className="page-header">
        <h1 className="page-title">Matches</h1>
        <p className="page-subtitle">Find all upcoming, live and completed cricket fixtures.</p>
      </div>

      <div className="matches-page__tabs">
        <button
          className={`filter-chip${tab === 'All' ? ' filter-chip--active' : ''}`}
          onClick={() => setTab('All')}
        >
          All Matches ({loading ? '…' : counts.all})
        </button>
        <button
          className={`filter-chip${tab === 'Live' ? ' filter-chip--active' : ''}`}
          onClick={() => setTab('Live')}
        >
          <span className="live-dot" style={{ width: 6, height: 6 }} /> Live Matches ({loading ? '…' : counts.live})
        </button>
        <button
          className={`filter-chip${tab === 'Upcoming' ? ' filter-chip--active' : ''}`}
          onClick={() => setTab('Upcoming')}
        >
          Upcoming ({loading ? '…' : counts.upcoming})
        </button>
        <button
          className={`filter-chip${tab === 'Completed' ? ' filter-chip--active' : ''}`}
          onClick={() => setTab('Completed')}
        >
          Completed ({loading ? '…' : counts.completed})
        </button>
      </div>

      {loading && (
        <div className="matches-grid">
          {Array.from({ length: 6 }).map((_, i) => <MatchSkeleton key={i} />)}
        </div>
      )}

      {!loading && error && <ErrorMessage message={error} onRetry={refetch} />}

      {!loading && !error && groups && (
        <>
          {renderSection('Live Matches', groups.live)}
          {renderSection(`Today, ${formatMatchDate(new Date())}`, groups.today)}
          {renderSection('Tomorrow', groups.tomorrow)}
          {renderSection('This Week', groups.thisWeek)}
          {renderSection('Upcoming Fixtures', groups.upcoming)}
          {renderSection('Completed Matches', groups.completed)}

          {Object.values(groups).every((g) => g.length === 0) && (
            <EmptyState title="No matches found" message="No matches match the selected criteria." />
          )}
        </>
      )}
    </div>
  );
}
