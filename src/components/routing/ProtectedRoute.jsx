import { Navigate } from 'react-router-dom';
import ContentSkeleton from '../shared/ContentSkeleton';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, initializing, isAdmin } = useAuth();

  if (initializing) {
    return (
      <div className="container py-5">
        <ContentSkeleton rows={4} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;

