import { Link } from 'react-router-dom';
import useCollection from '../hooks/useCollection';
import useDocument from '../hooks/useDocument';
import SectionHeading from '../components/shared/SectionHeading';
import ContentSkeleton from '../components/shared/ContentSkeleton';
import StatCard from '../components/shared/StatCard';
import PageHelmet from '../components/seo/PageHelmet';

const Home = () => {
  const { data: sliders, loading: slidersLoading } = useCollection('homepageSliders', {
    orderByField: 'order',
  });
  const { data: services, loading: servicesLoading } = useCollection('services', {
    orderByField: 'priority',
    limitTo: 3,
  });
  const { data: projects, loading: projectsLoading } = useCollection('projects', {
    orderByField: 'createdAt',
    orderDirection: 'desc',
    limitTo: 3,
  });
  const { data: blogPosts, loading: blogLoading } = useCollection('blogPosts', {
    orderByField: 'publishedAt',
    orderDirection: 'desc',
    limitTo: 3,
  });
  const { data: siteSettings, loading: siteLoading } = useDocument('siteSettings', 'global');

  const heroSlide = sliders[0];

  return (
    <div className="home-page">
      <PageHelmet
        title="Home"
        description="Soft Verse delivers enterprise-grade software consulting, product engineering, and cloud transformation for modern businesses."
      />
      <section className="hero-section position-relative overflow-hidden">
        <div className="container py-5">
          {slidersLoading ? (
            <ContentSkeleton rows={4} />
          ) : (
            <div className="row align-items-center g-4">
              <div className="col-lg-6" data-aos="fade-right">
                <p className="text-uppercase text-primary fw-semibold mb-2">
                  {heroSlide?.kicker || 'Digital-first consulting'}
                </p>
                <h1 className="display-4 fw-bold text-white">
                  {heroSlide?.title || 'Engineering the next era of software'}
                </h1>
                <p className="text-white-50 lead">
                  {heroSlide?.subtitle ||
                    'Soft Verse blends strategy, design and engineering to launch resilient platforms for enterprises worldwide.'}
                </p>
                <div className="d-flex gap-3 flex-wrap">
                  {heroSlide?.ctaText && heroSlide?.ctaLink && (
                    <a href={heroSlide.ctaLink} className="btn btn-primary btn-lg rounded-pill">
                      {heroSlide.ctaText}
                    </a>
                  )}
                  <Link to="/services" className="btn btn-outline-light btn-lg rounded-pill">
                    Explore services
                  </Link>
                </div>
              </div>
              <div className="col-lg-6 text-center" data-aos="fade-left">
                <div className="hero-image-wrapper rounded-4 shadow-lg">
                  <img
                    src={
                      heroSlide?.imageUrl ||
                      'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1000&q=80'
                    }
                    alt={heroSlide?.title || 'Soft Verse hero'}
                    className="img-fluid rounded-4"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="py-5 bg-light">
        <div className="container">
          <SectionHeading title="Impact in numbers" subtitle="Proof of execution" />
          {siteLoading ? (
            <ContentSkeleton rows={3} />
          ) : (
            <div className="row g-4">
              {(siteSettings?.stats || []).map((stat) => (
                <div className="col-md-3 col-6" key={stat.label}>
                  <StatCard label={stat.label} value={stat.value} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <SectionHeading title="What we deliver" subtitle="Services" />
          {servicesLoading ? (
            <ContentSkeleton rows={4} />
          ) : (
            <div className="row g-4">
              {services.map((service) => (
                <div className="col-md-4" key={service.id} data-aos="fade-up">
                  <div className="card h-100 shadow-sm border-0 rounded-4">
                    <div className="card-body p-4">
                      <span className="badge bg-soft-primary text-primary mb-3">
                        {service.category || 'Capability'}
                      </span>
                      <h5 className="fw-bold">{service.title}</h5>
                      <p className="text-muted">{service.description}</p>
                      <Link to="/services" className="btn btn-link text-primary px-0">
                        Learn more →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-5 bg-light">
        <div className="container">
          <SectionHeading title="Featured work" subtitle="Portfolio" />
          {projectsLoading ? (
            <ContentSkeleton rows={4} />
          ) : (
            <div className="row g-4">
              {projects.map((project) => (
                <div className="col-md-4" key={project.id}>
                  <div className="project-card rounded-4 overflow-hidden shadow-sm" data-aos="zoom-in">
                    <img
                      src={
                        project.imageUrl ||
                        'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=900&q=80'
                      }
                      alt={project.title}
                      className="w-100 project-card__image"
                    />
                    <div className="p-4 bg-white">
                      <p className="text-primary text-uppercase small mb-2">{project.industry}</p>
                      <h5 className="fw-bold">{project.title}</h5>
                      <p className="text-muted">{project.summary}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="text-center mt-4">
            <Link to="/portfolio" className="btn btn-outline-primary rounded-pill">
              View portfolio
            </Link>
          </div>
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <SectionHeading title="Insights" subtitle="Blog" />
          {blogLoading ? (
            <ContentSkeleton rows={4} />
          ) : (
            <div className="row g-4">
              {blogPosts.map((post) => (
                <div className="col-md-4" key={post.id}>
                  <div className="card h-100 border-0 shadow-sm rounded-4">
                    <div className="card-body p-4">
                      <p className="text-muted small mb-2">
                        {post.author} —{' '}
                        {post.publishedAt?.toDate
                          ? post.publishedAt.toDate().toLocaleDateString()
                          : ''}
                      </p>
                      <h5 className="fw-bold">{post.title}</h5>
                      <p className="text-muted">{post.excerpt}</p>
                      <Link to="/blog" className="btn btn-link text-primary px-0">
                        Continue reading →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-5 bg-primary text-white">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <h2 className="fw-bold">Ready to build your next digital product?</h2>
              <p className="text-white-50 lead mb-0">
                {siteSettings?.ctaText ||
                  'Partner with Soft Verse for human-centered design and resilient engineering.'}
              </p>
            </div>
            <div className="col-lg-4 text-lg-end">
              <Link to="/contact" className="btn btn-light text-primary rounded-pill px-4">
                Book a consultation
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

