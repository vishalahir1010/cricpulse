import { useState } from 'react';
import { RECORDS, RECORDS_LAST_VERIFIED, RECORDS_SOURCE } from '../data/records';
import StaticDataBanner from '../components/common/StaticDataBanner';
import EmptyState from '../components/common/EmptyState';
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
  const [category, setCategory] = useState(CATEGORIES[0]);
  const rows = RECORDS[category] || [];

  return (
    <div className="container records-page">
      <h1>Records</h1>
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
        <div className="records-list">
          {rows.map((r, i) => (
            <div key={i} className="glass-card records-list__item">
              <div>
                <strong>{r.player}</strong>
                <span>{r.country} &middot; {r.format}</span>
              </div>
              <span className="records-list__value">{r.value}</span>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Not verified yet"
          message={`"${category}" needs a qualifier threshold (minimum innings/balls) that varies by source, so it wasn't included rather than risk showing a wrong number.`}
        />
      )}
    </div>
  );
}
