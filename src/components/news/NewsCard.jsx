import { Link } from 'react-router-dom';
import { FiFileText } from 'react-icons/fi';
import { truncate } from '../../utils/formatters';
import './NewsCard.css';

export default function NewsCard({ article }) {
  return (
    <Link to={`/news/${article.slug}`} className="news-card glass-card">
      <div className="news-card__image-wrapper">
        {article.image ? (
          <img src={article.image} alt={article.title} className="news-card__img" />
        ) : (
          <div className="news-card__img news-card__img--placeholder">
            <FiFileText size={28} />
          </div>
        )}
      </div>
      <div className="news-card__body">
        {article.category && <span className="news-card__category">{article.category}</span>}
        <h3 className="news-card__title">{article.title}</h3>
        <p className="news-card__desc">{truncate(article.description, 100)}</p>
      </div>
    </Link>
  );
}
