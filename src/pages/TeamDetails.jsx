import { useParams, Link } from 'react-router-dom';
import { INTERNATIONAL_TEAMS, getTeamFlag } from '../data/teams';
import StaticDataBanner from '../components/common/StaticDataBanner';
import { TEAMS_LAST_VERIFIED } from '../data/teams';
import EmptyState from '../components/common/EmptyState';
import { FiArrowLeft } from 'react-icons/fi';
import './TeamDetails.css';

export default function TeamDetails() {
  const { teamId } = useParams();
  const teamName = decodeURIComponent(teamId);
  const team = INTERNATIONAL_TEAMS.find((t) => t.name === teamName);

  return (
    <div className="container team-details-page">
      <Link to="/teams" className="match-details__back-link">
        <FiArrowLeft size={16} /> Back to Teams
      </Link>

      {team ? (
        <>
          <div className="team-details-hero glass-card">
            <div className="team-details-hero__flag-wrap">
              <span className="team-details-hero__flag">{getTeamFlag(team.flagCode)}</span>
            </div>
            <div>
              <h1 className="page-title">{team.name}</h1>
              <span className="team-details-hero__status">{team.status}</span>
            </div>
          </div>
          <StaticDataBanner lastVerified={TEAMS_LAST_VERIFIED} />
          <EmptyState
            title="Squad and team stats not available"
            message="The free Cricket API plan has no team-roster or team-statistics endpoint, so this can't be shown live yet. Upcoming/recent matches involving this team can be found via Live or Matches."
          />
        </>
      ) : (
        <EmptyState title="Team not found" message={`"${teamName}" isn't in our reference list of international teams.`} />
      )}
    </div>
  );
}
