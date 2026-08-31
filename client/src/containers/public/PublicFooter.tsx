import { Link } from 'react-router-dom';
import { publicClasses, publicColors } from './publicTheme';
import basisTransportLogo from '/logo.svg';

type FooterLink = { to: string; label: string };

const footerSections: { title: string; links: FooterLink[] }[] = [
  {
    title: 'Product',
    links: [
      { to: '/#how-it-works', label: 'How it works' },
      { to: '/cities', label: 'Supported cities' },
      { to: '/about', label: 'About us' },
    ],
  },
  {
    title: 'Support',
    links: [
      { to: '/help', label: 'Help center' },
      { to: '/contact', label: 'Contact us' },
      { to: '/privacy', label: 'Privacy' },
    ],
  },
];

const legalLinks: FooterLink[] = [
  { to: '/privacy', label: 'Privacy Policy' },
  { to: '/terms', label: 'Terms of Service' },
  { to: '/cookies', label: 'Cookies' },
];

function FooterNavLink({
  link,
  muted = false,
}: {
  link: FooterLink;
  muted?: boolean;
}) {
  return (
    <Link
      to={link.to}
      className={`type-body-sm hover:underline underline-offset-2 transition-colors ${
        muted ? '' : 'text-(--ink)'
      }`}
      style={muted ? { color: publicColors.neutralLight } : undefined}
    >
      {link.label}
    </Link>
  );
}

const PublicFooter = () => {
  return (
    <footer className="py-16" style={{ backgroundColor: publicColors.bgAlt }}>
      <section className="landing-container">
        <article className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <section>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img
                src={basisTransportLogo}
                alt="Basis Transport Logo"
                className="w-10 h-10"
              />
              <span
                className={publicClasses.cardTitle}
                style={{ color: publicColors.primary }}
              >
                Basis Transport
              </span>
            </Link>
            <p
              className={`${publicClasses.bodyMuted} mt-4`}
              style={{ color: publicColors.neutralLight }}
            >
              Making daily commutes simple, predictable, and stress-free.
            </p>
          </section>

          {footerSections.map((section) => (
            <section key={section.title}>
              <h3
                className={`${publicClasses.cardTitle} mb-4`}
                style={{ color: publicColors.primary }}
              >
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <FooterNavLink link={link} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </article>

        <section className="pt-8">
          <p
            className="text-[12px] leading-relaxed mb-6 font-normal"
            style={{ color: publicColors.neutralLight }}
          >
            <span className="font-medium">
              Plan a journey without creating an account.
            </span>{' '}
            Browse routes and stops, follow directions, and save favorites on your device. Check coverage and source freshness before travelling.
          </p>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-6 border-t border-(--line)">
            <p
              className="type-body-sm"
              style={{ color: publicColors.neutralLight }}
            >
              © 2026 Basis Transport. All rights reserved.
            </p>
            <nav className="flex flex-wrap gap-6" aria-label="Legal">
              {legalLinks.map((link) => (
                <FooterNavLink key={link.label} link={link} muted />
              ))}
            </nav>
          </div>
        </section>
      </section>
    </footer>
  );
};

export default PublicFooter;
