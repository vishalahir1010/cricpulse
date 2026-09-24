import { Link } from 'react-router-dom';
import { INTERNATIONAL_TEAMS, TEAMS_LAST_VERIFIED, getTeamFlag } from '../data/teams';
import StaticDataBanner from '../components/common/StaticDataBanner';
import '../components/team/TeamCard.css';
import './Teams.css';

// The free CricketData.org tier has no standalone /teams endpoint (team
// identities only ever appear nested inside match/series responses).
// International team membership barely changes though, so — unlike
// rankings/records — a manually maintained list here is low-risk and
// unlikely to go stale. Squad rosters and team-level stats still aren't
// shown, since THAT does depend on the missing live endpoint.
export default function Teams() {
  return (
    <div className="container teams-page">
      <h1>Teams</h1>
      <StaticDataBanner lastVerified={TEAMS_LAST_VERIFIED} />

      <div className="teams-grid">
        {INTERNATIONAL_TEAMS.map((team) => (
          <Link key={team.name} to={`/teams/${encodeURIComponent(team.name)}`} className="team-card glass-card">
            <span className="team-card__flag">{getTeamFlag(team.flagCode)}</span>
            <span className="team-card__name">{team.name}</span>
            <span className="team-card__status">{team.status}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
