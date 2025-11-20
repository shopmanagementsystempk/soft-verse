import useCollection from '../hooks/useCollection';
import SectionHeading from '../components/shared/SectionHeading';
import ContentSkeleton from '../components/shared/ContentSkeleton';
import PageHelmet from '../components/seo/PageHelmet';

const Blog = () => {
  const { data: posts, loading } = useCollection('blogPosts', {
    orderByField: 'publishedAt',
    orderDirection: 'desc',
  });

  return (
    <div className="blog-page">
      <PageHelmet title="Blog" description="Soft Verse shares insights on cloud platforms, design systems, product delivery, and AI transformation." />
      <section className="inner-hero">
        <div className="container py-5">
          <p className="text-uppercase text-primary fw-semibold">Insights</p>
          <h1 className="display-4 fw-bold text-dark">Ideas shaping digital enterprises</h1>
          <p className="lead text-muted col-lg-8 px-0">
            Soft Verse strategists, designers, and engineers share perspectives on building products that scale.
          </p>
        </div>
      </section>

      <section className="py-5 bg-light">
        <div className="container">
          <SectionHeading title="Latest updates" subtitle="Blog" />
          {loading ? (
            <ContentSkeleton rows={6} />
          ) : (
            <div className="row g-4">
              {posts.map((post) => (
                <div className="col-md-6" key={post.id}>
                  <article className="card h-100 border-0 shadow-sm rounded-4">
                    {post.coverImage && (
                      <img src={post.coverImage} alt={post.title} className="card-img-top" />
                    )}
                    <div className="card-body p-4">
                      <p className="text-primary text-uppercase small mb-2">{post.category || 'Thought leadership'}</p>
                      <h4 className="fw-bold">{post.title}</h4>
                      <p className="text-muted">{post.excerpt}</p>
                      <p className="text-muted small mb-0">
                        {post.author} —{' '}
                        {post.publishedAt?.toDate
                          ? post.publishedAt.toDate().toLocaleDateString()
                          : ''}
                      </p>
                    </div>
                  </article>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Blog;

