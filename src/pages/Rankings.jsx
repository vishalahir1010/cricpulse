import { useState } from 'react';
import { RANKING_CATEGORIES, RANKING_FORMATS } from '../utils/constants';
import { TEAM_RANKINGS, PLAYER_RANKINGS, RANKINGS_LAST_VERIFIED, RANKINGS_SOURCE } from '../data/rankings';
import StaticDataBanner from '../components/common/StaticDataBanner';
import EmptyState from '../components/common/EmptyState';
import { FiAward } from 'react-icons/fi';
import './Rankings.css';

function avatarFor(name) {
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundType=gradientLinear`;
}

export default function Rankings() {
  const [category, setCategory] = useState('Batting');
  const [format, setFormat] = useState('ODI');

  const teamRows = TEAM_RANKINGS[format] || [];
  const playerRows =
    category !== 'Teams' ? PLAYER_RANKINGS[format]?.[category] || [] : [];

  return (
    <div className="container rankings-page">
      <div className="page-header">
        <h1 className="page-title">Rankings</h1>
        <p className="page-subtitle">Updated ICC player and team rankings across formats.</p>
      </div>

      <StaticDataBanner lastVerified={RANKINGS_LAST_VERIFIED} source={RANKINGS_SOURCE} />

      <div className="rankings-page__filter-groups">
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

        <div className="rankings-page__format-tabs">
          {RANKING_FORMATS.map((f) => (
            <button
              key={f}
              className={`rankings-format-btn${format === f ? ' rankings-format-btn--active' : ''}`}
              onClick={() => setFormat(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {category === 'Teams' && (
        teamRows.length > 0 ? (
          <div className="rankings-table-wrap glass-card">
            <table className="rankings-table">
              <thead>
                <tr>
                  <th style={{ width: '12%' }}>Rank</th>
                  <th style={{ width: '68%' }}>Team</th>
                  <th style={{ width: '20%', textAlign: 'right' }}>Rating</th>
                </tr>
              </thead>
              <tbody>
                {teamRows.map((r, i) => (
                  <tr key={i} className={r.rank === 1 ? 'rankings-table__row--top' : ''}>
                    <td className="rankings-table__rank">
                      <span className={`rank-badge${r.rank === 1 ? ' rank-badge--first' : ''}`}>{r.rank}</span>
                    </td>
                    <td className="rankings-table__name">
                      <div className="rankings-table__player-cell">
                        <img src={avatarFor(r.team)} alt="" className="rankings-table__avatar" />
                        <strong>{r.team}</strong>
                      </div>
                    </td>
                    <td className="rankings-table__rating">{r.rating}</td>
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
          <div className="rankings-table-wrap glass-card">
            <table className="rankings-table">
              <thead>
                <tr>
                  <th style={{ width: '12%' }}>Rank</th>
                  <th style={{ width: '50%' }}>Player</th>
                  <th style={{ width: '20%' }}>Country</th>
                  <th style={{ width: '18%', textAlign: 'right' }}>Rating</th>
                </tr>
              </thead>
              <tbody>
                {playerRows.map((r) => (
                  <tr key={r.rank} className={r.rank === 1 ? 'rankings-table__row--top' : ''}>
                    <td className="rankings-table__rank">
                      <span className={`rank-badge${r.rank === 1 ? ' rank-badge--first' : ''}`}>{r.rank}</span>
                    </td>
                    <td className="rankings-table__name">
                      <div className="rankings-table__player-cell">
                        <img src={avatarFor(r.name)} alt="" className="rankings-table__avatar" />
                        <strong>{r.name}</strong>
                      </div>
                    </td>
                    <td className="rankings-table__country">{r.country}</td>
                    <td className="rankings-table__rating">{r.rating}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="Not verified yet"
            message={`${format} ${category.toLowerCase()} rankings couldn't be confidently verified for this snapshot — check icc-cricket.com for the live list.`}
          />
        )
      )}

      <div className="rankings-footer-card glass-card">
        <FiAward size={24} className="rankings-footer-card__icon" />
        <div>
          <h4>Official ICC Cricket Rankings</h4>
          <p>Rankings are governed and officially audited by the International Cricket Council (ICC).</p>
        </div>
      </div>
    </div>
  );
}
