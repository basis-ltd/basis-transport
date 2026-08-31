import { Component, useEffect, useState, type ReactNode } from "react";
import {
  APIProvider,
  APILoadingStatus,
  useApiLoadingStatus,
} from "@vis.gl/react-google-maps";
import { environment } from "@/constants/environment.constants";

class MapErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  override state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  override render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function ReadyMap({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback: ReactNode;
}) {
  const status = useApiLoadingStatus();
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    if (status === APILoadingStatus.LOADED) return;
    const timer = setTimeout(() => setTimedOut(true), 12000);
    return () => clearTimeout(timer);
  }, [status]);
  if (
    status === APILoadingStatus.FAILED ||
    status === APILoadingStatus.AUTH_FAILURE ||
    timedOut
  )
    return fallback;
  return status === APILoadingStatus.LOADED ? (
    children
  ) : (
    <p className="journey-map-unavailable" role="status">
      Loading Google Maps…
    </p>
  );
}

/** Shared map loader; no precise URLs in provider referrers. */
export default function GoogleMapFrame({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback: ReactNode;
}) {
  if (!environment.googleMapsApiKey) return fallback;
  return (
    <MapErrorBoundary fallback={fallback}>
      <APIProvider
        apiKey={environment.googleMapsApiKey}
        authReferrerPolicy="origin"
      >
        <ReadyMap fallback={fallback}>{children}</ReadyMap>
      </APIProvider>
    </MapErrorBoundary>
  );
}
