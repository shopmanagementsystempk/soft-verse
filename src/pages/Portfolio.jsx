import useCollection from '../hooks/useCollection';
import SectionHeading from '../components/shared/SectionHeading';
import ContentSkeleton from '../components/shared/ContentSkeleton';
import PageHelmet from '../components/seo/PageHelmet';

const Portfolio = () => {
  const { data: projects, loading } = useCollection('projects', {
    orderByField: 'createdAt',
    orderDirection: 'desc',
  });

  return (
    <div className="portfolio-page">
      <PageHelmet title="Portfolio" description="Review featured Soft Verse projects across industries, from platform builds to AI-powered experiences." />
      <section className="inner-hero">
        <div className="container py-5">
          <p className="text-uppercase text-primary fw-semibold">Portfolio</p>
          <h1 className="display-4 fw-bold text-dark">Outcomes engineered for ambitious leaders</h1>
          <p className="lead text-muted col-lg-8 px-0">
            Application modernization, platform builds, AI accelerators, and brand new ventures powered by Soft Verse engineers.
          </p>
        </div>
      </section>

      <section className="py-5 bg-light">
        <div className="container">
          <SectionHeading title="Case studies" subtitle="Featured work" />
          {loading ? (
            <ContentSkeleton rows={5} />
          ) : (
            <div className="row g-4">
              {projects.map((project) => (
                <div className="col-md-6 col-lg-4" key={project.id}>
                  <div className="project-card rounded-4 overflow-hidden shadow-sm h-100">
                    <img
                      src={
                        project.imageUrl ||
                        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80'
                      }
                      alt={project.title}
                      className="project-card__image"
                    />
                    <div className="p-4 bg-white">
                      <p className="text-primary text-uppercase small mb-2">
                        {project.industry || 'Enterprise'}
                      </p>
                      <h5 className="fw-bold">{project.title}</h5>
                      <p className="text-muted">{project.summary}</p>
                      {project.ctaUrl && (
                        <a href={project.ctaUrl} className="btn btn-link text-primary px-0">
                          View case study →
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

export default Portfolio;

