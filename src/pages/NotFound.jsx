import { Link } from 'react-router-dom';
import PageHelmet from '../components/seo/PageHelmet';

const NotFound = () => (
  <div className="py-5 bg-light min-vh-100 d-flex align-items-center">
    <PageHelmet title="Not found" description="The page you are looking for cannot be located." />
    <div className="container text-center">
      <h1 className="display-3 fw-bold text-primary">404</h1>
      <p className="lead text-muted mb-4">The page you are searching for is unavailable.</p>
      <Link to="/" className="btn btn-primary rounded-pill px-4">
        Go home
      </Link>
    </div>
  </div>
);

export default NotFound;

