import { Link } from 'react-router-dom';
import { formatMatchDate } from '../../utils/formatters';
import './SeriesCard.css';

// `series` follows CricAPI series shape: { id, name, startDate, endDate, matches, t20, odi, test }
export default function SeriesCard({ series }) {
  const formats = [
    series.test ? 'Test' : null,
    series.odi ? 'ODI' : null,
    series.t20 ? 'T20' : null,
  ].filter(Boolean);

  return (
    <Link to={`/series/${series.id}`} className="series-card glass-card">
      <h3 className="series-card__name">{series.name}</h3>
      <div className="series-card__meta">
        {formats.map((f) => (
          <span key={f} className="series-card__format">{f}</span>
        ))}
      </div>
      <p className="series-card__dates">
        {formatMatchDate(series.startDate)} – {formatMatchDate(series.endDate)}
      </p>
      <p className="series-card__matches">{series.matches} matches</p>
    </Link>
  );
}
