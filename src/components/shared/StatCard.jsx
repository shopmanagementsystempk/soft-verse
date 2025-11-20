const StatCard = ({ label, value }) => (
  <div className="stat-card bg-white shadow-sm p-4 rounded-4 text-center h-100">
    <div className="display-5 fw-bold text-primary">{value}</div>
    <p className="text-muted mb-0">{label}</p>
  </div>
);

export default StatCard;

