import { useState } from 'react';
import toast from 'react-hot-toast';
import Button from '../common/Button';
import './CommentForm.css';

export default function CommentForm({ onSubmit, disabled }) {
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(message);
      setMessage('');
    } catch (err) {
      toast.error(err.message || 'Could not post comment');
    } finally {
      setSubmitting(false);
    }
  };

  if (disabled) {
    return <p className="comment-form__login-hint">Log in to join the conversation.</p>;
  }

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <textarea
        className="comment-form__input"
        placeholder="Share your thoughts..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        maxLength={500}
      />
      <Button type="submit" disabled={submitting}>
        {submitting ? 'Posting…' : 'Post Comment'}
      </Button>
    </form>
  );
}
