import { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useFetch } from '../hooks/useFetch';
import { useInterval } from '../hooks/useInterval';
import { getMatchDetails, getMatchScorecard } from '../services/api/cricketApi';
import { getVenueWeather } from '../services/api/weatherApi';
import { useAuth } from '../context/AuthContext';
import { toggleFollowMatch } from '../services/firebase/firestoreService';
import { enablePushNotifications } from '../services/firebase/messagingService';
import ScorecardTable from '../components/match/ScorecardTable';
import WeatherCard from '../components/weather/WeatherCard';
import { MatchSkeleton } from '../components/common/Skeleton';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';
import { formatScore, formatMatchDate } from '../utils/formatters';
import { FiBell, FiCheck } from 'react-icons/fi';
import './MatchDetails.css';

const TABS = ['Summary', 'Scorecard', 'Commentary', 'Stats', 'Squads', 'Weather'];
const LIVE_POLL_INTERVAL_MS = 60_000; // matches getMatchDetails/getMatchScorecard TTL — see cricketApi.js

export default function MatchDetails() {
  const { matchId } = useParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Summary');
  const [following, setFollowing] = useState(false);

  const { data: match, loading, error, refetch } = useFetch(
    () => getMatchDetails(matchId),
    [matchId]
  );

  const isLive = match?.matchStarted && !match?.matchEnded;

  // Summary tab score, and the scorecard once opened, both refresh on
  // their own while the match is actually live — paused automatically in
  // background tabs by useInterval, and stopped entirely once the match
  // ends so a finished match doesn't keep polling forever.
  useInterval(useCallback(() => refetch(), [refetch]), isLive ? LIVE_POLL_INTERVAL_MS : null);

  const { data: scorecard, loading: scorecardLoading, refetch: refetchScorecard } = useFetch(
    () => (activeTab === 'Scorecard' || activeTab === 'Stats' ? getMatchScorecard(matchId) : Promise.resolve(null)),
    [matchId, activeTab]
  );

  useInterval(
    useCallback(() => refetchScorecard(), [refetchScorecard]),
    isLive && (activeTab === 'Scorecard' || activeTab === 'Stats') ? LIVE_POLL_INTERVAL_MS : null
  );

  const { data: weather, loading: weatherLoading } = useFetch(
    () => (activeTab === 'Weather' && match?.venue ? getVenueWeather(match.venue.split(',')[0]) : Promise.resolve(null)),
    [activeTab, match?.venue]
  );

  const handleFollow = async () => {
    if (!user) {
      toast.error('Log in to follow this match');
      return;
    }
    try {
      const nowFollowing = await toggleFollowMatch(user.uid, { id: matchId, name: match.name });
      setFollowing(nowFollowing);
      toast.success(nowFollowing ? 'Following match' : 'Unfollowed match');

      // Best-effort: offer push notifications right when following a match
      // is the moment it's actually relevant, rather than a generic
      // settings toggle nobody notices. Never blocks the follow action
      // itself if permission is denied or the browser doesn't support it.
      if (nowFollowing && Notification?.permission === 'default') {
        try {
          const token = await enablePushNotifications(user.uid);
          if (token) toast.success('Score updates enabled for this match');
        } catch {
          // Silently ignore — following the match itself already succeeded.
        }
      }
    } catch {
      toast.error('Could not update follow status');
    }
  };

  if (loading) {
    return (
      <div className="container match-details-page">
        <MatchSkeleton />
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="container match-details-page">
        <ErrorMessage message={error || 'Match not found'} onRetry={refetch} />
      </div>
    );
  }

  const teamA = match.teams?.[0];
  const teamB = match.teams?.[1];
  const scoreA = match.score?.find((s) => s.inning?.startsWith(teamA));
  const scoreB = match.score?.find((s) => s.inning?.startsWith(teamB));

  return (
    <div className="match-details-page">
      <div className="match-header">
        <div className="container">
          <span className="match-header__series">{match.name}</span>
          {isLive && (
            <span className="match-header__live-badge">
              <span className="live-dot" /> LIVE &middot; updating every 60s
            </span>
          )}

          <div className="match-header__teams">
            <div className="match-header__team">
              <span>{teamA}</span>
              <strong>{formatScore(scoreA) || '-'}</strong>
            </div>
            <span className="match-header__vs">vs</span>
            <div className="match-header__team">
              <span>{teamB}</span>
              <strong>{formatScore(scoreB) || '-'}</strong>
            </div>
          </div>

          <p className="match-header__status">{match.status}</p>

          <div className="match-header__meta">
            <span>{match.venue}</span>
            <span>{formatMatchDate(match.date)}</span>
          </div>

          <button className="match-header__follow" onClick={handleFollow}>
            {following ? <FiCheck size={15} /> : <FiBell size={15} />}
            {following ? 'Following' : 'Follow Match'}
          </button>
        </div>
      </div>

      <div className="container">
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
          {activeTab === 'Summary' && (
            <div className="summary-grid">
              <div className="glass-card summary-stat">
                <span>Current Run Rate</span>
                <strong>{scoreA?.o ? (scoreA.r / scoreA.o).toFixed(2) : '-'}</strong>
              </div>
              <div className="glass-card summary-stat">
                <span>Overs</span>
                <strong>{scoreA?.o ?? '-'}</strong>
              </div>
              <div className="glass-card summary-stat">
                <span>Format</span>
                <strong>{match.matchType?.toUpperCase()}</strong>
              </div>
            </div>
          )}

          {activeTab === 'Scorecard' && (
            <>
              {scorecardLoading && <MatchSkeleton />}
              {!scorecardLoading && !scorecard?.scorecard?.length && (
                <EmptyState title="Scorecard not available" message="This provider doesn't have a detailed scorecard for this match." />
              )}
              {!scorecardLoading && scorecard?.scorecard?.map((inning, i) => (
                <ScorecardTable key={i} inning={inning} />
              ))}
            </>
          )}

          {activeTab === 'Commentary' && (
            <EmptyState title="Commentary not available" message="Ball-by-ball commentary isn't provided on this API plan." />
          )}

          {activeTab === 'Stats' && (
            <>
              {scorecardLoading && <MatchSkeleton />}
              {!scorecardLoading && !scorecard && (
                <EmptyState title="Stats not available" message="Detailed match stats need the scorecard feed, which is empty for this match." />
              )}
            </>
          )}

          {activeTab === 'Squads' && (
            <EmptyState title="Squads not available" message="Squad lists aren't included for this match on the free plan." />
          )}

          {activeTab === 'Weather' && (
            <>
              {weatherLoading && <MatchSkeleton />}
              {!weatherLoading && weather && <WeatherCard weather={weather} />}
              {!weatherLoading && !weather && (
                <EmptyState title="Weather unavailable" message="Couldn't resolve weather for this venue." />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
