import PublicContentPage from './PublicContentPage';

const PrivacyPolicyPage = () => (
  <PublicContentPage
    title="Privacy policy"
    description="How Basis Transport collects, uses, and protects your personal information."
    canonicalPath="/privacy"
    eyebrow="Legal"
  >
    <p>Last updated: August 2026</p>

    <h2>What we collect</h2>
    <p>
      Account and support information is stored when you submit it. Journey searches
      are processed to calculate directions, not saved as passenger history.
      Favorites stay on your device unless you explicitly synchronize them.
    </p>
    <p>
      Location is requested only when you choose Use my location. Google processes
      place searches and coordinates needed for maps and walking directions.
      Shared links can contain precise coordinates. Technical metrics record
      counts and durations, not journey endpoints.
    </p>

    <h2>How we use it</h2>
    <ul>
      <li>Provide route, stop, and walking guidance</li>
      <li>Authenticate your account and send service notifications</li>
      <li>Improve reliability, safety, and product performance</li>
      <li>Respond to support requests</li>
    </ul>

    <h2>Sharing</h2>
    <p>
      We do not sell your personal data. We share information only with service
      providers who help us operate Basis Transport (hosting, maps, email, and SMS),
      and when required by law.
    </p>

    <h2>Your choices</h2>
    <p>Google Maps features also process information under <a href="https://policies.google.com/privacy" className="landing-link-sweep">Google’s Privacy Policy</a>.</p>
    <p>
      You can update profile details in the app, remove saved items, and request deletion of your account by contacting support.
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
