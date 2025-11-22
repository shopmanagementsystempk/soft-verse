import { useEffect, useMemo, useState } from 'react';
import { addDoc, collection, deleteDoc, doc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import useDocument from '../hooks/useDocument';
import useCollection from '../hooks/useCollection';
import ContentSkeleton from '../components/shared/ContentSkeleton';
import uploadImageFile from '../services/storage';
import PageHelmet from '../components/seo/PageHelmet';

const CollectionManager = ({
  title,
  collectionName,
  fields,
  storageFolder,
  orderByField = 'createdAt',
}) => {
  const { data, loading } = useCollection(collectionName, {
    orderByField,
    orderDirection: 'desc',
  });
  const defaultFormState = useMemo(
    () =>
      fields.reduce((acc, field) => {
        if (field.type === 'list') {
          acc[field.name] = [];
        } else {
          acc[field.name] = '';
        }
        return acc;
      }, {}),
    [fields],
  );
  const [formState, setFormState] = useState(defaultFormState);
  const [fileValues, setFileValues] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    setFormState(defaultFormState);
  }, [defaultFormState]);

  const handleChange = (field, value) => {
    if (field.type === 'list') {
      const listValue = value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
      setFormState((prev) => ({ ...prev, [field.name]: listValue }));
    } else {
      let parsedValue = value;
      if (field.inputType === 'number' && value !== '') {
        parsedValue = Number(value);
      }
      setFormState((prev) => ({ ...prev, [field.name]: parsedValue }));
    }
  };

  const handleFile = (name, file) => {
    setFileValues((prev) => ({ ...prev, [name]: file }));
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    const nextState = { ...defaultFormState };
    fields.forEach((field) => {
      nextState[field.name] =
        item[field.name] ?? (field.type === 'list' ? [] : '');
    });
    setFormState(nextState);
    setFileValues({});
  };

  const resetForm = () => {
    setFormState(defaultFormState);
    setFileValues({});
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const payload = { ...formState };
      await Promise.all(
        fields.map(async (field) => {
          if (field.type === 'image' && fileValues[field.name]) {
            payload[field.name] = await uploadImageFile(
              fileValues[field.name],
              storageFolder || collectionName,
            );
          }
        }),
      );
      if (!editingId && collectionName === 'blogPosts') {
        payload.publishedAt = serverTimestamp();
      }
      if (editingId) {
        await updateDoc(doc(db, collectionName, editingId), {
          ...payload,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, collectionName), {
          ...payload,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      setFeedback({ type: 'success', message: 'Changes saved successfully.' });
      resetForm();
    } catch (error) {
      setFeedback({ type: 'danger', message: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    // eslint-disable-next-line no-alert
    if (window.confirm('Delete this record?')) {
      await deleteDoc(doc(db, collectionName, id));
    }
  };

  return (
    <div className="card border-0 shadow-sm rounded-4 mb-4">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="fw-bold mb-0">{title}</h5>
          {editingId && (
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={resetForm}>
              Cancel edit
            </button>
          )}
        </div>
        <form onSubmit={handleSubmit} className="row g-3 mb-4">
          {fields.map((field) => (
            <div className="col-md-6" key={field.name}>
              <label className="form-label fw-semibold">{field.label}</label>
              {field.type === 'textarea' || field.textarea ? (
                <textarea
                  className="form-control"
                  rows="3"
                  value={formState[field.name]}
                  onChange={(event) => handleChange(field, event.target.value)}
                  required={field.required}
                />
              ) : field.type === 'image' ? (
                <input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  onChange={(event) => handleFile(field.name, event.target.files[0])}
                  required={!editingId && field.required}
                />
              ) : field.type === 'list' ? (
                <input
                  type="text"
                  className="form-control"
                  value={formState[field.name].join(', ')}
                  onChange={(event) => handleChange(field, event.target.value)}
                  placeholder="Comma separated values"
                />
              ) : (
                <input
                  type={field.inputType || 'text'}
                  className="form-control"
                  value={formState[field.name]}
                  onChange={(event) => handleChange(field, event.target.value)}
                  required={field.required}
                />
              )}
            </div>
          ))}
          <div className="col-12">
            <button
              type="submit"
              className="btn btn-primary rounded-pill px-4"
              disabled={saving}
            >
              {saving ? 'Saving...' : editingId ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
        {feedback && (
          <div className={`alert alert-${feedback.type}`}>{feedback.message}</div>
        )}
        {loading ? (
          <ContentSkeleton rows={4} />
        ) : (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  {fields.map((field) => (
                    <th key={field.name}>{field.label}</th>
                  ))}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.id}>
                    {fields.map((field) => (
                      <td key={`${item.id}-${field.name}`}>
                        {field.type === 'image' && item[field.name] ? (
                          <img
                            src={item[field.name]}
                            alt={item.title || item.name}
                            width="60"
                            className="rounded"
                          />
                        ) : Array.isArray(item[field.name]) ? (
                          item[field.name].join(', ')
                        ) : (
                          item[field.name]
                        )}
                      </td>
                    ))}
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button
                          type="button"
                          className="btn btn-outline-primary"
                          onClick={() => handleEdit(item)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          onClick={() => handleDelete(item.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const CompanyInfoManager = () => {
  const { data, loading } = useDocument('siteSettings', 'global');
  const [formState, setFormState] = useState({});
  const [logoFile, setLogoFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (data) {
      setFormState({
        tagline: data.tagline || '',
        aboutIntro: data.aboutIntro || '',
        aboutSnippet: data.aboutSnippet || '',
        mission: data.mission || '',
        vision: data.vision || '',
        address: data.address || '',
        phone: data.phone || '',
        email: data.email || '',
        statsText: (data.stats || [])
          .map((stat) => `${stat.value}|${stat.label}`)
          .join('\n'),
        ctaText: data.ctaText || '',
        quickLinksText: (data.quickLinks || [])
          .map((link) => `${link.label}|${link.url}`)
          .join('\n'),
        socialFacebook: data.socialLinks?.facebook || '',
        socialTwitter: data.socialLinks?.twitter || '',
        socialLinkedin: data.socialLinks?.linkedin || '',
      });
    }
  }, [data]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const payload = { ...formState };
      payload.stats = (formState.statsText || '')
        .split('\n')
        .map((line) => {
          const [value, label] = line.split('|').map((item) => item?.trim());
          if (value && label) {
            return { value, label };
          }
          return null;
        })
        .filter(Boolean);
      delete payload.statsText;
      payload.quickLinks = (formState.quickLinksText || '')
        .split('\n')
        .map((line) => {
          const [label, url] = line.split('|').map((item) => item?.trim());
          if (label && url) {
            return { label, url };
          }
          return null;
        })
        .filter(Boolean);
      delete payload.quickLinksText;
      payload.socialLinks = {
        facebook: formState.socialFacebook || '',
        twitter: formState.socialTwitter || '',
        linkedin: formState.socialLinkedin || '',
      };
      delete payload.socialFacebook;
      delete payload.socialTwitter;
      delete payload.socialLinkedin;
      if (logoFile) {
        payload.logoUrl = await uploadImageFile(logoFile, 'logos');
      }
      await setDoc(
        doc(db, 'siteSettings', 'global'),
        {
          ...payload,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
      setFeedback({ type: 'success', message: 'Company information updated.' });
    } catch (error) {
      setFeedback({ type: 'danger', message: error.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading && !data) {
    return <ContentSkeleton rows={4} />;
  }

  return (
    <div className="card border-0 shadow-sm rounded-4 mb-4">
      <div className="card-body">
        <h5 className="fw-bold mb-4">Company Information</h5>
        <form className="row g-3" onSubmit={handleSubmit}>
          {[
            { name: 'tagline', label: 'Tagline' },
            { name: 'aboutIntro', label: 'Intro', textarea: true },
            { name: 'aboutSnippet', label: 'Snippet', textarea: true },
            { name: 'mission', label: 'Mission', textarea: true },
            { name: 'vision', label: 'Vision', textarea: true },
            { name: 'ctaText', label: 'CTA Text', textarea: true },
            { name: 'address', label: 'Address' },
            { name: 'phone', label: 'Phone' },
            { name: 'email', label: 'Email' },
          ].map((field) => (
            <div className="col-md-6" key={field.name}>
              <label className="form-label fw-semibold">{field.label}</label>
              {field.textarea ? (
                <textarea
                  className="form-control"
                  rows="3"
                  name={field.name}
                  value={formState[field.name] || ''}
                  onChange={handleChange}
                />
              ) : (
                <input
                  type="text"
                  className="form-control"
                  name={field.name}
                  value={formState[field.name] || ''}
                  onChange={handleChange}
                />
              )}
            </div>
          ))}
          <div className="col-md-6">
            <label className="form-label fw-semibold">Stats (value|label per line)</label>
            <textarea
              className="form-control"
              rows="4"
              name="statsText"
              value={formState.statsText || ''}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold">Quick links (label|url per line)</label>
            <textarea
              className="form-control"
              rows="4"
              name="quickLinksText"
              value={formState.quickLinksText || ''}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-semibold">Facebook</label>
            <input
              type="url"
              className="form-control"
              name="socialFacebook"
              value={formState.socialFacebook || ''}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-semibold">Twitter / X</label>
            <input
              type="url"
              className="form-control"
              name="socialTwitter"
              value={formState.socialTwitter || ''}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-semibold">LinkedIn</label>
            <input
              type="url"
              className="form-control"
              name="socialLinkedin"
              value={formState.socialLinkedin || ''}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold">Logo</label>
            <input
              type="file"
              className="form-control"
              accept="image/*"
              onChange={(event) => setLogoFile(event.target.files[0])}
            />
          </div>
          {feedback && (
            <div className="col-12">
              <div className={`alert alert-${feedback.type}`}>{feedback.message}</div>
            </div>
          )}
          <div className="col-12">
            <button
              type="submit"
              className="btn btn-primary rounded-pill px-4"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save company info'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ContactResponses = () => {
  const { data, loading } = useCollection('contactMessages', {
    orderByField: 'createdAt',
    orderDirection: 'desc',
  });

  const updateStatus = async (id, status) => {
    await updateDoc(doc(db, 'contactMessages', id), {
      status,
      updatedAt: serverTimestamp(),
    });
  };

  return (
    <div className="card border-0 shadow-sm rounded-4 mb-4">
      <div className="card-body">
        <h5 className="fw-bold mb-3">Contact form submissions</h5>
        {loading ? (
          <ContentSkeleton rows={4} />
        ) : (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Message</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((message) => (
                  <tr key={message.id}>
                    <td>{message.fullName}</td>
                    <td>{message.email}</td>
                    <td>{message.message}</td>
                    <td>
                      <span className="badge bg-soft-blue text-primary text-uppercase">
                        {message.status}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button
                          type="button"
                          className="btn btn-outline-success"
                          onClick={() => updateStatus(message.id, 'responded')}
                        >
                          Mark responded
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => updateStatus(message.id, 'archived')}
                        >
                          Archive
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const ApplicationsManager = () => {
  const { data, loading } = useCollection('applications', {
    orderByField: 'createdAt',
    orderDirection: 'desc',
  });
  const [selectedApp, setSelectedApp] = useState(null);

  const updateStatus = async (id, status) => {
    await updateDoc(doc(db, 'applications', id), {
      status,
      updatedAt: serverTimestamp(),
    });
  };

  const handleDelete = async (id, fullName) => {
    // eslint-disable-next-line no-alert
    if (window.confirm(`Delete application for ${fullName}? This cannot be undone.`)) {
      await deleteDoc(doc(db, 'applications', id));
    }
  };

  const closeDetails = () => setSelectedApp(null);

  return (
    <div className="card border-0 shadow-sm rounded-4 mb-4">
      <div className="card-body">
        <h5 className="fw-bold mb-3">Job Applications</h5>
        {loading ? (
          <ContentSkeleton rows={4} />
        ) : (
          <>
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Position</th>
                    <th>Skills</th>
                    <th>CV</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((app) => (
                    <tr key={app.id}>
                      <td>{app.fullName}</td>
                      <td>{app.email}</td>
                      <td>{app.position}</td>
                      <td>{Array.isArray(app.skills) ? app.skills.join(', ') : ''}</td>
                      <td>
                        {app.cvUrl ? (
                          <a href={app.cvUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-primary">View CV</a>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>
                        <span className="badge bg-soft-blue text-primary text-uppercase">
                          {app.status || 'new'}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button type="button" className="btn btn-outline-primary" onClick={() => setSelectedApp(app)}>View details</button>
                          <button type="button" className="btn btn-outline-success" onClick={() => updateStatus(app.id, 'reviewed')}>Mark reviewed</button>
                          <button type="button" className="btn btn-outline-secondary" onClick={() => updateStatus(app.id, 'archived')}>Archive</button>
                          <button type="button" className="btn btn-outline-danger" onClick={() => handleDelete(app.id, app.fullName)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedApp && (
              <div className={`modal fade show d-block`} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1} role="dialog" aria-hidden="false">
                <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Application Details</h5>
                      <button type="button" className="btn-close" aria-label="Close" onClick={closeDetails} />
                    </div>
                    <div className="modal-body">
                      <div className="row g-3">
                        <div className="col-md-6"><strong>Name:</strong> <span className="text-muted">{selectedApp.fullName || '—'}</span></div>
                        <div className="col-md-6"><strong>Father Name:</strong> <span className="text-muted">{selectedApp.fatherName || '—'}</span></div>
                        <div className="col-md-6"><strong>Email:</strong> <span className="text-muted">{selectedApp.email || '—'}</span></div>
                        <div className="col-md-6"><strong>Phone:</strong> <span className="text-muted">{selectedApp.phone || '—'}</span></div>
                        <div className="col-md-6"><strong>WhatsApp:</strong> <span className="text-muted">{selectedApp.whatsapp || '—'}</span></div>
                        <div className="col-md-6"><strong>CNIC:</strong> <span className="text-muted">{selectedApp.cnic || '—'}</span></div>
                        <div className="col-md-6"><strong>Date of Birth:</strong> <span className="text-muted">{selectedApp.dob || '—'}</span></div>
                        <div className="col-md-6"><strong>Gender:</strong> <span className="text-muted">{selectedApp.gender || '—'}</span></div>
                        <div className="col-md-6"><strong>City:</strong> <span className="text-muted">{selectedApp.city || '—'}</span></div>
                        <div className="col-md-6"><strong>Address:</strong> <span className="text-muted">{selectedApp.address || '—'}</span></div>
                        <div className="col-md-6"><strong>Education Degree:</strong> <span className="text-muted">{selectedApp.educationDegree || '—'}</span></div>
                        <div className="col-md-6"><strong>Institute:</strong> <span className="text-muted">{selectedApp.educationInstitute || '—'}</span></div>
                        <div className="col-md-6"><strong>Graduation Year:</strong> <span className="text-muted">{selectedApp.educationYear || '—'}</span></div>
                        <div className="col-md-6"><strong>Experience (years):</strong> <span className="text-muted">{selectedApp.experienceYears || '—'}</span></div>
                        <div className="col-md-6"><strong>Previous Company:</strong> <span className="text-muted">{selectedApp.previousCompany || '—'}</span></div>
                        <div className="col-md-6"><strong>Role:</strong> <span className="text-muted">{selectedApp.role || '—'}</span></div>
                        <div className="col-md-12"><strong>Responsibilities:</strong> <p className="text-muted mb-0">{selectedApp.responsibilities || '—'}</p></div>
                        <div className="col-md-12"><strong>Skills:</strong> <p className="text-muted mb-0">{Array.isArray(selectedApp.skills) ? selectedApp.skills.join(', ') : '—'}</p></div>
                        <div className="col-md-6"><strong>Portfolio:</strong> {selectedApp.portfolioLink ? (<a href={selectedApp.portfolioLink} target="_blank" rel="noreferrer">{selectedApp.portfolioLink}</a>) : (<span className="text-muted">—</span>)}</div>
                        <div className="col-md-6"><strong>GitHub:</strong> {selectedApp.githubLink ? (<a href={selectedApp.githubLink} target="_blank" rel="noreferrer">{selectedApp.githubLink}</a>) : (<span className="text-muted">—</span>)}</div>
                        <div className="col-md-6"><strong>LinkedIn:</strong> {selectedApp.linkedinLink ? (<a href={selectedApp.linkedinLink} target="_blank" rel="noreferrer">{selectedApp.linkedinLink}</a>) : (<span className="text-muted">—</span>)}</div>
                        <div className="col-md-6"><strong>Position:</strong> <span className="text-muted">{selectedApp.position || '—'}</span></div>
                        <div className="col-md-6"><strong>Expected Salary:</strong> <span className="text-muted">{selectedApp.expectedSalary || '—'}</span></div>
                        <div className="col-md-6"><strong>Availability:</strong> <span className="text-muted">{selectedApp.availability || '—'}</span></div>
                        <div className="col-md-6"><strong>Job Type:</strong> <span className="text-muted">{selectedApp.jobType || '—'}</span></div>
                        <div className="col-md-12"><strong>Short Bio:</strong> <p className="text-muted mb-0">{selectedApp.shortBio || '—'}</p></div>
                        <div className="col-md-12">
                          <strong>CV/Resume:</strong>{' '}
                          {selectedApp.cvUrl ? (
                            <a href={selectedApp.cvUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-primary ms-2">Open</a>
                          ) : (
                            <span className="text-muted ms-2">—</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn btn-secondary" onClick={closeDetails}>Close</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const UserManager = () => {
  const { data, loading } = useCollection('users', {
    orderByField: 'createdAt',
    orderDirection: 'desc',
  });
  const { toggleUserStatus } = useAuth();

  const handleToggle = async (user) => {
    const nextStatus = user.status === 'blocked' ? 'active' : 'blocked';
    await toggleUserStatus(user.uid, nextStatus);
  };

  const handleDelete = async (user) => {
    // eslint-disable-next-line no-alert
    if (window.confirm(`Delete profile for ${user.email}? This cannot be undone.`)) {
      await deleteDoc(doc(db, 'users', user.uid));
    }
  };

  return (
    <div className="card border-0 shadow-sm rounded-4 mb-4">
      <div className="card-body">
        <h5 className="fw-bold mb-3">User management</h5>
        {loading ? (
          <ContentSkeleton rows={4} />
        ) : (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((user) => (
                  <tr key={user.uid}>
                    <td>{user.displayName || '—'}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className="badge bg-soft-blue text-primary text-uppercase">
                        {user.role}
                      </span>
                    </td>
                    <td>{user.status}</td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button
                          type="button"
                          className="btn btn-outline-warning"
                          onClick={() => handleToggle(user)}
                        >
                          {user.status === 'blocked' ? 'Unblock' : 'Block'}
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          onClick={() => handleDelete(user)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="admin-dashboard bg-light py-5 min-vh-100">
      <PageHelmet title="Admin" description="Soft Verse admin dashboard to update site content, manage users, and review inbound leads." />
      <div className="container">
        <header className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
          <div>
            <p className="text-uppercase text-primary fw-semibold mb-1">Admin</p>
            <h1 className="fw-bold mb-0">Soft Verse Content Studio</h1>
          </div>
          <p className="text-muted">Signed in as {user.email}</p>
        </header>
        <CompanyInfoManager />
        <CollectionManager
          title="Homepage sliders"
          collectionName="homepageSliders"
          storageFolder="sliders"
          fields={[
            { name: 'kicker', label: 'Kicker' },
            { name: 'title', label: 'Title', required: true },
            { name: 'subtitle', label: 'Subtitle', type: 'textarea' },
            { name: 'ctaText', label: 'CTA text' },
            { name: 'ctaLink', label: 'CTA link' },
            { name: 'order', label: 'Order', inputType: 'number' },
            { name: 'imageUrl', label: 'Hero image', type: 'image', required: true },
          ]}
        />
        <CollectionManager
          title="Services"
          collectionName="services"
          storageFolder="services"
          fields={[
            { name: 'title', label: 'Title', required: true },
            { name: 'category', label: 'Category' },
            { name: 'description', label: 'Description', type: 'textarea', required: true },
            { name: 'highlights', label: 'Highlights', type: 'list' },
            { name: 'priority', label: 'Priority', inputType: 'number' },
            { name: 'ctaText', label: 'CTA text' },
            { name: 'ctaLink', label: 'CTA link' },
            { name: 'websiteUrl', label: 'Website URL', inputType: 'url' },
            { name: 'imageUrl', label: 'Image', type: 'image' },
          ]}
        />
        <CollectionManager
          title="Team members"
          collectionName="team"
          storageFolder="team"
          fields={[
            { name: 'name', label: 'Name', required: true },
            { name: 'role', label: 'Role', required: true },
            { name: 'bio', label: 'Bio', type: 'textarea' },
            { name: 'order', label: 'Order', inputType: 'number' },
            { name: 'imageUrl', label: 'Photo', type: 'image' },
          ]}
        />
        <CollectionManager
          title="Projects"
          collectionName="projects"
          storageFolder="projects"
          fields={[
            { name: 'title', label: 'Title', required: true },
            { name: 'industry', label: 'Industry' },
            { name: 'summary', label: 'Summary', type: 'textarea' },
            { name: 'ctaUrl', label: 'Case study URL' },
            { name: 'order', label: 'Order', inputType: 'number' },
            { name: 'imageUrl', label: 'Cover image', type: 'image' },
          ]}
        />
        <CollectionManager
          title="Blog posts"
          collectionName="blogPosts"
          storageFolder="blog"
          fields={[
            { name: 'title', label: 'Title', required: true },
            { name: 'excerpt', label: 'Excerpt', type: 'textarea' },
            { name: 'author', label: 'Author', required: true },
            { name: 'category', label: 'Category' },
            { name: 'coverImage', label: 'Cover image', type: 'image' },
          ]}
        />
        <ApplicationsManager />
        <ContactResponses />
        <UserManager />
      </div>
    </div>
  );
};

export default AdminDashboard;

