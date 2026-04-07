import { publicColors as Colors } from '@/containers/public/publicTheme';
import { useFetchNearbyTrips } from '@/usecases/trips/trip.hooks';
import { ComponentProps } from 'react';
import NearbyTripCard from './NearbyTripCard';

const LandingNearbyTripsSection = () => {
  const { nearbyTrips, isLoading, browserLocation, locationSource } = useFetchNearbyTrips();

  const fallbackCoordinates: [number, number] =
    browserLocation.lat && browserLocation.lng
      ? [browserLocation.lat, browserLocation.lng]
      : [0, 0];

  return (
    <section className="py-24" style={{ backgroundColor: Colors.bgAlt }}>
      <article className="max-w-4xl mx-auto px-6 lg:px-8">
        <header className="mb-8 animate-on-scroll">
          <p className="text-[13px] font-medium mb-2" style={{ color: Colors.primary }}>
            Nearby active trips
          </p>
          <h2 className="text-4xl lg:text-5xl leading-tight font-light mb-3" style={{ color: Colors.primary }}>
            Join the closest ride now
          </h2>
          <p className="text-[13px]" style={{ color: Colors.neutralLight }}>
            Live list of pending and in-progress trips near your current location.
          </p>
        </header>

        {locationSource === 'ip' && (
          <p className="mb-6 text-[12px] text-amber-700">
            We are using approximate IP location. Enable browser location for better nearby results.
          </p>
        )}

        {isLoading ? (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <li key={index} className="h-40 rounded-md bg-white/70 animate-pulse" />
            ))}
          </ul>
        ) : nearbyTrips?.length ? (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nearbyTrips.map((trip: NearbyTripCardProps['trip']) => (
              <NearbyTripCard
                key={trip.id}
                trip={trip}
                fallbackEntranceLocation={fallbackCoordinates}
              />
            ))}
          </ul>
        ) : (
          <p className="text-[12px]" style={{ color: Colors.neutralLight }}>
            No nearby active trips found yet. Check back in a moment.
          </p>
        )}
      </article>
    </section>
  );
};

type NearbyTripCardProps = ComponentProps<typeof NearbyTripCard>;

export default LandingNearbyTripsSection;
