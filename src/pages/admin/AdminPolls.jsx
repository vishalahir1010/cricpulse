import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { useFetch } from '../../hooks/useFetch';
import { getActivePolls, createPoll, getPollResults } from '../../services/firebase/firestoreService';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase/firebaseConfig';
import Button from '../../components/common/Button';
import { TableSkeleton } from '../../components/common/Skeleton';
import './AdminPolls.css';

export default function AdminPolls() {
  const { data: polls, loading, refetch } = useFetch(() => getActivePolls(), []);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [saving, setSaving] = useState(false);

  const updateOption = (i, value) => {
    setOptions((opts) => opts.map((o, idx) => (idx === i ? value : o)));
  };

  const addOption = () => setOptions((opts) => [...opts, '']);

  const handleCreate = async (e) => {
    e.preventDefault();
    const cleanOptions = options.map((o) => o.trim()).filter(Boolean);
    if (!question.trim() || cleanOptions.length < 2) {
      toast.error('Add a question and at least 2 options');
      return;
    }
    setSaving(true);
    try {
      await createPoll({
        question: question.trim(),
        options: cleanOptions.map((text, i) => ({ id: `opt_${i}`, text })),
      });
      toast.success('Poll created');
      setQuestion('');
      setOptions(['', '']);
      refetch();
    } catch {
      toast.error('Could not create poll');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = async (pollId) => {
    try {
      await updateDoc(doc(db, 'polls', pollId), { active: false });
      toast.success('Poll closed');
      refetch();
    } catch {
      toast.error('Could not close poll');
    }
  };

  return (
    <div className="admin-polls">
      <form className="glass-card admin-polls__form" onSubmit={handleCreate}>
        <h2>New Poll</h2>
        <input placeholder="Poll question" value={question} onChange={(e) => setQuestion(e.target.value)} />
        {options.map((opt, i) => (
          <input
            key={i}
            placeholder={`Option ${i + 1}`}
            value={opt}
            onChange={(e) => updateOption(i, e.target.value)}
          />
        ))}
        <button type="button" className="admin-polls__add-option" onClick={addOption}>
          <FiPlus size={14} /> Add option
        </button>
        <Button type="submit" disabled={saving}>{saving ? 'Creating…' : 'Create Poll'}</Button>
      </form>

      <div className="admin-polls__list">
        {loading && <TableSkeleton rows={3} />}
        {!loading && polls?.map((p) => (
          <div key={p.id} className="glass-card admin-polls__item">
            <div>
              <strong>{p.question}</strong>
              <span>{p.options?.length} options</span>
            </div>
            <button onClick={() => handleClose(p.id)} aria-label="Close poll"><FiTrash2 size={15} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
