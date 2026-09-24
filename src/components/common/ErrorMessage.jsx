import { FiAlertTriangle } from 'react-icons/fi';
import './ErrorMessage.css';

export default function ErrorMessage({ message = 'Something went wrong. Please try again.', onRetry }) {
  return (
    <div className="error-message">
      <FiAlertTriangle size={30} />
      <p>{message}</p>
      {onRetry && (
        <button className="error-message__retry" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
