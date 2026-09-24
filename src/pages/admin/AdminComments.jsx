import toast from 'react-hot-toast';
import { collection, getDocs, orderBy, query, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase/firebaseConfig';
import { useFetch } from '../../hooks/useFetch';
import { TableSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import { FiTrash2, FiCheck } from 'react-icons/fi';
import './AdminComments.css';

async function fetchReports() {
  const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export default function AdminComments() {
  const { data: reports, loading, refetch } = useFetch(fetchReports, []);

  const handleRemoveComment = async (report) => {
    try {
      await deleteDoc(doc(db, report.parentType, report.parentId, 'comments', report.commentId));
      await updateDoc(doc(db, 'reports', report.id), { status: 'resolved' });
      toast.success('Comment removed');
      refetch();
    } catch {
      toast.error('Could not remove comment');
    }
  };

  const handleDismiss = async (report) => {
    try {
      await updateDoc(doc(db, 'reports', report.id), { status: 'dismissed' });
      toast.success('Report dismissed');
      refetch();
    } catch {
      toast.error('Could not update report');
    }
  };

  const openReports = reports?.filter((r) => r.status === 'open');

  return (
    <div className="admin-comments">
      <h2>Reported Comments</h2>
      {loading && <TableSkeleton rows={4} />}
      {!loading && !openReports?.length && (
        <EmptyState title="No open reports" message="Reported comments will show up here for review." />
      )}
      {!loading && openReports?.map((r) => (
        <div key={r.id} className="glass-card admin-comments__item">
          <div>
            <strong>{r.parentType} / {r.parentId}</strong>
            <span>Comment ID: {r.commentId}</span>
          </div>
          <div className="admin-comments__actions">
            <button onClick={() => handleDismiss(r)} aria-label="Dismiss report"><FiCheck size={15} /></button>
            <button onClick={() => handleRemoveComment(r)} aria-label="Remove comment"><FiTrash2 size={15} /></button>
          </div>
        </div>
      ))}
    </div>
  );
}
