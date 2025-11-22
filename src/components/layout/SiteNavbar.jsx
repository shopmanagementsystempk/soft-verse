import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FaBars, FaSignOutAlt, FaTachometerAlt, FaUserCircle } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import useDocument from '../../hooks/useDocument';

const NAV_LINKS = [
  { path: '/', label: 'Home' },
  { path: '/about', label: 'About' },
  { path: '/services', label: 'Services' },
  { path: '/team', label: 'Team' },
  { path: '/portfolio', label: 'Portfolio' },
  { path: '/blog', label: 'Blog' },
  { path: '/contact', label: 'Contact' },
  { path: '/apply', label: 'Apply Now' },
];

const SiteNavbar = () => {
  const [expanded, setExpanded] = useState(false);
  const { data: siteSettings } = useDocument('siteSettings', 'global');
  const { user, logoutUser, isAdmin } = useAuth();

  const closeMenu = () => setExpanded(false);

  const handleLogout = async () => {
    await logoutUser();
    closeMenu();
  };

  return (
    <nav className="navbar navbar-expand-lg bg-white shadow-sm py-3 sticky-top">
      <div className="container">
        <Link to="/" className="navbar-brand d-flex align-items-center gap-2 fw-bold text-primary text-uppercase">
          <img src={process.env.PUBLIC_URL + '/logo.png'} alt="Soft Verse logo" className="brand-logo" />
          <span>Soft Verse</span>
        </Link>
        <button
          className="navbar-toggler border-0"
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          aria-label="Toggle navigation"
          aria-controls="primaryMenu"
          aria-expanded={expanded}
        >
          <FaBars size={20} />
        </button>
        <div className={`collapse navbar-collapse ${expanded ? 'show' : ''}`} id="primaryMenu">
          <ul className="navbar-nav ms-auto align-items-lg-center">
            {NAV_LINKS.map((link) => (
              <li className="nav-item" key={link.path}>
                <NavLink
                  to={link.path}
                  className={({ isActive }) =>
                    `nav-link px-3 fw-medium ${isActive ? 'text-primary' : ''}`
                  }
                  onClick={closeMenu}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
            {user ? (
              <li className="nav-item dropdown">
                <button
                  className="btn btn-link nav-link dropdown-toggle d-flex align-items-center gap-2"
                  data-bs-toggle="dropdown"
                  type="button"
                >
                  <FaUserCircle />
                  {user.displayName || user.email}
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow-sm">
                  <li>
                    <Link to="/profile" className="dropdown-item" onClick={closeMenu}>
                      Profile
                    </Link>
                  </li>
                  {isAdmin && (
                    <li>
                      <Link
                        to="/admin"
                        className="dropdown-item d-flex align-items-center gap-2"
                        onClick={closeMenu}
                      >
                        <FaTachometerAlt /> Admin
                      </Link>
                    </li>
                  )}
                  <li>
                    <button
                      type="button"
                      className="dropdown-item text-danger d-flex align-items-center gap-2"
                      onClick={handleLogout}
                    >
                      <FaSignOutAlt /> Logout
                    </button>
                  </li>
                </ul>
              </li>
            ) : (
              <li className="nav-item ms-lg-3">
                <Link to="/login" className="btn btn-primary rounded-pill px-4" onClick={closeMenu}>
                  Sign In
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default SiteNavbar;

