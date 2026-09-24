import { useAuth } from '../../context/AuthContext';
import { FiTrash2, FiFlag } from 'react-icons/fi';
import './CommentList.css';

export default function CommentList({ comments, onDelete, onReport }) {
  const { user } = useAuth();

  if (!comments?.length) {
    return <p className="comment-list__empty">No comments yet. Be the first to share your thoughts.</p>;
  }

  return (
    <ul className="comment-list">
      {comments.map((c) => (
        <li key={c.id} className="comment-list__item">
          <img
            src={c.photoURL || 'https://api.dicebear.com/7.x/initials/svg?seed=' + encodeURIComponent(c.username)}
            alt=""
            className="comment-list__avatar"
          />
          <div className="comment-list__body">
            <div className="comment-list__head">
              <span className="comment-list__username">{c.username}</span>
              <div className="comment-list__actions">
                {user?.uid === c.userId && (
                  <button onClick={() => onDelete(c.id)} aria-label="Delete comment">
                    <FiTrash2 size={14} />
                  </button>
                )}
                {user && user.uid !== c.userId && (
                  <button onClick={() => onReport(c.id)} aria-label="Report comment">
                    <FiFlag size={14} />
                  </button>
                )}
              </div>
            </div>
            <p>{c.message}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
