import { Link } from 'react-router-dom';
import { formatMatchDate } from '../../utils/formatters';
import { FiAward, FiCalendar, FiArrowRight } from 'react-icons/fi';
import './SeriesCard.css';

export default function SeriesCard({ series }) {
  const formats = [
    series.test ? 'Test' : null,
    series.odi ? 'ODI' : null,
    series.t20 ? 'T20' : null,
  ].filter(Boolean);

  const isOngoing = series.startDate && new Date(series.startDate) <= new Date() && new Date(series.endDate) >= new Date();
  const isUpcoming = series.startDate && new Date(series.startDate) > new Date();

  return (
    <div className="series-card glass-card">
      <div className="series-card__top">
        <div className="series-card__icon-wrap">
          <FiAward size={20} />
        </div>
        <div className="series-card__header-text">
          <h3 className="series-card__name">{series.name}</h3>
          <div className="series-card__formats">
            {formats.map((f) => (
              <span key={f} className="series-card__format-tag">{f}</span>
            ))}
          </div>
        </div>
        {isOngoing && <span className="series-card__status series-card__status--ongoing">Ongoing</span>}
        {isUpcoming && <span className="series-card__status series-card__status--upcoming">Upcoming</span>}
      </div>

      <div className="series-card__body">
        <div className="series-card__date-row">
          <FiCalendar size={13} />
          <span>{formatMatchDate(series.startDate)} – {formatMatchDate(series.endDate)}</span>
        </div>

        <div className="series-card__matches-progress">
          <div className="series-card__progress-info">
            <span>Fixtures:</span>
            <strong>{series.matches} matches</strong>
          </div>
          <div className="series-card__bar">
            <div
              className="series-card__bar-fill"
              style={{ width: isOngoing ? '60%' : isUpcoming ? '0%' : '100%' }}
            />
          </div>
        </div>
      </div>

      <div className="series-card__bottom">
        <Link to={`/series/${series.id}`} className="series-card__link">
          View Series <FiArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
