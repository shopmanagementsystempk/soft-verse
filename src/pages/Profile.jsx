import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import PageHelmet from '../components/seo/PageHelmet';

const Profile = () => {
  const { user, profile } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.displayName || user?.displayName || '');
  const [headline, setHeadline] = useState(profile?.headline || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  if (!user) {
    return null;
  }

  const handleUpdate = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      if (displayName && displayName !== user.displayName) {
        await updateProfile(user, { displayName });
      }
      await updateDoc(doc(db, 'users', user.uid), {
        displayName,
        headline,
      });
      setMessage({ type: 'success', text: 'Profile updated successfully.' });
    } catch (error) {
      setMessage({
        type: 'danger',
        text: 'Unable to update profile. Please retry.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page py-5 bg-light min-vh-100">
      <PageHelmet title="Profile" description="Manage your Soft Verse workspace profile, preferences, and collaboration settings." />
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body p-4 p-lg-5">
                <h1 className="fw-bold mb-4">Profile</h1>
                <div className="d-flex align-items-center gap-3 mb-4">
                  <img
                    src={
                      profile?.photoURL ||
                      user.photoURL ||
                      'https://ui-avatars.com/api/?background=0A2540&color=fff&name=' +
                        (displayName || user.email)
                    }
                    alt={displayName}
                    className="rounded-circle"
                    width="80"
                    height="80"
                  />
                  <div>
                    <p className="mb-1 text-muted">{user.email}</p>
                    <span className="badge bg-soft-blue text-primary text-uppercase">
                      {profile?.role || 'User'}
                    </span>
                  </div>
                </div>
                <form onSubmit={handleUpdate}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Full name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={displayName}
                      onChange={(event) => setDisplayName(event.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Headline</label>
                    <input
                      type="text"
                      className="form-control"
                      value={headline}
                      onChange={(event) => setHeadline(event.target.value)}
                      placeholder="Ex: Digital Program Manager"
                    />
                  </div>
                  {message && (
                    <div className={`alert alert-${message.type}`}>{message.text}</div>
                  )}
                  <button
                    type="submit"
                    className="btn btn-primary rounded-pill px-4"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save changes'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

