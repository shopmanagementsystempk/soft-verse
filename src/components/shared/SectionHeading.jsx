const SectionHeading = ({ title, subtitle, align = 'center' }) => (
  <div className={`section-heading text-${align} mb-5`}>
    {subtitle && (
      <p className="text-uppercase text-primary fw-semibold mb-2">{subtitle}</p>
    )}
    <h2 className="fw-bold text-dark">{title}</h2>
  </div>
);

export default SectionHeading;

