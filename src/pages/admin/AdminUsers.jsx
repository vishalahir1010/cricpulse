import { useState } from 'react';
import { collection, getCountFromServer } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import toast from 'react-hot-toast';
import { db, functions } from '../../services/firebase/firebaseConfig';
import { useFetch } from '../../hooks/useFetch';
import { isValidEmail } from '../../utils/validators';
import Button from '../../components/common/Button';
import { TableSkeleton } from '../../components/common/Skeleton';
import './AdminUsers.css';

async function fetchStats() {
  const [users, news, reports] = await Promise.all([
    getCountFromServer(collection(db, 'users')),
    getCountFromServer(collection(db, 'news')),
    getCountFromServer(collection(db, 'reports')),
  ]);
  return {
    users: users.data().count,
    news: news.data().count,
    reports: reports.data().count,
  };
}

// Calls the setAdminRole Cloud Function (functions/index.js), which itself
// re-checks that the caller is already an admin server-side — this button
// being visible at all already implies that, via AdminRoute, but the real
// enforcement is the function's own check, not this UI.
const setAdminRole = httpsCallable(functions, 'setAdminRole');

export default function AdminUsers() {
  const { data: stats, loading } = useFetch(fetchStats, []);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleGrantAdmin = async (e) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      toast.error('Enter a valid email address');
      return;
    }
    setSubmitting(true);
    try {
      await setAdminRole({ email, makeAdmin: true });
      toast.success(`${email} is now an admin`);
      setEmail('');
    } catch (err) {
      toast.error(err.message || 'Could not grant admin access');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-users">
      <h2>Platform Stats</h2>
      {loading && <TableSkeleton rows={3} />}
      {!loading && stats && (
        <div className="admin-users__grid">
          <div className="glass-card admin-users__stat">
            <span>Total Users</span>
            <strong>{stats.users}</strong>
          </div>
          <div className="glass-card admin-users__stat">
            <span>Published Articles</span>
            <strong>{stats.news}</strong>
          </div>
          <div className="glass-card admin-users__stat">
            <span>Open Reports</span>
            <strong>{stats.reports}</strong>
          </div>
        </div>
      )}

      <form className="glass-card admin-users__grant-form" onSubmit={handleGrantAdmin}>
        <h3>Grant admin access</h3>
        <p>Promotes an existing user to admin by email, via the setAdminRole Cloud Function.</p>
        <div className="admin-users__grant-row">
          <input
            type="email"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Granting…' : 'Make admin'}
          </Button>
        </div>
      </form>
    </div>
  );
}
