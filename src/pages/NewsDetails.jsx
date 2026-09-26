import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useFetch } from '../hooks/useFetch';
import { useAuth } from '../context/AuthContext';
import {
  getNewsBySlug,
  getNewsList,
  subscribeToComments,
  addComment,
  deleteComment,
  reportComment,
} from '../services/firebase/firestoreService';
import CommentForm from '../components/news/CommentForm';
import CommentList from '../components/news/CommentList';
import { MatchSkeleton } from '../components/common/Skeleton';
import ErrorMessage from '../components/common/ErrorMessage';
import { formatMatchDate } from '../utils/formatters';
import { FiArrowLeft, FiCalendar, FiClock, FiUser, FiShare2 } from 'react-icons/fi';
import './NewsDetails.css';

export default function NewsDetails() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [comments, setComments] = useState([]);

  const { data: article, loading, error, refetch } = useFetch(() => getNewsBySlug(slug), [slug]);
  const { data: relatedNews } = useFetch(() => getNewsList({ limitCount: 4 }), []);

  useEffect(() => {
    if (!article?.id) return undefined;
    const unsubscribe = subscribeToComments('news', article.id, setComments);
    return unsubscribe;
  }, [article?.id]);

  const handleAddComment = async (message) => {
    await addComment('news', article.id, {
      userId: user.uid,
      username: user.displayName || 'Anonymous',
      photoURL: user.photoURL || '',
      message,
    });
  };

  const handleDelete = async (commentId) => {
    try {
      await deleteComment('news', article.id, commentId);
    } catch {
      toast.error('Could not delete comment');
    }
  };

  const handleReport = async (commentId) => {
    try {
      await reportComment('news', article.id, commentId, user.uid);
      toast.success('Comment reported');
    } catch {
      toast.error('Could not report comment');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: article?.title, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  if (loading) return <div className="container news-details-page"><MatchSkeleton /></div>;
  if (error || !article) {
    return (
      <div className="container news-details-page">
        <ErrorMessage message={error || 'Article not found'} onRetry={refetch} />
      </div>
    );
  }

  const dateStr = formatMatchDate(article.createdAt?.toDate?.() || article.createdAt);
  const otherNews = (relatedNews || []).filter((n) => n.id !== article.id).slice(0, 3);

  return (
    <div className="container news-details-page">
      <Link to="/news" className="match-details__back-link">
        <FiArrowLeft size={16} /> Back to News
      </Link>

      <div className="news-details-layout">
        <article className="news-details-main">
          <div className="news-details-header">
            {article.category && <span className="news-details-header__category">{article.category}</span>}
            <h1 className="news-details-header__title">{article.title}</h1>
            <div className="news-details-header__meta">
              <span><FiCalendar size={13} /> {dateStr}</span>
              <span><FiClock size={13} /> 3 min read</span>
              <span><FiUser size={13} /> CricPulse Editorial</span>
              <button className="news-details-header__share" onClick={handleShare} title="Share article">
                <FiShare2 size={14} /> Share
              </button>
            </div>
          </div>

          {article.image && (
            <div className="news-details-image-wrap">
              <img
                src={article.image}
                alt={article.title}
                className="news-details-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1200&auto=format&fit=crop&q=80';
                }}
              />
            </div>
          )}

          <div className="news-details-body">
            {article.description.split('\n').map((para, i) => (
              para.trim() ? <p key={i}>{para}</p> : null
            ))}
          </div>

          <div className="news-details-comments-section glass-card">
            <h2 className="news-details-comments-section__title">Discussion ({comments.length})</h2>
            <CommentForm onSubmit={handleAddComment} disabled={!user} />
            <CommentList comments={comments} onDelete={handleDelete} onReport={handleReport} />
          </div>
        </article>

        {otherNews.length > 0 && (
          <aside className="news-details-sidebar">
            <div className="news-sidebar-card glass-card">
              <h3 className="news-sidebar-card__title">Related News</h3>
              <div className="news-sidebar-list">
                {otherNews.map((n) => (
                  <Link key={n.id} to={`/news/${n.slug}`} className="news-sidebar-item">
                    {n.image && (
                      <img src={n.image} alt="" className="news-sidebar-item__thumb" />
                    )}
                    <div className="news-sidebar-item__info">
                      <span className="news-sidebar-item__cat">{n.category || 'Cricket'}</span>
                      <h4 className="news-sidebar-item__title">{n.title}</h4>
                      <span className="news-sidebar-item__date">{formatMatchDate(n.createdAt?.toDate?.() || n.createdAt)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
