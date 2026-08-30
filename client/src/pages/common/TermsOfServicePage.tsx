import PublicContentPage from './PublicContentPage';

const TermsOfServicePage = () => (
  <PublicContentPage
    title="Terms of service"
    description="The rules for using Basis Transport as a commuter or operator."
    canonicalPath="/terms"
    eyebrow="Legal"
  >
    <p>Last updated: March 2026</p>

    <h2>Using the service</h2>
    <p>
      Basis Transport provides public transport information including schedules,
      capacity, and travel guidance. You agree to use the app lawfully and not
      misuse, reverse engineer, or disrupt the platform.
    </p>

    <h2>Accounts</h2>
    <p>
      You are responsible for activity on your account and for keeping your
      login credentials secure. Provide accurate contact details so we can reach
      you about your trips.
    </p>

    <h2>Information accuracy</h2>
    <p>
      We work to keep arrivals and capacity current, but real-world conditions
      can change quickly. Use Basis Transport as a planning aid — not as the
      sole basis for safety-critical decisions.
    </p>

    <h2>Availability</h2>
    <p>
      We may update, suspend, or discontinue features with reasonable notice
      where possible. The service is provided on an as-available basis.
    </p>

    <h2>Liability</h2>
    <p>
      To the extent permitted by law, Basis Transport is not liable for indirect
      or consequential losses arising from delays, outages, or third-party
      transport services.
    </p>

    <h2>Contact</h2>
    <p>
      Terms questions:{' '}
      <a href="mailto:legal@basistransport.rw" className="landing-link-sweep">
        legal@basistransport.rw
      </a>
    </p>
  </PublicContentPage>
);

export default TermsOfServicePage;
