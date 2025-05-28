import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { useEffect, useState } from 'react';
import { Heading } from '../inputs/TextInputs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronCircleLeft,
  faChevronCircleRight,
} from '@fortawesome/free-solid-svg-icons';

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

  if (!leg) return null;

  return (
    <aside
      className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm shadow-xl rounded-xl p-2 sm:p-4 w-[96vw] max-w-md md:w-[32vw] flex flex-col gap-3 z-[1000] border border-gray-100"
      aria-label="Route information"
    >
      <header className="space-y-2">
        <Heading className="text-xl font-semibold text-gray-800">Route Overview</Heading>
        <section className="bg-gray-50 rounded-lg p-2 sm:p-3 space-y-2">
          <article className="flex items-start gap-2">
            <span className="font-bold text-primary">A</span>
            <section className="text-gray-600 text-sm">
              <p className="font-medium">{fromLabel}</p>
              <p className="text-gray-500">{leg.start_address?.split(',')?.slice(1)?.join(', ')}</p>
            </section>
          </article>
          <article className="flex items-start gap-2">
            <span className="font-bold text-primary">B</span>
            <section className="text-gray-600 text-sm">
              <p className="font-medium">{toLabel}</p>
              <p className="text-gray-500">{leg.end_address?.split(',')?.slice(1)?.join(', ')}</p>
            </section>
          </article>
        </section>
      </header>
      <section className="flex items-center justify-between bg-primary/5 rounded-lg p-2 sm:p-3">
        <article className="flex items-center gap-2">
          <span className="text-primary">🛣️</span>
          <span className="font-medium text-gray-700">{leg.distance?.text}</span>
        </article>
        <article className="flex items-center gap-2">
          <span className="text-primary">⏱️</span>
          <span className="font-medium text-gray-700">{leg.duration?.text}</span>
        </article>
      </section>
      {hasAlternatives && (
        <section className="w-full space-y-2">
          <header>
            <Heading type="h3" className="text-center text-gray-700 font-medium">
              Possible Routes
            </Heading>
          </header>
          <nav className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
            <button 
              onClick={handlePrev}
              className="p-[2px] hover:bg-gray-100 cursor-pointer rounded-full transition-colors"
              aria-label="Previous route"
            >
              <FontAwesomeIcon
                icon={faChevronCircleLeft}
                className="text-primary text-xl"
              />
            </button>
            <span className="text-gray-600 text-sm font-medium">
              Route {routeIndex + 1} of {routes.length}
            </span>
            <button 
              onClick={handleNext}
              className="p-[2px] hover:bg-gray-100 cursor-pointer rounded-full transition-colors"
              aria-label="Next route"
            >
              <FontAwesomeIcon
                icon={faChevronCircleRight}
                className="text-primary text-xl"
              />
            </button>
          </nav>
        </section>
      )}
    </aside>
  );
};

export default MapDirections;
