import { useState, useMemo } from 'react';
import { useFetch } from '../hooks/useFetch';
import { getSeries } from '../services/api/cricketApi';
import SeriesCard from '../components/series/SeriesCard';
import { MatchSkeleton } from '../components/common/Skeleton';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';
import './Series.css';

const SERIES_TABS = ['All', 'International', 'Domestic', 'T20I', 'ODI', 'Test'];

export default function Series() {
  const [filter, setFilter] = useState('All');
  const { data: series, loading, error, refetch } = useFetch(() => getSeries(), []);

  const filteredSeries = useMemo(() => {
    if (!series) return [];
    if (filter === 'All') return series;
    return series.filter((s) => {
      const name = (s.name || '').toLowerCase();
      if (filter === 'Test') return s.test || name.includes('test');
      if (filter === 'ODI') return s.odi || name.includes('odi');
      if (filter === 'T20I') return s.t20 || name.includes('t20');
      if (filter === 'International') return !name.includes('league') && !name.includes('trophy') && !name.includes('cup domestic');
      if (filter === 'Domestic') return name.includes('league') || name.includes('trophy') || name.includes('premier') || name.includes('bbl') || name.includes('ipl');
      return true;
    });
  }, [series, filter]);

  return (
    <div className="container series-page">
      <div className="page-header">
        <h1 className="page-title">Cricket Series</h1>
        <p className="page-subtitle">Explore ongoing and upcoming cricket tournaments, tours and series.</p>
      </div>

      <div className="series-page__filters">
        {SERIES_TABS.map((t) => (
          <button
            key={t}
            className={`filter-chip${filter === t ? ' filter-chip--active' : ''}`}
            onClick={() => setFilter(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {loading && (
        <div className="series-grid">
          {Array.from({ length: 6 }).map((_, i) => <MatchSkeleton key={i} />)}
        </div>
      )}

      {!loading && error && <ErrorMessage message={error} onRetry={refetch} />}

      {!loading && !error && !filteredSeries?.length && (
        <EmptyState title="No series found" message="Try a different filter, or check back later for new schedules." />
      )}

      {!loading && !error && filteredSeries?.length > 0 && (
        <div className="series-grid">
          {filteredSeries.map((s) => <SeriesCard key={s.id} series={s} />)}
        </div>
      )}
    </div>
  );
}
