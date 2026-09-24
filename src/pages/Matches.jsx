import { useMemo } from 'react';
import { useFetch } from '../hooks/useFetch';
import { getAllMatches } from '../services/api/cricketApi';
import MatchCard from '../components/match/MatchCard';
import { MatchSkeleton } from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import ErrorMessage from '../components/common/ErrorMessage';
import './Matches.css';

function isSameDay(dateStr, ref) {
  const d = new Date(dateStr);
  return d.toDateString() === ref.toDateString();
}

export default function Matches() {
  const { data: matches, loading, error, refetch } = useFetch(() => getAllMatches(), []);

  const groups = useMemo(() => {
    if (!matches) return null;
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const weekAhead = new Date();
    weekAhead.setDate(today.getDate() + 7);

    const result = { today: [], tomorrow: [], thisWeek: [], upcoming: [], completed: [] };

    matches.forEach((m) => {
      const date = new Date(m.date || m.dateTimeGMT);
      if (m.matchEnded) {
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
  }, [matches]);

  const renderSection = (title, list) => {
    if (!list?.length) return null;
    return (
      <section className="matches-section">
        <h2>{title}</h2>
        <div className="matches-grid">
          {list.map((m) => <MatchCard key={m.id} match={m} />)}
        </div>
      </section>
    );
  };

  return (
    <div className="container matches-page">
      <h1 className="matches-page__title">Schedule</h1>

      {loading && (
        <div className="matches-grid">
          {Array.from({ length: 6 }).map((_, i) => <MatchSkeleton key={i} />)}
        </div>
      )}

      {!loading && error && <ErrorMessage message={error} onRetry={refetch} />}

      {!loading && !error && groups && (
        <>
          {renderSection('Today', groups.today)}
          {renderSection('Tomorrow', groups.tomorrow)}
          {renderSection('This Week', groups.thisWeek)}
          {renderSection('Upcoming', groups.upcoming)}
          {renderSection('Completed', groups.completed)}
          {Object.values(groups).every((g) => g.length === 0) && (
            <EmptyState title="No matches scheduled" message="Check back soon for upcoming fixtures." />
          )}
        </>
      )}
    </div>
  );
}
