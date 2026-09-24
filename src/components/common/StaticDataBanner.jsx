import { FiInfo } from 'react-icons/fi';
import './StaticDataBanner.css';

// Shown on pages backed by manually-curated data instead of the live
// Cricket API (Teams, Rankings, Records — the free API plan has no
// endpoints for these). Keeps that distinction visible to the person
// reading the page, not just buried in a code comment.
export default function StaticDataBanner({ lastVerified, source }) {
  return (
    <div className="static-data-banner">
      <FiInfo size={15} />
      <span>
        Static reference data, not live from the Cricket API — last verified {lastVerified}
        {source ? ` · Source: ${source}` : ''}. May be out of date since.
      </span>
    </div>
  );
}
