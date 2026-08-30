import PublicContentPage from './PublicContentPage';

const PrivacyPolicyPage = () => (
  <PublicContentPage
    title="Privacy policy"
    description="How Basis Transport collects, uses, and protects your personal information."
    canonicalPath="/privacy"
    eyebrow="Legal"
  >
    <p>Last updated: March 2026</p>

    <h2>What we collect</h2>
    <p>
      We collect information you provide when you create an account, plan a trip,
      or contact support — including your name, phone number, email address, and
      commute preferences.
    </p>
    <p>
      We also collect device and usage data such as approximate location (when you
      allow it), app interactions, and technical logs needed to keep the service
      reliable.
    </p>

    <h2>How we use it</h2>
    <ul>
      <li>Provide schedules, capacity, and route guidance</li>
      <li>Authenticate your account and send service notifications</li>
      <li>Improve reliability, safety, and product performance</li>
      <li>Respond to support requests</li>
    </ul>

    <h2>Sharing</h2>
    <p>
      We do not sell your personal data. We share information only with service
      providers who help us operate Basis Transport (hosting, SMS, analytics),
      and when required by law.
    </p>

    <h2>Your choices</h2>
    <p>
      You can update profile details in the app, opt out of non-essential
      notifications, and request deletion of your account by contacting support.
    </p>

    <h2>Contact</h2>
    <p>
      Privacy questions:{' '}
      <a href="mailto:privacy@basistransport.rw" className="landing-link-sweep">
        privacy@basistransport.rw
      </a>
    </p>
  </PublicContentPage>
);

export default PrivacyPolicyPage;
