import { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import useDocument from '../hooks/useDocument';
import SectionHeading from '../components/shared/SectionHeading';
import PageHelmet from '../components/seo/PageHelmet';

const initialState = {
  fullName: '',
  email: '',
  company: '',
  message: '',
};

const Contact = () => {
  const { data: siteSettings } = useDocument('siteSettings', 'global');
  const [formState, setFormState] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setStatus(null);
    try {
      await addDoc(collection(db, 'contactMessages'), {
        ...formState,
        status: 'new',
        createdAt: serverTimestamp(),
      });
      setStatus({ type: 'success', message: 'Message received! Our team will follow up shortly.' });
      setFormState(initialState);
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Something went wrong. Please retry or email hello@softverse.com',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      <PageHelmet title="Contact" description="Message the Soft Verse team to discuss advisory, design, engineering, or managed services engagements." />
      <section className="inner-hero">
        <div className="container py-5">
          <p className="text-uppercase text-primary fw-semibold">Contact</p>
          <h1 className="display-4 fw-bold text-dark">Let’s talk about your roadmap</h1>
          <p className="lead text-muted col-lg-8 px-0">
            Send a message and a Soft Verse engagement lead will respond within one business day.
          </p>
        </div>
      </section>

      <section className="py-5 bg-light">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-6">
              <SectionHeading title="Visit us" subtitle="Offices" />
              <div className="card border-0 shadow-sm rounded-4 mb-4">
                <div className="card-body p-4">
                  <h5 className="fw-bold">Global HQ</h5>
                  <p className="text-muted mb-1">{siteSettings?.address || 'Remote-first, Global'}</p>
                  <p className="text-muted mb-1">{siteSettings?.email || 'hello@softverse.com'}</p>
                  <p className="text-muted">{siteSettings?.phone || '+1 (800) 555-0199'}</p>
                </div>
              </div>
              <SectionHeading title="Write to us" subtitle="Contact form" />
              <p className="text-muted mb-0">
                Fill the form and we will schedule a discovery workshop tailored for your organization.
              </p>
            </div>

            <div className="col-lg-6">
              <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body p-4">
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Full name</label>
                      <input
                        type="text"
                        name="fullName"
                        className="form-control"
                        value={formState.fullName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Work email</label>
                      <input
                        type="email"
                        name="email"
                        className="form-control"
                        value={formState.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Company</label>
                      <input
                        type="text"
                        name="company"
                        className="form-control"
                        value={formState.company}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">How can we help?</label>
                      <textarea
                        name="message"
                        rows="4"
                        className="form-control"
                        value={formState.message}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    {status && (
                      <div
                        className={`alert ${
                          status.type === 'success' ? 'alert-success' : 'alert-danger'
                        }`}
                      >
                        {status.message}
                      </div>
                    )}
                    <button
                      type="submit"
                      className="btn btn-primary rounded-pill px-4"
                      disabled={submitting}
                    >
                      {submitting ? 'Sending...' : 'Submit'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;

