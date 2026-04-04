import { Link } from 'react-router-dom';
import { publicColors } from './publicTheme';
import basisTransportLogo from '/logo.svg';

const footerSections = [
  {
    title: 'Product',
    links: [
      { href: '/#how-it-works', label: 'How it works' },
      { href: '#', label: 'Supported cities' },
      { href: '#', label: 'About us' },
    ],
  },
  {
    title: 'Support',
    links: [
      { href: '#', label: 'Help center' },
      { href: '#', label: 'Contact us' },
      { href: '#', label: 'Privacy' },
    ],
  },
];

const legalLinks = [
  { href: '#', label: 'Privacy Policy' },
  { href: '#', label: 'Terms of Service' },
  { href: '#', label: 'Cookies' },
];

const PublicFooter = () => {
  return (
    <footer
      className="py-16 border-t"
      style={{ borderColor: `${publicColors.primary}15` }}
    >
      <section className="max-w-6xl mx-auto px-6 lg:px-8">
        <article className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <section>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img
                src={basisTransportLogo}
                alt="Basis Transport Logo"
                className="w-10 h-10"
              />
              <span
                className="font-medium"
                style={{ color: publicColors.primary }}
              >
                Basis Transport
              </span>
            </Link>
            <p
              style={{ color: publicColors.neutralLight }}
              className="text-sm mt-4"
            >
              Making daily commutes simple, predictable, and stress-free.
            </p>
          </section>

          {footerSections.map((section) => (
            <section key={section.title}>
              <h3
                className="font-medium mb-4"
                style={{ color: publicColors.primary }}
              >
                {section.title}
              </h3>
              <ul
                className="space-y-3 text-sm"
                style={{ color: publicColors.neutralLight }}
              >
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="hover:opacity-70 text-[12px] transition-opacity"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </article>

        <section
          className="pt-8 border-t"
          style={{ borderColor: `${publicColors.primary}15` }}
        >
          <p
            className="text-sm leading-relaxed mb-4"
            style={{ color: publicColors.neutralLight }}
          >
            <span className="text-[12px] font-medium">
              This service is free to use and supported by advertisements.
            </span>{' '}
            We will always be free for everyday commuters. Our goal is to help
            you travel with confidence, not to charge you for it.
          </p>
          <div
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t"
            style={{ borderColor: `${publicColors.primary}15` }}
          >
            <p className="text-xs" style={{ color: publicColors.neutralLight }}>
              © 2026 Basis Transport. All rights reserved.
            </p>
            <nav className="flex gap-6 text-xs" aria-label="Legal">
              {legalLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="hover:opacity-70 text-[12px] transition-opacity"
                  style={{ color: publicColors.neutralLight }}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        </section>
      </section>
    </footer>
  );
};

export default PublicFooter;
