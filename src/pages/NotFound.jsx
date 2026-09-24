import EmptyState from '../components/common/EmptyState';

export default function NotFound() {
  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 20 }}>404 - Page Not Found</h1>
      <EmptyState title="Coming in the next phase" message="This section will be wired to live data shortly." />
    </div>
  );
}
