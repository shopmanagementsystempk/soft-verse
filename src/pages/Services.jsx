import useCollection from '../hooks/useCollection';
import SectionHeading from '../components/shared/SectionHeading';
import ContentSkeleton from '../components/shared/ContentSkeleton';
import PageHelmet from '../components/seo/PageHelmet';

const Services = () => {
  const { data: services, loading } = useCollection('services', {
    orderByField: 'priority',
  });

  return (
    <div className="services-page">
      <PageHelmet title="Services" description="Discover Soft Verse consulting, design, and product engineering services crafted for modern enterprises." />
      <section className="inner-hero">
        <div className="container py-5">
          <p className="text-uppercase text-primary fw-semibold">Capabilities</p>
          <h1 className="display-4 fw-bold text-dark">End-to-end product development</h1>
          <p className="lead text-muted col-lg-8 px-0">
            We orchestrate multi-disciplinary teams to build platforms, modernize core systems,
            and launch new revenue streams for Soft Verse clients.
          </p>
        </div>
      </section>

      <section className="py-5 bg-light">
        <div className="container">
          <SectionHeading title="Service catalog" subtitle="What we do" />
          {loading ? (
            <ContentSkeleton rows={5} />
          ) : (
            <div className="row g-4">
              {services.map((service) => (
                <div className="col-md-6 col-lg-4" key={service.id}>
                  <div className="card h-100 border-0 shadow-sm rounded-4">
                    {service.imageUrl && (
                      <img
                        src={service.imageUrl}
                        alt={service.title}
                        className="card-img-top"
                        style={{ height: '180px', objectFit: 'cover' }}
                      />
                    )}
                    <div className="card-body p-4">
                      <span className="badge bg-soft-blue text-primary mb-3">
                        {service.category || 'Service'}
                      </span>
                      <h5 className="fw-bold">{service.title}</h5>
                      <p className="text-muted">{service.description}</p>
                      {service.highlights && (
                        <ul className="list-unstyled text-muted small">
                          {service.highlights.map((item) => (
                            <li key={item}>• {item}</li>
                          ))}
                        </ul>
                      )}
                      {service.ctaText && service.ctaLink && (
                        <a
                          href={service.ctaLink}
                          className="btn btn-outline-primary rounded-pill mt-3"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {service.ctaText}
                        </a>
                      )}
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

export default Services;

