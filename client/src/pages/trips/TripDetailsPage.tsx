import Button from '@/components/inputs/Button';
import { Heading } from '@/components/inputs/TextInputs';
import MapView from '@/components/maps/MapView';
import AppLayout from '@/containers/navigation/AppLayout';
import { useAppSelector } from '@/states/hooks';
import {
  useGetTripById,
  useGetTripLocations,
} from '@/usecases/trips/trip.hooks';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const TripDetailsPage = () => {
  /**
   * STATE VARIABLES
   */
  const { trip } = useAppSelector((state) => state.trip);

  /**
   * NAVIGATION
   */
  const navigate = useNavigate();

  /**
   * NAVIGATION
   */
  const { id } = useParams();

  // GET TRIP BY ID
  const { getTripById } = useGetTripById();

  // GET TRIP LOCATIONS
  const { origin, destination, defaultCenter } = useGetTripLocations({
    trip,
  });

  // EFFECTS
  useEffect(() => {
    if (id) getTripById(id);
  }, [getTripById, id]);

  return (
    <AppLayout>
      <main className="w-full flex flex-col gap-4">
        <nav className="w-full flex flex-col gap-4">
          <Heading>#{trip?.referenceId}</Heading>
        </nav>
        <section className="w-full flex flex-col gap-4">
          <MapView
            origin={origin}
            destination={destination}
            defaultCenter={defaultCenter}
            fromLabel="Current Bus Location"
            toLabel="Your Location"
          />
        </section>
        <menu className="w-full flex items-center gap-3 justify-between">
          <Button
            onClick={(e) => {
              e.preventDefault();
              navigate(-1);
            }}
            variant="outline"
          >
            Back
          </Button>
        </menu>
      </main>
    </AppLayout>
  );
};

export default TripDetailsPage;
