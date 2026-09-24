import { useFetch } from '../hooks/useFetch';
import { getSeries } from '../services/api/cricketApi';
import SeriesCard from '../components/series/SeriesCard';
import { TableSkeleton } from '../components/common/Skeleton';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';
import './Series.css';

export default function Series() {
  const { data: series, loading, error, refetch } = useFetch(() => getSeries(), []);

  return (
    <div className="container series-page">
      <h1 className="series-page__title">Series</h1>

      {loading && <TableSkeleton rows={8} />}
      {!loading && error && <ErrorMessage message={error} onRetry={refetch} />}
      {!loading && !error && !series?.length && (
        <EmptyState title="No series found" message="Check back later for upcoming tours and tournaments." />
      )}
      {!loading && !error && series?.length > 0 && (
        <div className="series-grid">
          {series.map((s) => <SeriesCard key={s.id} series={s} />)}
        </div>
      )}
    </div>
  );
}
