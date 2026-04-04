import { Helmet } from 'react-helmet';
import {
  absoluteUrl,
  defaultFaviconHref,
  defaultOgImage,
} from '@/constants/seo.constants';

export type SeoProps = {
  title: string;
  description: string;
  /** Path only, e.g. `/auth/login` or `/` */
  canonicalPath: string;
  /** Set to `false` to omit the author meta tag */
  author?: string | false;
  /** Raw robots value; ignored if `noIndex` is true */
  robots?: string;
  /** Sets `robots` to `noindex, follow` */
  noIndex?: boolean;
  keywords?: string;
  /** Renders `<meta httpEquiv="Content-Language" content="..." />` */
  contentLanguage?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogType?: string;
  ogImage?: string;
  /** When false, skips Open Graph, Twitter card, and default favicon (for minimal auth utility pages). Default true */
  openGraph?: boolean;
  /** When true (default), adds default favicon link if `openGraph` is true */
  includeFavicon?: boolean;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  /** Injected as `application/ld+json`; object is JSON.stringify’d */
  jsonLd?: Record<string, unknown> | string;
};

const DEFAULT_AUTHOR = 'Basis Transport Team';
const DEFAULT_ROBOTS = 'index, follow';

export function Seo({
  title,
  description,
  canonicalPath,
  author,
  robots,
  noIndex = false,
  keywords,
  contentLanguage,
  ogTitle,
  ogDescription,
  ogType = 'website',
  ogImage = defaultOgImage,
  openGraph = true,
  includeFavicon = true,
  twitterCard = 'summary_large_image',
  twitterTitle,
  twitterDescription,
  jsonLd,
}: SeoProps) {
  const canonical = absoluteUrl(canonicalPath);
  const robotsContent = noIndex ? 'noindex, follow' : robots ?? DEFAULT_ROBOTS;
  const resolvedOgTitle = ogTitle ?? title;
  const resolvedOgDescription = ogDescription ?? description;
  const resolvedTwitterTitle = twitterTitle ?? resolvedOgTitle;
  const resolvedTwitterDescription = twitterDescription ?? resolvedOgDescription;

  const jsonLdString =
    jsonLd === undefined
      ? undefined
      : typeof jsonLd === 'string'
        ? jsonLd
        : JSON.stringify(jsonLd);

  const authorContent =
    author === false ? null : (author ?? DEFAULT_AUTHOR);

  // Avoid React.Fragment inside <Helmet>: react-helmet v6 stringifies children and
  // crashes on React 19 Fragment symbols ("Cannot convert a Symbol value to a string").
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robotsContent} />
      {authorContent ? (
        <meta name="author" content={authorContent} />
      ) : null}
      {keywords ? <meta name="keywords" content={keywords} /> : null}
      {contentLanguage ? (
        <meta httpEquiv="Content-Language" content={contentLanguage} />
      ) : null}
      <link rel="canonical" href={canonical} />
      {openGraph ? (
        <meta property="og:title" content={resolvedOgTitle} />
      ) : null}
      {openGraph ? (
        <meta property="og:description" content={resolvedOgDescription} />
      ) : null}
      {openGraph ? <meta property="og:type" content={ogType} /> : null}
      {openGraph ? <meta property="og:url" content={canonical} /> : null}
      {openGraph ? <meta property="og:image" content={ogImage} /> : null}
      {openGraph ? (
        <meta name="twitter:card" content={twitterCard} />
      ) : null}
      {openGraph ? (
        <meta name="twitter:title" content={resolvedTwitterTitle} />
      ) : null}
      {openGraph ? (
        <meta name="twitter:description" content={resolvedTwitterDescription} />
      ) : null}
      {openGraph && includeFavicon ? (
        <link rel="icon" type="image/svg+xml" href={defaultFaviconHref} />
      ) : null}
      {jsonLdString ? (
        <script type="application/ld+json">{jsonLdString}</script>
      ) : null}
    </Helmet>
  );
}

export default Seo;
