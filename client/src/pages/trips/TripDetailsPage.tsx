import Button from '@/components/inputs/Button';
import { Heading } from '@/components/inputs/TextInputs';
import MapView from '@/components/maps/MapView';
import Table from '@/components/table/Table';
import { UserTripStatus } from '@/constants/userTrip.constants';
import AppLayout from '@/containers/navigation/AppLayout';
import { useAppDispatch, useAppSelector } from '@/states/hooks';
import { setCurrentUserTrip } from '@/states/slices/userTripSlice';
import { UserTrip } from '@/types/userTrip.type';
import { useBrowseLocations } from '@/usecases/locations/location.hooks';
import {
  useGetTripById,
  useGetTripLocations,
} from '@/usecases/trips/trip.hooks';
import { useUserTripColumns } from '@/usecases/user-trip/columns.userTrip';
import {
  useCreateUserTrip,
  useFetchUserTrips,
  useUpdateUserTrip,
} from '@/usecases/user-trip/userTrip.hooks';
import { faFileLines } from '@fortawesome/free-regular-svg-icons';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const TripDetailsPage = () => {
  /**
   * STATE VARIABLES
   */
  const dispatch = useAppDispatch();
  const { trip } = useAppSelector((state) => state.trip);
  const { userTripsList, currentUserTrip } = useAppSelector(
    (state) => state.userTrip
  );
  const { user } = useAppSelector((state) => state.auth);

  /**
   * NAVIGATION
   */
  const navigate = useNavigate();

  /**
   * NAVIGATION
   */
  const { id } = useParams();

  /**
   * BROWSE LOCATIONS
   */
  const { browserLocation, browserLocationIsLoading } = useBrowseLocations();

  /**
   * TRIP HOOKS
   */

  // GET TRIP BY ID
  const { getTripById } = useGetTripById();

  // GET TRIP LOCATIONS
  const { origin, destination, defaultCenter } = useGetTripLocations({
    trip,
  });

  /**
   * USER TRIP HOOKS
   */

  // FETCH USER TRIPS
  const {
    fetchUserTrips,
    userTripsIsFetching,
    page,
    size,
    totalCount,
    totalPages,
    setPage,
    setSize,
  } = useFetchUserTrips();

  // CREATE USER TRIP
  const {
    createUserTrip,
    createUserTripIsLoading,
    createUserTripIsSuccess,
    createUserTripData,
  } = useCreateUserTrip();

  // UPDATE USER TRIP
  const { updateUserTrip, updateUserTripIsLoading, updateUserTripIsSuccess } =
    useUpdateUserTrip();

  useEffect(() => {
    if (createUserTripIsSuccess) {
      dispatch(setCurrentUserTrip(createUserTripData?.data));
    }
  }, [createUserTripData?.data, createUserTripIsSuccess, dispatch]);

  // USER TRIP COLUMNS
  const { userTripColumns } = useUserTripColumns({
    page,
    size,
  });

  useEffect(() => {
    let userTrip: UserTrip | undefined = undefined;

    if (userTripsList?.length > 0) {
      userTrip = userTripsList?.find(
        (userTrip) =>
          userTrip?.userId === user?.id &&
          userTrip?.status === UserTripStatus.IN_PROGRESS
      );
    }

    if (userTrip) {
      dispatch(setCurrentUserTrip(userTrip));
    } else {
      dispatch(setCurrentUserTrip(undefined));
    }
  }, [userTripsList, user?.id, dispatch]);

  // FETCH USER TRIPS
  useEffect(() => {
    if (trip?.id) {
      fetchUserTrips({
        page,
        size,
        tripId: trip?.id,
        status: UserTripStatus.IN_PROGRESS,
      });
    }
  }, [fetchUserTrips, trip?.id, page, size, updateUserTripIsSuccess]);

  // EFFECTS
  useEffect(() => {
    if (id) getTripById(id);
  }, [getTripById, id, updateUserTripIsSuccess]);

  return (
    <AppLayout>
      <main className="w-full flex flex-col gap-4">
        <nav className="w-full flex flex-col gap-4">
          <ul className="w-full flex items-center gap-3 justify-between">
            <Heading>#{trip?.referenceId}</Heading>
            <Button
              primary={!currentUserTrip}
              danger={!!currentUserTrip}
              onClick={(e) => {
                e.preventDefault();
                if (currentUserTrip && browserLocation) {
                  updateUserTrip({
                    id: currentUserTrip?.id,
                    userTrip: {
                      status: UserTripStatus.COMPLETED,
                      exitLocation: {
                        type: 'Point',
                        coordinates: [browserLocation.lat, browserLocation.lng],
                      },
                    },
                  });
                } else if (trip?.id && user?.id && browserLocation) {
                  createUserTrip({
                    tripId: trip?.id,
                    userId: user?.id,
                    entranceLocation: {
                      type: 'Point',
                      coordinates: [browserLocation.lat, browserLocation.lng],
                    },
                  });
                }
              }}
              disabled={
                createUserTripIsLoading ||
                updateUserTripIsLoading ||
                browserLocationIsLoading
              }
              isLoading={createUserTripIsLoading || updateUserTripIsLoading}
            >
              {currentUserTrip ? 'Exit Trip' : 'Join Trip'}
            </Button>
          </ul>
        </nav>
        <section className="w-full flex flex-col gap-4">
          <Heading type="h2">Map</Heading>
          <MapView
            origin={origin}
            destination={destination}
            defaultCenter={defaultCenter}
            fromLabel="Current Bus Location"
            toLabel="Your Location"
          />
        </section>
        <section className="w-full flex flex-col gap-4 mt-6">
          <ul className="w-full flex items-center gap-3 justify-between">
            <Heading type="h2">Passengers</Heading>
            <Button icon={faFileLines} route={`/trips/${trip?.id}/passengers`}>
              View all
            </Button>
          </ul>
          <Table
            columns={userTripColumns}
            data={userTripsList}
            isLoading={userTripsIsFetching}
            totalCount={totalCount}
            totalPages={totalPages}
            page={page}
            size={size}
            setPage={setPage}
            setSize={setSize}
          />
        </section>
        <menu className="w-full flex items-center gap-3 justify-between">
          <Button
            onClick={(e) => {
              e.preventDefault();
              navigate(-1);
            }}
          >
            Back
          </Button>
        </menu>
      </main>
    </AppLayout>
  );
};

export default TripDetailsPage;
