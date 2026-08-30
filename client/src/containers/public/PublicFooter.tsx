import { Link } from "react-router-dom";
import { publicClasses, publicColors } from "./publicTheme";
import basisTransportLogo from "/logo.svg";

type FooterLink = { to: string; label: string };

const footerSections: { title: string; links: FooterLink[] }[] = [
  {
    title: "Product",
    links: [
      { to: "/#how-it-works", label: "How it works" },
      { to: "#", label: "Supported cities" },
      { to: "#", label: "About us" },
    ],
  },
  {
    title: "Support",
    links: [
      { to: "#", label: "Help center" },
      { to: "#", label: "Contact us" },
      { to: "#", label: "Privacy" },
    ],
  },
];

const legalLinks: FooterLink[] = [
  { to: "#", label: "Privacy Policy" },
  { to: "#", label: "Terms of Service" },
  { to: "#", label: "Cookies" },
];

function FooterNavLink({
  link,
  muted = false,
}: {
  link: FooterLink;
  muted?: boolean;
}) {
  const isPlaceholder = link.to === "#";
  return (
    <Link
      to={isPlaceholder ? "/" : link.to}
      onClick={isPlaceholder ? (e) => e.preventDefault() : undefined}
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
    <footer
      className="py-16"
      style={{ backgroundColor: publicColors.bgAlt }}
    >
      <section className={publicClasses.containerWide}>
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
              Enjoy your daily journeys with us, always free and always accessible for everyone.
            </span>{" "}
            At Basis Transport, we are dedicated to making your commute stress-free and easy, without any cost to you. Thanks to support from advertisements, we make it possible for every traveler to get where they need to go with confidence and peace of mind.
          </p>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-6">
            <p
              className="type-body-sm"
              style={{ color: publicColors.neutralLight }}
            >
              © 2026 Basis Transport. All rights reserved.
            </p>
            <nav className="flex gap-6" aria-label="Legal">
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
