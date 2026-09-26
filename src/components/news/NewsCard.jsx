import { Link } from 'react-router-dom';
import { FiFileText, FiClock, FiCalendar, FiArrowRight } from 'react-icons/fi';
import { truncate, formatMatchDate } from '../../utils/formatters';
import './NewsCard.css';

export default function NewsCard({ article, featured = false }) {
  const dateStr = article.createdAt?.toDate ? formatMatchDate(article.createdAt.toDate()) : (article.createdAt ? formatMatchDate(article.createdAt) : 'Recent');

  return (
    <Link to={`/news/${article.slug}`} className={`news-card glass-card${featured ? ' news-card--featured' : ''}`}>
      <div className="news-card__image-wrapper">
        {article.image ? (
          <img
            src={article.image}
            alt={article.title}
            className="news-card__img"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&auto=format&fit=crop&q=60';
            }}
          />
        ) : (
          <div className="news-card__img news-card__img--placeholder">
            <FiFileText size={32} />
          </div>
        )}
        {article.category && (
          <span className="news-card__category-badge">{article.category}</span>
        )}
      </div>
      <div className="news-card__body">
        <h3 className="news-card__title">{article.title}</h3>
        <p className="news-card__desc">{truncate(article.description, featured ? 180 : 90)}</p>
        <div className="news-card__footer">
          <div className="news-card__meta">
            <span><FiCalendar size={12} /> {dateStr}</span>
            <span><FiClock size={12} /> 3 min read</span>
          </div>
          <span className="news-card__read-more">
            Read More <FiArrowRight size={13} />
          </span>
        </div>
      </div>
    </Link>
  );
}
