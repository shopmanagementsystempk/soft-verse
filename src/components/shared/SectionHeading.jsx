const SectionHeading = ({ title, subtitle, align = 'center', invert = false }) => (
  <div className={`section-heading text-${align} mb-5`}>
    {subtitle && (
      <p className={`text-uppercase ${invert ? 'text-white-50' : 'text-primary'} fw-semibold mb-2`}>{subtitle}</p>
    )}
    <h2 className={`fw-bold ${invert ? 'text-white' : 'text-dark'}`}>{title}</h2>
  </div>
);

export default SectionHeading;

