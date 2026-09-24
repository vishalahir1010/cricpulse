import { Link } from 'react-router-dom';
import { formatScore, formatMatchDate, formatMatchTime } from '../../utils/formatters';
import LiveBadge from './LiveBadge';
import './MatchCard.css';

// `match` follows the CricAPI currentMatches/matches shape:
// { id, name, matchType, status, venue, date, teams: [teamA, teamB],
//   teamInfo: [{name, shortname, img}], score: [{r,w,o,inning}],
//   matchStarted, matchEnded }
export default function MatchCard({ match }) {
  const isLive = match.matchStarted && !match.matchEnded;
  const isUpcoming = !match.matchStarted;

  const teamAName = match.teams?.[0];
  const teamBName = match.teams?.[1];
  const teamAInfo = match.teamInfo?.find((t) => t.name === teamAName);
  const teamBInfo = match.teamInfo?.find((t) => t.name === teamBName);

  const scoreA = match.score?.find((s) => s.inning?.startsWith(teamAName));
  const scoreB = match.score?.find((s) => s.inning?.startsWith(teamBName));

  return (
    <Link to={`/matches/${match.id}`} className="match-card glass-card">
      <div className="match-card__top">
        <span className="match-card__series">{match.name?.split(',')[1]?.trim() || match.matchType?.toUpperCase()}</span>
        {isLive && <LiveBadge />}
        {!isLive && !isUpcoming && <span className="match-card__tag match-card__tag--done">Completed</span>}
        {isUpcoming && <span className="match-card__tag">Upcoming</span>}
      </div>

      <div className="match-card__team">
        <span className="match-card__team-name">
          {teamAInfo?.img && <img src={teamAInfo.img} alt="" className="match-card__team-logo" />}
          {teamAName || 'TBD'}
        </span>
        <span className="match-card__score">{formatScore(scoreA) || '-'}</span>
      </div>

      <div className="match-card__team">
        <span className="match-card__team-name">
          {teamBInfo?.img && <img src={teamBInfo.img} alt="" className="match-card__team-logo" />}
          {teamBName || 'TBD'}
        </span>
        <span className="match-card__score">{formatScore(scoreB) || '-'}</span>
      </div>

      <div className="match-card__footer">
        {isUpcoming ? (
          <span>{formatMatchDate(match.date)} · {formatMatchTime(match.dateTimeGMT)}</span>
        ) : (
          <span>{match.status}</span>
        )}
      </div>

      <span className="match-card__cta">View Match →</span>
    </Link>
  );
}
