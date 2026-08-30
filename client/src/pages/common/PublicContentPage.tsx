import '@/styles/landingPage.css';
import { Seo } from '@/components/seo';
import PublicFooter from '@/containers/public/PublicFooter';
import PublicLayout from '@/containers/public/PublicLayout';
import PublicNavbar from '@/containers/public/PublicNavbar';
import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface PublicContentPageProps {
  title: string;
  description: string;
  canonicalPath: string;
  eyebrow?: string;
  children: ReactNode;
}

const PublicContentPage = ({
  title,
  description,
  canonicalPath,
  eyebrow,
  children,
}: PublicContentPageProps) => (
  <>
    <Seo
      title={`${title} | Basis Transport`}
      description={description}
      canonicalPath={canonicalPath}
    />
    <PublicLayout>
      <PublicNavbar />
      <main className="landing-page landing-paper min-h-[calc(100vh-4rem)]">
        <div className="landing-container py-10 lg:py-14">
          <Link to="/" className="landing-link-sweep mb-6 inline-flex items-center gap-2">
            <FontAwesomeIcon icon={faArrowLeft} className="size-3.5" aria-hidden="true" />
            Back to home
          </Link>

          <header className="mb-10 max-w-3xl">
            {eyebrow ? <p className="landing-eyebrow mb-3">{eyebrow}</p> : null}
            <h1 className="landing-display text-[var(--landing-ink)]">{title}</h1>
            <p className="landing-body mt-4 text-[var(--landing-muted)]">{description}</p>
            <div className="landing-route-divider mt-8" aria-hidden="true" />
          </header>

          <article className="max-w-3xl space-y-6 landing-body text-[var(--landing-muted)] [&_h2]:landing-label [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-[var(--landing-ink)] [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:ps-5">
            {children}
          </article>
        </div>
      </main>
      <PublicFooter />
    </PublicLayout>
  </>
);

export default PublicContentPage;
