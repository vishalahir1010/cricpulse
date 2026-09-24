import { FiInbox } from 'react-icons/fi';
import './EmptyState.css';

export default function EmptyState({ icon: Icon = FiInbox, title = 'Nothing here yet', message, action }) {
  return (
    <div className="empty-state">
      <Icon size={36} />
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {action}
    </div>
  );
}
