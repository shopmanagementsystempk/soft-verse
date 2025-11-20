import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const ContentSkeleton = ({ rows = 3 }) => (
  <SkeletonTheme baseColor="#e1e7ef" highlightColor="#f6f7fb">
    <div className="skeleton-wrapper">
      {[...Array(rows)].map((_, index) => (
        <Skeleton key={`skeleton-${index}`} height={24} className="mb-3" />
      ))}
    </div>
  </SkeletonTheme>
);

export default ContentSkeleton;

