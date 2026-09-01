import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { useEffect, useState, type ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronLeft,
  faChevronRight,
  faClock,
  faRoute,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';

/**
 * The overlay that sits on the map. It reads the same as every other floating
 * panel in the app: the shared card edge, the menu shadow, and the popover rung
 * of the z-ladder — not the `shadow-xl rounded-xl backdrop-blur z-[1000]` it
 * used to carry, which was four decisions this design system had already made.
 */
const panelClasses = [
  'card-framed absolute right-2 top-2 z-(--z-popover) flex w-[96vw] max-w-md',
  'flex-col gap-3 p-3 shadow-(--shadow-menu) sm:p-4 md:w-[32vw]',
].join(' ');

/**
 * Origin and destination drawn as what they are: two stops on a line. It is
 * the page header's route rail at panel scale, so the map overlay belongs to
 * the same drawing as the rest of the app.
 */
const Endpoints = ({
  fromLabel,
  toLabel,
  fromDetail,
  toDetail,
}: {
  fromLabel?: string;
  toLabel?: string;
  fromDetail?: ReactNode;
  toDetail?: ReactNode;
}) => (
  <ol className="card-quiet flex flex-col gap-3 p-3">
    {[
      { mark: 'A', label: fromLabel, detail: fromDetail, filled: true },
      { mark: 'B', label: toLabel, detail: toDetail, filled: false },
    ].map(({ mark, label, detail, filled }, index) => (
      <li key={mark} className="relative flex items-start gap-3">
        {index === 0 ? (
          <span
            className="absolute left-[5px] top-4 h-[calc(100%+0.35rem)] w-0.5 rounded-(--radius-pill) bg-(--accent-line)"
            aria-hidden="true"
          />
        ) : null}
        <span
          className={`relative mt-1 size-3 shrink-0 rounded-(--radius-pill) border-2 border-(--accent-ink) ${
            filled ? 'bg-(--accent-ink)' : 'bg-(--paper)'
          }`}
          aria-hidden="true"
        />
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="sr-only">{mark}:</span>
          <span className="type-body-sm font-medium text-(--ink)">{label}</span>
          {detail ? <span className="type-meta">{detail}</span> : null}
        </span>
      </li>
    ))}
  </ol>
);

const MapDirections = ({
  origin,
  destination,
  fromLabel,
  toLabel,
}: {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  fromLabel?: string;
  toLabel?: string;
}) => {
  /**
   * STATE VARIABLES
   */
  const [directionService, setDirectionService] =
    useState<google.maps.DirectionsService>();
  const [directionsRenderer, setDirectionsRenderer] =
    useState<google.maps.DirectionsRenderer>();
  const [routes, setRoutes] = useState<google.maps.DirectionsRoute[]>([]);
  const [routeIndex, setRouteIndex] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const selectedRoute = routes?.[routeIndex];
  const leg = selectedRoute?.legs?.[0];

  /**
   * MAPS HOOKS
   */
  const map = useMap();
  const routesLibrary = useMapsLibrary('routes');

  // SETUP
  useEffect(() => {
    if (!routesLibrary || !map) return;
    setDirectionService(new routesLibrary.DirectionsService());
    setDirectionsRenderer(new routesLibrary.DirectionsRenderer({ map }));
  }, [map, routesLibrary]);

  // DIRECTIONS
  useEffect(() => {
    if (!directionService || !directionsRenderer) return;
    
    setError(null); // Reset error state before new request
    
    directionService
      .route({
        origin,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: true,
      })
      .then((response) => {
        directionsRenderer.setDirections(response);
        setRoutes(response.routes);
      })
      .catch((error) => {
        console.error(error);
        if (error.code === 'ZERO_RESULTS') {
          setError('No driving route found between these points. Showing locations as markers instead.');
        } else {
          setError('Unable to calculate route. Showing locations as markers instead.');
        }
        // Clear the directions renderer when there's an error
        directionsRenderer.setMap(null);
      });
  }, [destination, directionService, directionsRenderer, origin]);

  const hasAlternatives = routes.length > 1;

  const handlePrev = () => {
    setRouteIndex((prev) => (prev - 1 + routes.length) % routes.length);
  };
  const handleNext = () => {
    setRouteIndex((prev) => (prev + 1) % routes.length);
  };

  useEffect(() => {
    if (directionsRenderer && routes[routeIndex]) {
      directionsRenderer.setDirections({
        geocoded_waypoints: [],
        routes: [routes[routeIndex]],
        request: {
          origin,
          destination,
          travelMode: google.maps.TravelMode.DRIVING,
        },
      });
    }
  }, [routeIndex, routes, directionsRenderer, origin, destination]);

  if (error) {
    return (
      <aside className={panelClasses} aria-label="Route information">
        <header className="flex flex-col gap-2">
          <h2 className="type-card-title">Where you are going</h2>
          <Endpoints
            fromLabel={fromLabel}
            toLabel={toLabel}
            fromDetail={`${origin.lat}, ${origin.lng}`}
            toDetail={`${destination.lat}, ${destination.lng}`}
          />
        </header>
        <p
          role="alert"
          className="flex items-start gap-2 rounded-(--radius-control) border border-(--warning-line) bg-(--warning-surface) p-3 text-[0.8125rem] leading-[1.5] text-(--warning)"
        >
          <FontAwesomeIcon
            icon={faTriangleExclamation}
            className="mt-[0.2em] size-3.5 shrink-0"
            aria-hidden="true"
          />
          {error}
        </p>
      </aside>
    );
  }

  if (!leg) return null;

  return (
    <aside className={panelClasses} aria-label="Route information">
      <header className="flex flex-col gap-2">
        <h2 className="type-card-title">Route overview</h2>
        <Endpoints
          fromLabel={fromLabel}
          toLabel={toLabel}
          fromDetail={leg.start_address?.split(',')?.slice(1)?.join(', ')}
          toDetail={leg.end_address?.split(',')?.slice(1)?.join(', ')}
        />
      </header>

      <dl className="card-quiet flex items-center justify-between gap-3 p-3">
        <div className="flex items-center gap-2">
          <dt className="flex items-center gap-2 text-(--muted)">
            <FontAwesomeIcon icon={faRoute} className="size-3.5" aria-hidden="true" />
            <span className="sr-only">Distance</span>
          </dt>
          <dd className="tabular text-sm font-medium text-(--ink)">
            {leg.distance?.text}
          </dd>
        </div>
        <div className="flex items-center gap-2">
          <dt className="flex items-center gap-2 text-(--muted)">
            <FontAwesomeIcon icon={faClock} className="size-3.5" aria-hidden="true" />
            <span className="sr-only">Travel time</span>
          </dt>
          <dd className="tabular text-sm font-medium text-(--ink)">
            {leg.duration?.text}
          </dd>
        </div>
      </dl>

      {hasAlternatives && (
        <nav
          className="card-quiet flex items-center justify-between gap-2 p-1.5"
          aria-label="Other routes"
        >
          <button
            type="button"
            onClick={handlePrev}
            className="flex size-8 items-center justify-center rounded-(--radius-control) text-(--ink) transition-colors duration-200 ease-(--ease-flat) hover:bg-(--surface-hover) focus-visible:outline-none focus-visible:shadow-[var(--surface)_0_0_0_2px_inset,var(--ink)_0_0_0_2px]"
            aria-label="Previous route"
          >
            <FontAwesomeIcon icon={faChevronLeft} className="size-3.5" />
          </button>
          <span className="tabular type-body-sm text-(--muted)" aria-live="polite">
            Route {routeIndex + 1} of {routes.length}
          </span>
          <button
            type="button"
            onClick={handleNext}
            className="flex size-8 items-center justify-center rounded-(--radius-control) text-(--ink) transition-colors duration-200 ease-(--ease-flat) hover:bg-(--surface-hover) focus-visible:outline-none focus-visible:shadow-[var(--surface)_0_0_0_2px_inset,var(--ink)_0_0_0_2px]"
            aria-label="Next route"
          >
            <FontAwesomeIcon icon={faChevronRight} className="size-3.5" />
          </button>
        </nav>
      )}
    </aside>
  );
};

export default MapDirections;
