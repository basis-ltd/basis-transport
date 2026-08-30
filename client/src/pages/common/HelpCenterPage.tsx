import { Link } from 'react-router-dom';
import PublicContentPage from './PublicContentPage';

const helpTopics = [
  {
    title: 'Plan a trip',
    body: 'Enter your current location and destination on the home page, then review schedules and seat availability on the travel options screen.',
  },
  {
    title: 'Create an account',
    body: 'Sign up with your phone number to save routes, receive alerts, and track live trip status.',
  },
  {
    title: 'Reset your password',
    body: 'Use Forgot password on the sign-in page. You can reset via email or SMS verification.',
  },
  {
    title: 'Report an issue',
    body: 'If data looks wrong or a feature fails, contact us with the route, time, and what you expected to see.',
  },
];

const HelpCenterPage = () => (
  <PublicContentPage
    title="Help center"
    description="Quick answers for getting started with Basis Transport."
    canonicalPath="/help"
    eyebrow="Support"
  >
    <ul className="!list-none !ps-0 space-y-4">
      {helpTopics.map((topic) => (
        <li
          key={topic.title}
          className="rounded-[var(--landing-radius)] border border-[var(--landing-line)] bg-[var(--landing-surface)] p-5"
        >
          <h2 className="!mt-0">{topic.title}</h2>
          <p>{topic.body}</p>
        </li>
      ))}
    </ul>

    <p className="landing-meta">
      Still stuck?{' '}
      <Link to="/contact" className="landing-link-sweep">
        Contact us
      </Link>
      .
    </p>
  </PublicContentPage>
);

export default HelpCenterPage;
