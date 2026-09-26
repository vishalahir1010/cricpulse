import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { INTERNATIONAL_TEAMS, TEAMS_LAST_VERIFIED, getTeamFlag } from '../data/teams';
import StaticDataBanner from '../components/common/StaticDataBanner';
import { FiArrowRight } from 'react-icons/fi';
import '../components/team/TeamCard.css';
import './Teams.css';

const TEAM_TABS = ['All', 'International', 'Domestic'];

const TEAM_CODES = {
  'India': 'IND',
  'Australia': 'AUS',
  'England': 'ENG',
  'New Zealand': 'NZ',
  'South Africa': 'SA',
  'Pakistan': 'PAK',
  'Sri Lanka': 'SL',
  'Bangladesh': 'BAN',
  'West Indies': 'WI',
  'Afghanistan': 'AFG',
  'Zimbabwe': 'ZIM',
  'Ireland': 'IRE',
  'Scotland': 'SCO',
  'Netherlands': 'NED',
  'Nepal': 'NEP',
  'United States': 'USA',
  'United Arab Emirates': 'UAE',
  'Namibia': 'NAM',
};

export default function Teams() {
  const [filter, setFilter] = useState('All');

  const filteredTeams = useMemo(() => {
    if (filter === 'All') return INTERNATIONAL_TEAMS;
    if (filter === 'International') return INTERNATIONAL_TEAMS.filter((t) => t.status === 'Full Member');
    if (filter === 'Domestic') return INTERNATIONAL_TEAMS.filter((t) => t.status === 'Associate Member');
    return INTERNATIONAL_TEAMS;
  }, [filter]);

  return (
    <div className="container teams-page">
      <div className="page-header">
        <h1 className="page-title">Teams</h1>
        <p className="page-subtitle">Explore international cricket teams, membership details and rosters.</p>
      </div>

      <StaticDataBanner lastVerified={TEAMS_LAST_VERIFIED} />

      <div className="teams-page__filters">
        {TEAM_TABS.map((t) => (
          <button
            key={t}
            className={`filter-chip${filter === t ? ' filter-chip--active' : ''}`}
            onClick={() => setFilter(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="teams-grid">
        {filteredTeams.map((team) => (
          <div key={team.name} className="team-card glass-card">
            <div className="team-card__emblem">
              <span className="team-card__flag">{getTeamFlag(team.flagCode)}</span>
            </div>
            <div className="team-card__info">
              <h3 className="team-card__name">{team.name}</h3>
              <span className="team-card__code">({TEAM_CODES[team.name] || team.flagCode})</span>
              <span className="team-card__status">{team.status}</span>
            </div>
            <Link to={`/teams/${encodeURIComponent(team.name)}`} className="team-card__action">
              View Team <FiArrowRight size={13} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
