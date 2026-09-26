import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { getSeriesDetails } from '../services/api/cricketApi';
import MatchCard from '../components/match/MatchCard';
import { MatchSkeleton } from '../components/common/Skeleton';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';
import { formatMatchDate } from '../utils/formatters';
import { FiArrowLeft, FiCalendar, FiAward } from 'react-icons/fi';
import './SeriesDetails.css';

const TABS = ['Overview', 'Matches', 'Points Table', 'Squads', 'Statistics'];

export default function SeriesDetails() {
  const { seriesId } = useParams();
  const [activeTab, setActiveTab] = useState('Overview');

  const { data: series, loading, error, refetch } = useFetch(() => getSeriesDetails(seriesId), [seriesId]);

  if (loading) return <div className="container series-details-page"><MatchSkeleton /></div>;
  if (error || !series) {
    return (
      <div className="container series-details-page">
        <ErrorMessage message={error || 'Series not found'} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="container series-details-page">
      <Link to="/series" className="match-details__back-link">
        <FiArrowLeft size={16} /> Back to Series
      </Link>

      <div className="series-details-hero glass-card">
        <div className="series-details-hero__top">
          <div className="series-details-hero__icon">
            <FiAward size={26} />
          </div>
          <div>
            <h1 className="page-title">{series.info?.name}</h1>
            <p className="series-details-hero__dates">
              <FiCalendar size={14} />
              {formatMatchDate(series.info?.startdate)} – {formatMatchDate(series.info?.enddate)} · {series.info?.matches} matches
            </p>
          </div>
        </div>
      </div>

      <div className="match-tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`match-tabs__btn${activeTab === tab ? ' match-tabs__btn--active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="match-tab-content">
        {activeTab === 'Overview' && (
          <div className="summary-grid">
            <div className="glass-card summary-stat">
              <span>Total Matches</span>
              <strong>{series.info?.matches ?? '-'}</strong>
            </div>
            <div className="glass-card summary-stat">
              <span>ODIs</span>
              <strong>{series.info?.odi ?? 0}</strong>
            </div>
            <div className="glass-card summary-stat">
              <span>T20s</span>
              <strong>{series.info?.t20 ?? 0}</strong>
            </div>
            <div className="glass-card summary-stat">
              <span>Tests</span>
              <strong>{series.info?.test ?? 0}</strong>
            </div>
          </div>
        )}

        {activeTab === 'Matches' && (
          <>
            {!series.matchList?.length ? (
              <EmptyState title="No matches listed" message="This series doesn't have a published fixture list yet." />
            ) : (
              <div className="matches-grid">
                {series.matchList.map((m) => <MatchCard key={m.id} match={m} />)}
              </div>
            )}
          </>
        )}

        {activeTab === 'Points Table' && (
          <EmptyState title="Points table not available" message="This series doesn't publish a standings table on the free plan." />
        )}

        {activeTab === 'Squads' && (
          <EmptyState title="Squads not available" message="Squad lists aren't included for this series on the free plan." />
        )}

        {activeTab === 'Statistics' && (
          <EmptyState title="Statistics not available" message="Series-wide stats aren't provided on the free plan." />
        )}
      </div>
    </div>
  );
}
