import { FaEnvelope, FaFacebook, FaLinkedin, FaMapMarkerAlt, FaPhone, FaTwitter } from 'react-icons/fa';
import useDocument from '../../hooks/useDocument';
import SectionHeading from '../shared/SectionHeading';

const Footer = () => {
  const { data: siteSettings } = useDocument('siteSettings', 'global');
  const currentYear = new Date().getFullYear();
  const quickLinks = siteSettings?.quickLinks || [
    { label: 'Our Story', url: '/about' },
    { label: 'Services', url: '/services' },
    { label: 'Projects', url: '/portfolio' },
    { label: 'Insights', url: '/blog' },
    { label: 'Contact', url: '/contact' },
  ];

  return (
    <footer className="footer bg-dark-blue text-white mt-auto">
      <div className="container py-5">
        <div className="row g-4">
          <div className="col-md-4">
            <SectionHeading title="Soft Verse" subtitle="Innovate with intent" align="start" invert />
            <p className="text-white-50">
              {siteSettings?.aboutSnippet ||
                'Soft Verse crafts enterprise-grade digital experiences powered by cloud, data and intelligent automation.'}
            </p>
            <div className="d-flex gap-3">
              {siteSettings?.socialLinks?.facebook && (
                <a href={siteSettings.socialLinks.facebook} className="text-white-50" aria-label="Facebook">
                  <FaFacebook size={20} />
                </a>
              )}
              {siteSettings?.socialLinks?.twitter && (
                <a href={siteSettings.socialLinks.twitter} className="text-white-50" aria-label="Twitter">
                  <FaTwitter size={20} />
                </a>
              )}
              {siteSettings?.socialLinks?.linkedin && (
                <a href={siteSettings.socialLinks.linkedin} className="text-white-50" aria-label="LinkedIn">
                  <FaLinkedin size={20} />
                </a>
              )}
            </div>
          </div>
          <div className="col-md-4">
            <h5 className="text-uppercase mb-3">Quick Links</h5>
            <ul className="list-unstyled text-white-50">
              {quickLinks.map((link) => (
                <li key={link.label} className="mb-2">
                  <a href={link.url} className="text-white-50 text-decoration-none">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-md-4">
            <h5 className="text-uppercase mb-3">Connect</h5>
            <ul className="list-unstyled text-white-50">
              <li className="d-flex align-items-center gap-2 mb-2">
                <FaMapMarkerAlt /> {siteSettings?.address || 'Global Delivery Center, Remote'}
              </li>
              <li className="d-flex align-items-center gap-2 mb-2">
                <FaPhone /> {siteSettings?.phone || '+1 (800) 555-0199'}
              </li>
              <li className="d-flex align-items-center gap-2 mb-2">
                <FaEnvelope /> {siteSettings?.email || 'hello@softverse.com'}
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-top border-secondary text-center py-3 text-white-50 small">
        © {currentYear} Soft Verse. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;

