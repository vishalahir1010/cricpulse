import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useFetch } from '../hooks/useFetch';
import { useAuth } from '../context/AuthContext';
import {
  getNewsBySlug,
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
import './NewsDetails.css';

export default function NewsDetails() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [comments, setComments] = useState([]);

  const { data: article, loading, error, refetch } = useFetch(() => getNewsBySlug(slug), [slug]);

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

  if (loading) return <div className="container news-details-page"><MatchSkeleton /></div>;
  if (error || !article) {
    return (
      <div className="container news-details-page">
        <ErrorMessage message={error || 'Article not found'} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="container news-details-page">
      {article.image && <img src={article.image} alt={article.title} className="news-details-page__img" />}
      {article.category && <span className="news-details-page__category">{article.category}</span>}
      <h1>{article.title}</h1>
      <p className="news-details-page__meta">
        {formatMatchDate(article.createdAt?.toDate?.() || article.createdAt)}
      </p>
      <p className="news-details-page__body">{article.description}</p>

      <hr className="news-details-page__divider" />

      <h2>Comments</h2>
      <CommentForm onSubmit={handleAddComment} disabled={!user} />
      <CommentList comments={comments} onDelete={handleDelete} onReport={handleReport} />
    </div>
  );
}
