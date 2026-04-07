import Button from "@/components/inputs/Button";
import { Heading } from "@/components/inputs/TextInputs";
import Table from "@/components/table/Table";
import { UserTripStatus } from "@/constants/userTrip.constants";
import AppLayout from "@/containers/navigation/AppLayout";
import TripMap from "@/containers/trips/TripMap";
import { useAppDispatch, useAppSelector } from "@/states/hooks";
import { setCurrentUserTrip } from "@/states/slices/userTripSlice";
import { UserTrip } from "@/types/userTrip.type";
import { useBrowseLocations } from "@/usecases/locations/location.hooks";
import {
  useCancelTrip,
  useCompleteTrip,
  useCountAvailableCapacity,
  useGetTripById,
  useStartTrip,
} from "@/usecases/trips/trip.hooks";
import { useUserTripColumns } from "@/usecases/user-trip/columns.userTrip";
import {
  useCreateUserTrip,
  useFetchUserTrips,
  useUpdateUserTrip,
} from "@/usecases/user-trip/userTrip.hooks";
import { faFileLines } from "@fortawesome/free-regular-svg-icons";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import moment from "moment";
import Loader from "@/components/inputs/Loader";
import { TripStatus } from "@/constants/trip.constants";
import { capitalizeString } from "@/helpers/strings.helper";

const TRIP_OPERATOR_ROLES = ["DRIVER", "ADMIN", "SUPER_ADMIN"];

const TripDetailsPage = () => {
  /**
   * STATE VARIABLES
   */
  const dispatch = useAppDispatch();
  const { trip } = useAppSelector((state) => state.trip);
  const { userTripsList, currentUserTrip } = useAppSelector(
    (state) => state.userTrip,
  );
  const { user } = useAppSelector((state) => state.auth);

  const canOperateTrip = user?.userRoles?.some((role) =>
    TRIP_OPERATOR_ROLES.includes(role.role?.name ?? ""),
  );
  const showStartTrip =
    Boolean(canOperateTrip) && trip?.status === TripStatus.PENDING;
  const showCompleteTrip =
    Boolean(canOperateTrip) && trip?.status === TripStatus.IN_PROGRESS;
  const showCancelTrip =
    Boolean(canOperateTrip) && [TripStatus.PENDING, TripStatus.IN_PROGRESS].includes(trip?.status as TripStatus);

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

  // START TRIP
  const { startTrip, isLoading, reset, isSuccess } = useStartTrip();

  useEffect(() => {
    if (isSuccess) {
      getTripById(trip?.id);
      reset();
    }
  }, [isSuccess, navigate, trip?.id, reset, getTripById]);

  // COMPLETE TRIP
  const { completeTrip, completeTripIsLoading } = useCompleteTrip();

  // CANCEL TRIP
  const { cancelTrip, cancelTripIsLoading } = useCancelTrip();

  // COUNT AVAILABLE CAPACITY
  const {
    countAvailableCapacity,
    tripAvailableCapacityIsFetching,
    availableCapacity,
  } = useCountAvailableCapacity();

  useEffect(() => {
    if (trip?.id) {
      countAvailableCapacity({ id: trip?.id });
    }
  }, [trip?.id, countAvailableCapacity]);

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
          userTrip?.status === UserTripStatus.IN_PROGRESS,
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
    let status: UserTripStatus = UserTripStatus.IN_PROGRESS;
    if (trip?.status === TripStatus.IN_PROGRESS) {
      status = UserTripStatus.IN_PROGRESS;
    } else if (trip?.status === TripStatus.COMPLETED) {
      status = UserTripStatus.COMPLETED;
    }
    if (trip?.id) {
      fetchUserTrips({
        page,
        size,
        tripId: trip?.id,
        status,
      });
    }
  }, [
    fetchUserTrips,
    trip?.id,
    page,
    size,
    updateUserTripIsSuccess,
    trip?.status,
  ]);

  // EFFECTS
  useEffect(() => {
    if (id) getTripById(id);
  }, [getTripById, id, updateUserTripIsSuccess]);

  // Helper function to get status color
  const getStatusColor = (status: TripStatus) => {
    switch (status) {
      case TripStatus.IN_PROGRESS:
        return "text-primary bg-primary/10";
      case TripStatus.COMPLETED:
        return "text-green-700 bg-green-700/10";
      case TripStatus.CANCELLED:
        return "text-destructive bg-destructive/10";
      default:
        return "text-secondary bg-background-secondary/60";
    }
  };

  return (
    <AppLayout>
      <main className="w-full flex flex-col gap-4">
        <nav className="w-full flex flex-col gap-4">
          <menu className="w-full flex flex-wrap items-start gap-3 justify-between">
            <Heading>#{trip?.referenceId}</Heading>

            <ul className="flex flex-col gap-1">
              {/* JOIN/EXIT TRIP */}
              {user?.userRoles?.flatMap(
                (role) =>
                  ["USER"].includes(role.role?.name ?? "") && (
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
                                type: "Point",
                                coordinates: [
                                  browserLocation.lat,
                                  browserLocation.lng,
                                ],
                              },
                              endTime: new Date().toISOString(),
                            },
                          });
                        } else if (trip?.id && user?.id && browserLocation) {
                          createUserTrip({
                            tripId: trip?.id,
                            userId: user?.id,
                            entranceLocation: {
                              type: "Point",
                              coordinates: [
                                browserLocation.lat,
                                browserLocation.lng,
                              ],
                            },
                          });
                        }
                      }}
                      disabled={
                        createUserTripIsLoading ||
                        updateUserTripIsLoading ||
                        browserLocationIsLoading
                      }
                      isLoading={
                        createUserTripIsLoading || updateUserTripIsLoading
                      }
                    >
                      {currentUserTrip ? "Exit Trip" : "Join Trip"}
                    </Button>
                  ),
              )}

              {/* START/END/CANCEL TRIP */}
              {showStartTrip && (
                <Button
                  primary
                  onClick={(e) => {
                    e.preventDefault();
                    if (trip?.id) {
                      startTrip(trip?.id);
                    }
                  }}
                  isLoading={isLoading}
                >
                  Start Trip
                </Button>
              )}
              {showCompleteTrip && (
                <Button
                  primary
                  onClick={(e) => {
                    e.preventDefault();
                    if (trip?.id) {
                      completeTrip(trip?.id);
                    }
                  }}
                  isLoading={completeTripIsLoading}
                >
                  Complete Trip
                </Button>
              )}
              {showCancelTrip && (
                <Button
                  danger
                  onClick={(e) => {
                    e.preventDefault();
                    if (trip?.id) {
                      cancelTrip(trip?.id);
                    }
                  }}
                  isLoading={cancelTripIsLoading}
                >
                  Cancel Trip
                </Button>
              )}
            </ul>
          </menu>
        </nav>
        <section className="w-full flex flex-col gap-4">
          <Heading type="h2">Trip Details</Heading>
          <article className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Trip Status */}
            <article className="bg-white rounded-2xl shadow-sm border border-primary/10 p-5">
              <h3 className="text-sm font-light text-secondary/70 mb-2">
                Trip Status
              </h3>
              <p
                className={`${getStatusColor(
                  trip?.status as TripStatus,
                )} inline-block px-4 py-1 rounded-full text-sm font-light`}
              >
                {capitalizeString(trip?.status) || "N/A"}
              </p>
            </article>

            {/* Trip Times */}
            <article className="bg-white rounded-2xl shadow-sm border border-primary/10 p-5">
              <h3 className="text-sm font-light text-secondary/70 mb-2">
                Trip Times
              </h3>
              <section className="space-y-1">
                <ul className="w-full flex items-center gap-2 justify-between py-2">
                  <p className="text-sm font-light text-secondary/80">
                    Start:{" "}
                    {trip?.startTime
                      ? moment(new Date(trip.startTime)).format("HH:mm")
                      : "Not started"}
                  </p>
                  <p className="text-sm font-light text-secondary/80">
                    End:{" "}
                    {trip?.endTime
                      ? moment(new Date(trip.endTime)).format("HH:mm")
                      : "Not completed"}
                  </p>
                </ul>
                <p className="text-sm font-light text-secondary/80 underline">
                  Duration:{" "}
                  {trip?.startTime && trip?.endTime
                    ? moment(new Date(trip.endTime)).diff(
                        moment(new Date(trip.startTime)),
                        "minutes",
                      )
                    : "N/A"}{" "}
                  minutes
                </p>
              </section>
            </article>

            {/* Trip Locations */}
            <article className="bg-white rounded-2xl shadow-sm border border-primary/10 p-5">
              <h3 className="text-sm font-light text-secondary/70 mb-2">
                Trip Locations
              </h3>
              <section className="space-y-1">
                <p className="text-sm font-light text-secondary/80">
                  From: {trip?.locationFrom?.name || "N/A"}
                </p>
                <p className="text-sm font-light text-secondary/80">
                  To: {trip?.locationTo?.name || "N/A"}
                </p>
              </section>
            </article>

            {/* Available Seats */}
            <article className="bg-white rounded-2xl shadow-sm border border-primary/10 p-5">
              <h3 className="text-sm font-light text-secondary/70 mb-2">
                Available Seats
              </h3>
              <p className="text-lg font-medium text-primary">
                {tripAvailableCapacityIsFetching ? (
                  <Loader className="text-primary" />
                ) : (
                  (availableCapacity?.availableCapacity ?? 0)
                )}
              </p>
            </article>
          </article>
        </section>
        <section className="w-full flex flex-col gap-4">
          <Heading type="h2">Map</Heading>
          <TripMap trip={trip} />
        </section>
        <section className="w-full flex flex-col gap-4 mt-6">
          <ul className="w-full flex items-center gap-3 justify-between">
            <Heading type="h2">Passengers</Heading>
            <Button icon={faFileLines} route={`/user-trips?tripId=${trip?.id}`}>
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
