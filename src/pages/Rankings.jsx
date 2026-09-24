import { useState } from 'react';
import { RANKING_CATEGORIES, RANKING_FORMATS } from '../utils/constants';
import { TEAM_RANKINGS, PLAYER_RANKINGS, RANKINGS_LAST_VERIFIED, RANKINGS_SOURCE } from '../data/rankings';
import StaticDataBanner from '../components/common/StaticDataBanner';
import EmptyState from '../components/common/EmptyState';
import './Rankings.css';

export default function Rankings() {
  const [category, setCategory] = useState('Teams');
  const [format, setFormat] = useState('ODI');

  const teamRows = TEAM_RANKINGS[format] || [];
  const playerRows =
    category !== 'Teams' ? PLAYER_RANKINGS[format]?.[category] || [] : [];

  return (
    <div className="container rankings-page">
      <h1>Rankings</h1>
      <StaticDataBanner lastVerified={RANKINGS_LAST_VERIFIED} source={RANKINGS_SOURCE} />

      <div className="rankings-page__tabs">
        {RANKING_CATEGORIES.map((c) => (
          <button
            key={c}
            className={`filter-chip${category === c ? ' filter-chip--active' : ''}`}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="rankings-page__tabs">
        {RANKING_FORMATS.map((f) => (
          <button
            key={f}
            className={`filter-chip${format === f ? ' filter-chip--active' : ''}`}
            onClick={() => setFormat(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {category === 'Teams' && (
        teamRows.length > 0 ? (
          <div className="rankings-table-wrap">
            <table className="rankings-table">
              <thead>
                <tr><th>Rank</th><th>Team</th><th>Rating</th></tr>
              </thead>
              <tbody>
                {teamRows.map((r, i) => (
                  <tr key={i}>
                    <td className="rankings-table__rank">{r.rank}</td>
                    <td className="rankings-table__name">{r.team}</td>
                    <td>{r.rating}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="Not available" message={`${format} team rankings weren't verified for this snapshot.`} />
        )
      )}

      {category !== 'Teams' && (
        playerRows.length > 0 ? (
          <div className="rankings-table-wrap">
            <table className="rankings-table">
              <thead>
                <tr><th>Rank</th><th>Player</th><th>Country</th><th>Rating</th></tr>
              </thead>
              <tbody>
                {playerRows.map((r) => (
                  <tr key={r.rank}>
                    <td className="rankings-table__rank">{r.rank}</td>
                    <td className="rankings-table__name">{r.name}</td>
                    <td>{r.country}</td>
                    <td>{r.rating}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="Not verified yet"
            message={`${format} ${category.toLowerCase()} rankings couldn't be confidently verified for this snapshot — rather than guess, this table is left empty. Check icc-cricket.com for the current list.`}
          />
        )
      )}
    </div>
  );
}
