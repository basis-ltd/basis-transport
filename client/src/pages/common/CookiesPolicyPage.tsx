import PublicContentPage from './PublicContentPage';

const CookiesPolicyPage = () => (
  <PublicContentPage
    title="Cookies policy"
    description="How Basis Transport uses cookies and similar technologies on the web app."
    canonicalPath="/cookies"
    eyebrow="Legal"
  >
    <p>Last updated: August 2026</p>

    <h2>What cookies are</h2>
    <p>
      Cookies are small text files stored on your device. The application also uses browser storage for authentication, appearance,
      and favorites that you explicitly save.
    </p>

    <h2>Types we use</h2>
    <ul>
      <li>
        <strong>Essential</strong> — required for authentication, security, and
        core app functionality.
      </li>
      <li>
        <strong>Functional</strong> — remember appearance and explicitly saved favorites. Searches are not saved automatically.
      </li>
      <li>
        <strong>Service metrics</strong> — server-side counts and timings do not require
        a journey-history cookie. Google Maps may use its own storage under its policies.
      </li>
    </ul>

    <h2>Your choices</h2>
    <p>
      You can block or delete cookies in your browser settings. Disabling
      essential cookies may prevent parts of Basis Transport from working,
      including sign-in.
    </p>

    <h2>Updates</h2>
    <p>
      We may update this policy when our practices change. Continued use after an
      update means you accept the revised policy.
    </p>
  </PublicContentPage>
);

export default CookiesPolicyPage;
