import './Skeleton.css';

export function SkeletonBlock({ height = '20px', width = '100%', radius = '8px', style }) {
  return <div className="skeleton-block" style={{ height, width, borderRadius: radius, ...style }} />;
}

export function MatchSkeleton() {
  return (
    <div className="glass-card match-skeleton">
      <SkeletonBlock height="14px" width="40%" />
      <div className="match-skeleton__row">
        <SkeletonBlock height="18px" width="35%" />
        <SkeletonBlock height="18px" width="20%" />
      </div>
      <div className="match-skeleton__row">
        <SkeletonBlock height="18px" width="35%" />
        <SkeletonBlock height="18px" width="20%" />
      </div>
      <SkeletonBlock height="12px" width="60%" />
    </div>
  );
}

export function PlayerSkeleton() {
  return (
    <div className="glass-card player-skeleton">
      <SkeletonBlock height="70px" width="70px" radius="50%" />
      <SkeletonBlock height="14px" width="80%" />
      <SkeletonBlock height="12px" width="50%" />
    </div>
  );
}

export function NewsSkeleton() {
  return (
    <div className="glass-card news-skeleton">
      <SkeletonBlock height="140px" radius="12px" />
      <SkeletonBlock height="14px" width="90%" />
      <SkeletonBlock height="12px" width="60%" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="table-skeleton">
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonBlock key={i} height="16px" />
      ))}
    </div>
  );
}
