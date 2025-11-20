import useDocument from '../hooks/useDocument';
import useCollection from '../hooks/useCollection';
import SectionHeading from '../components/shared/SectionHeading';
import ContentSkeleton from '../components/shared/ContentSkeleton';
import PageHelmet from '../components/seo/PageHelmet';

const About = () => {
  const { data: siteSettings, loading: siteLoading } = useDocument('siteSettings', 'global');
  const { data: leadership, loading: teamLoading } = useCollection('team', {
    orderByField: 'order',
  });

  return (
    <div className="about-page">
      <PageHelmet title="About" description="Learn how Soft Verse blends strategy, design, and engineering to ship enterprise-grade digital products." />
      <section className="inner-hero">
        <div className="container py-5">
          <p className="text-uppercase text-primary fw-semibold">About Soft Verse</p>
          <h1 className="display-4 fw-bold text-dark">Crafting enterprise software with precision</h1>
          <p className="lead text-muted col-lg-8 px-0">
            {siteSettings?.aboutIntro ||
              'Soft Verse merges consulting, design and product engineering to accelerate digital transformation for ambitious organizations.'}
          </p>
        </div>
      </section>

      <section className="py-5 bg-light">
        <div className="container">
          <SectionHeading title="Our mission" subtitle="Why we exist" />
          {siteLoading ? (
            <ContentSkeleton rows={3} />
          ) : (
            <div className="row g-4">
              <div className="col-md-6">
                <div className="card h-100 shadow-sm border-0 rounded-4">
                  <div className="card-body p-4">
                    <h5 className="fw-bold text-primary mb-3">Purpose</h5>
                    <p className="text-muted">{siteSettings?.mission || 'Enable modern enterprises to launch customer-grade software faster.'}</p>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card h-100 shadow-sm border-0 rounded-4">
                  <div className="card-body p-4">
                    <h5 className="fw-bold text-primary mb-3">Vision</h5>
                    <p className="text-muted">{siteSettings?.vision || 'Be the trusted engineering partner for digital-first brands globally.'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <SectionHeading title="Leadership" subtitle="People" />
          {teamLoading ? (
            <ContentSkeleton rows={4} />
          ) : (
            <div className="row g-4">
              {leadership.map((member) => (
                <div className="col-md-4" key={member.id}>
                  <div className="team-card text-center rounded-4 shadow-sm h-100">
                    <img
                      src={
                        member.imageUrl ||
                        'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=600&q=80'
                      }
                      alt={member.name}
                      className="team-card__image"
                    />
                    <div className="p-4">
                      <h5 className="fw-bold">{member.name}</h5>
                      <p className="text-primary">{member.role}</p>
                      <p className="text-muted small">{member.bio}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default About;

