import useCollection from '../hooks/useCollection';
import SectionHeading from '../components/shared/SectionHeading';
import ContentSkeleton from '../components/shared/ContentSkeleton';
import PageHelmet from '../components/seo/PageHelmet';

const Team = () => {
  const { data: teamMembers, loading } = useCollection('team', {
    orderByField: 'order',
  });

  return (
    <div className="team-page">
      <PageHelmet title="Team" description="Meet the Soft Verse leadership team and global experts across product strategy, design, and engineering." />
      <section className="inner-hero">
        <div className="container py-5">
          <p className="text-uppercase text-primary fw-semibold">Teams</p>
          <h1 className="display-4 fw-bold text-dark">Experts across strategy, design & engineering</h1>
          <p className="lead text-muted col-lg-8 px-0">
            Distributed squads anchored by Soft Verse Delivery Centers, ready to co-create with your in-house teams.
          </p>
        </div>
      </section>

      <section className="py-5 bg-light">
        <div className="container">
          <SectionHeading title="Meet the team" subtitle="Leadership" />
          {loading ? (
            <ContentSkeleton rows={5} />
          ) : (
            <div className="row g-4">
              {teamMembers.map((member) => (
                <div className="col-md-4" key={member.id}>
                  <div className="team-card text-center rounded-4 shadow-sm h-100">
                    {member.imageUrl && (
                      <img
                        src={member.imageUrl}
                        alt={member.name}
                        className="team-card__image"
                      />
                    )}
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

export default Team;

