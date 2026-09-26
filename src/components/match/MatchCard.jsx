import { Link } from 'react-router-dom';
import { formatScore, formatMatchDate, formatMatchTime } from '../../utils/formatters';
import { FiMapPin, FiCalendar, FiClock } from 'react-icons/fi';
import LiveBadge from './LiveBadge';
import './MatchCard.css';

function TeamAvatar({ name, img }) {
  if (img) {
    return <img src={img} alt={name || ''} className="match-card__team-logo" />;
  }
  const initials = (name || 'TBD')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return <div className="match-card__team-avatar">{initials}</div>;
}

export default function MatchCard({ match }) {
  const isLive = match.matchStarted && !match.matchEnded;
  const isUpcoming = !match.matchStarted;

  const teamAName = match.teams?.[0] || 'Team A';
  const teamBName = match.teams?.[1] || 'Team B';
  const teamAInfo = match.teamInfo?.find((t) => t.name === teamAName || t.shortname === teamAName);
  const teamBInfo = match.teamInfo?.find((t) => t.name === teamBName || t.shortname === teamBName);

  const scoreA = match.score?.find((s) => s.inning?.startsWith(teamAName));
  const scoreB = match.score?.find((s) => s.inning?.startsWith(teamBName));

  const seriesName = match.name?.split(',')[1]?.trim() || match.name?.split('vs')?.[1]?.trim() || match.matchType?.toUpperCase() || 'Match';

  return (
    <div className="match-card glass-card">
      <div className="match-card__top">
        <span className="match-card__series">
          <span className="match-card__format-dot" />
          {seriesName}
        </span>
        {isLive && <LiveBadge />}
        {!isLive && !isUpcoming && <span className="match-card__tag match-card__tag--done">Completed</span>}
        {isUpcoming && (
          <span className="match-card__tag match-card__tag--upcoming">
            <FiClock size={11} /> {formatMatchTime(match.dateTimeGMT) || 'Upcoming'}
          </span>
        )}
      </div>

      <div className="match-card__teams">
        <div className="match-card__team">
          <div className="match-card__team-identity">
            <TeamAvatar name={teamAName} img={teamAInfo?.img} />
            <span className="match-card__team-name">{teamAName}</span>
          </div>
          <span className="match-card__score">{formatScore(scoreA) || (isUpcoming ? '—' : 'Yet to bat')}</span>
        </div>

        <div className="match-card__team">
          <div className="match-card__team-identity">
            <TeamAvatar name={teamBName} img={teamBInfo?.img} />
            <span className="match-card__team-name">{teamBName}</span>
          </div>
          <span className="match-card__score">{formatScore(scoreB) || (isUpcoming ? '—' : 'Yet to bat')}</span>
        </div>
      </div>

      {match.status && !isUpcoming && (
        <div className="match-card__equation">
          <span>{match.status}</span>
        </div>
      )}

      <div className="match-card__footer">
        <div className="match-card__meta">
          {match.venue && (
            <span className="match-card__venue" title={match.venue}>
              <FiMapPin size={12} /> {match.venue.split(',')[0]}
            </span>
          )}
          {isUpcoming && (
            <span className="match-card__date">
              <FiCalendar size={12} /> {formatMatchDate(match.date)}
            </span>
          )}
        </div>
        <Link to={`/matches/${match.id}`} className="btn btn--primary btn--sm match-card__btn">
          {isLive ? 'View Scorecard' : 'View Match'}
        </Link>
      </div>
    </div>
  );
}
