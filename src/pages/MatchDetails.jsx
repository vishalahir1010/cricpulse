import { useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
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
import { formatScore, formatMatchDate, formatMatchTime } from '../utils/formatters';
import { FiBell, FiCheck, FiArrowLeft, FiMapPin, FiCalendar } from 'react-icons/fi';
import './MatchDetails.css';

const TABS = ['Summary', 'Scorecard', 'Commentary', 'Stats', 'Squads', 'Weather'];
const LIVE_POLL_INTERVAL_MS = 60_000;

function TeamBadge({ name, img }) {
  if (img) {
    return <img src={img} alt={name || ''} className="match-header__team-logo" />;
  }
  const initials = (name || 'TBD')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return <div className="match-header__team-avatar">{initials}</div>;
}

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

      if (nowFollowing && Notification?.permission === 'default') {
        try {
          const token = await enablePushNotifications(user.uid);
          if (token) toast.success('Score updates enabled for this match');
        } catch {
          // ignore
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

  const teamA = match.teams?.[0] || 'Team A';
  const teamB = match.teams?.[1] || 'Team B';
  const teamAInfo = match.teamInfo?.find((t) => t.name === teamA || t.shortname === teamA);
  const teamBInfo = match.teamInfo?.find((t) => t.name === teamB || t.shortname === teamB);

  const scoreA = match.score?.find((s) => s.inning?.startsWith(teamA));
  const scoreB = match.score?.find((s) => s.inning?.startsWith(teamB));

  return (
    <div className="match-details-page">
      <div className="container">
        <Link to="/matches" className="match-details__back-link">
          <FiArrowLeft size={16} /> Back to Matches
        </Link>
      </div>

      <div className="container">
        <div className="match-hero glass-card">
          <div className="match-hero__top">
            <div>
              <span className="match-hero__series">{match.name}</span>
              <div className="match-hero__meta">
                {match.venue && (
                  <span><FiMapPin size={13} /> {match.venue}</span>
                )}
                <span><FiCalendar size={13} /> {formatMatchDate(match.date)} {formatMatchTime(match.dateTimeGMT) ? `· ${formatMatchTime(match.dateTimeGMT)}` : ''}</span>
              </div>
            </div>

            <div className="match-hero__actions">
              {isLive && (
                <span className="live-badge">
                  <span className="live-dot" /> LIVE
                </span>
              )}
              <button
                className={`btn btn--sm ${following ? 'btn--primary' : 'btn--outline'}`}
                onClick={handleFollow}
              >
                {following ? <FiCheck size={14} /> : <FiBell size={14} />}
                {following ? 'Following' : 'Follow Match'}
              </button>
            </div>
          </div>

          <div className="match-hero__scoreboard">
            <div className="match-hero__team">
              <div className="match-hero__team-info">
                <TeamBadge name={teamA} img={teamAInfo?.img} />
                <span className="match-hero__team-name">{teamA}</span>
              </div>
              <div className="match-hero__team-score">
                <strong>{formatScore(scoreA) || '—'}</strong>
                {scoreA?.o && <span className="match-hero__overs">({scoreA.o} ov)</span>}
              </div>
            </div>

            <div className="match-hero__vs">VS</div>

            <div className="match-hero__team match-hero__team--right">
              <div className="match-hero__team-info">
                <TeamBadge name={teamB} img={teamBInfo?.img} />
                <span className="match-hero__team-name">{teamB}</span>
              </div>
              <div className="match-hero__team-score">
                <strong>{formatScore(scoreB) || '—'}</strong>
                {scoreB?.o && <span className="match-hero__overs">({scoreB.o} ov)</span>}
              </div>
            </div>
          </div>

          {match.status && (
            <div className="match-hero__status-banner">
              <span>{match.status}</span>
            </div>
          )}
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
                <span>Team A Overs</span>
                <strong>{scoreA?.o ?? '-'}</strong>
              </div>
              <div className="glass-card summary-stat">
                <span>Match Format</span>
                <strong>{match.matchType?.toUpperCase() || 'CRICKET'}</strong>
              </div>
              <div className="glass-card summary-stat">
                <span>Status</span>
                <strong style={{ fontSize: '1rem' }}>{match.status || 'Scheduled'}</strong>
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
              {!scorecardLoading && scorecard?.scorecard?.map((inning, i) => (
                <ScorecardTable key={i} inning={inning} />
              ))}
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
