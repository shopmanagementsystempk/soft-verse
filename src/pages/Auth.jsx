import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PageHelmet from '../components/seo/PageHelmet';

const Auth = () => {
  const { user, loginUser, registerUser, loginWithGoogle } = useAuth();
  const [mode, setMode] = useState('login');
  const [formState, setFormState] = useState({
    fullName: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (user) {
    return <Navigate to="/profile" replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === 'login') {
        await loginUser(formState.email, formState.password);
      } else {
        await registerUser({
          email: formState.email,
          password: formState.password,
          fullName: formState.fullName,
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-page py-5 bg-light min-vh-100">
      <PageHelmet title="Login" description="Access the Soft Verse client workspace with email, password, or Google authentication." />
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body p-4 p-lg-5">
                <h1 className="fw-bold mb-4">
                  {mode === 'login' ? 'Welcome back' : 'Create account'}
                </h1>
                <p className="text-muted mb-4">
                  {mode === 'login'
                    ? 'Sign in to access your personalized Soft Verse experience.'
                    : 'Create an account to collaborate with Soft Verse teams.'}
                </p>

                <div className="btn-group w-100 mb-4" role="group">
                  <button
                    type="button"
                    className={`btn ${mode === 'login' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setMode('login')}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    className={`btn ${mode === 'register' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setMode('register')}
                  >
                    Register
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  {mode === 'register' && (
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Full name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="fullName"
                        value={formState.fullName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  )}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={formState.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      name="password"
                      value={formState.password}
                      onChange={handleChange}
                      minLength={6}
                      required
                    />
                  </div>
                  {error && <div className="alert alert-danger">{error}</div>}
                  <button
                    type="submit"
                    className="btn btn-primary rounded-pill w-100 mb-3"
                    disabled={loading}
                  >
                    {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Register'}
                  </button>
                </form>
                <button
                  type="button"
                  className="btn btn-outline-dark rounded-pill w-100"
                  onClick={handleGoogle}
                >
                  Continue with Google
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;

