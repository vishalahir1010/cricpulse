import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { castVote, getPollResults } from '../../services/firebase/firestoreService';
import './PollCard.css';

export default function PollCard({ poll }) {
  const { user } = useAuth();
  const [results, setResults] = useState(null);
  const [voted, setVoted] = useState(false);

  const loadResults = async () => {
    const counts = await getPollResults(poll.id);
    setResults(counts);
  };

  useEffect(() => {
    loadResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poll.id]);

  const totalVotes = results ? Object.values(results).reduce((a, b) => a + b, 0) : 0;

  const handleVote = async (optionId) => {
    if (!user) {
      toast.error('Log in to vote');
      return;
    }
    try {
      await castVote(poll.id, user.uid, optionId);
      setVoted(true);
      loadResults();
    } catch (err) {
      toast.error(err.message || 'Could not cast vote');
    }
  };

  return (
    <div className="glass-card poll-card">
      <h3>{poll.question}</h3>
      <div className="poll-card__options">
        {poll.options?.map((opt) => {
          const count = results?.[opt.id] || 0;
          const pct = totalVotes ? Math.round((count / totalVotes) * 100) : 0;
          return (
            <button
              key={opt.id}
              className="poll-card__option"
              onClick={() => handleVote(opt.id)}
              disabled={voted}
            >
              <span className="poll-card__option-label">{opt.text}</span>
              {(voted || results) && (
                <span className="poll-card__bar-wrap">
                  <span className="poll-card__bar" style={{ width: `${pct}%` }} />
                  <span className="poll-card__pct">{pct}%</span>
                </span>
              )}
            </button>
          );
        })}
      </div>
      <span className="poll-card__total">{totalVotes} vote{totalVotes !== 1 ? 's' : ''}</span>
    </div>
  );
}
