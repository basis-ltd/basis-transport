import PublicContentPage from './PublicContentPage';

const AboutPage = () => (
  <PublicContentPage
    title="About Basis Transport"
    description="We help everyday commuters plan public transport with confidence."
    canonicalPath="/about"
    eyebrow="Company"
  >
    <p>
      Basis Transport is built for people who rely on buses every day — students,
      workers, and families who deserve clear routes, useful stop information, and
      guidance before they leave home.
    </p>
    <p>
      Our network planner helps answer practical questions: where should I board,
      which bus should I take, and where should I change? It does not provide live
      arrivals or seat availability.
    </p>
    <h2>Our promise</h2>
    <p>
      Planning, route discovery, sharing, and on-device favorites do not require
      an account. Signing in adds optional favorite synchronization. Coverage is
      published only after source rights and current service have been reviewed.
    </p>
  </PublicContentPage>
);

export default AboutPage;
