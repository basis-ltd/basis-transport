import { Link } from "react-router-dom";
import JourneyShell from "@/features/journey/JourneyShell";
export default function RetiredServicePage() {
  return (
    <JourneyShell
      title="This service has been retired"
      description="Basis now helps you plan journeys through the public bus network."
      path="/travel"
    >
      <div className="journey-empty">
        <p>
          The old trip-management and card-registration tools are no longer
          available. Historical records are archived securely and are not
          exposed on this page.
        </p>
        <Link className="journey-button" to="/travel">
          Plan a journey
        </Link>
      </div>
    </JourneyShell>
  );
}
