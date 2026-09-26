import { useState } from 'react';
import { RECORDS, RECORDS_LAST_VERIFIED, RECORDS_SOURCE } from '../data/records';
import StaticDataBanner from '../components/common/StaticDataBanner';
import EmptyState from '../components/common/EmptyState';
import { FiAward, FiTrendingUp, FiTarget } from 'react-icons/fi';
import './Records.css';

const CATEGORIES = [
  'Most Runs',
  'Most Wickets',
  'Highest Score',
  'Best Bowling',
  'Most Sixes',
  'Most Centuries',
  'Best Strike Rate',
];

export default function Records() {
  const [category, setCategory] = useState('Most Runs');
  const rows = RECORDS[category] || [];

  return (
    <div className="container records-page">
      <div className="page-header">
        <h1 className="page-title">Cricket Records</h1>
        <p className="page-subtitle">Explore historical milestones and greatest statistical achievements in cricket history.</p>
      </div>

      <StaticDataBanner lastVerified={RECORDS_LAST_VERIFIED} source={RECORDS_SOURCE} />

      <div className="records-page__tabs">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            className={`filter-chip${category === c ? ' filter-chip--active' : ''}`}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {rows.length > 0 ? (
        <div className="records-grid">
          {rows.map((r, i) => (
            <div key={i} className="record-stat-card glass-card">
              <div className="record-stat-card__top">
                <div className="record-stat-card__icon-wrap">
                  <FiAward size={18} />
                </div>
                <span className="record-stat-card__format-tag">{r.format}</span>
              </div>
              <div className="record-stat-card__body">
                <span className="record-stat-card__value">{r.value}</span>
                <h3 className="record-stat-card__holder">{r.player}</h3>
                <p className="record-stat-card__details">{r.country} · {category}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Not verified yet"
          message={`"${category}" needs a qualifier threshold that varies by source. Checked against verified cricket records.`}
        />
      )}
    </div>
  );
}
