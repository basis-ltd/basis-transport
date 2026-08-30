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
import useConfirm from "@/components/feedback/ConfirmDialog";
import { PageBody, PageHeader } from "@/components/layout/PageShell";

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
  const { confirm, confirmDialog } = useConfirm();

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
        return "text-(--ink) bg-(--surface)";
      case TripStatus.COMPLETED:
        return "text-(--approve) bg-green-700/10";
      case TripStatus.CANCELLED:
        return "text-(--danger) bg-destructive/10";
      default:
        return "text-(--muted) bg-(--surface)/60";
    }
  };

  /* `flatMap` over the roles rendered one button per matching role, so a user
     holding two of them saw the action twice. */
  const isRider = Boolean(
    user?.userRoles?.some((role) => ["USER"].includes(role.role?.name ?? ""))
  );

  const onToggleTripMembership = async () => {
    if (!browserLocation) return;

    const leaving = Boolean(currentUserTrip);
    const agreed = await confirm({
      title: leaving ? "Exit this trip?" : "Join this trip?",
      description: leaving
        ? "Your trip will be marked complete and your exit point recorded at your current location."
        : "You will be added to this trip and your boarding point recorded at your current location.",
      confirmLabel: leaving ? "Exit trip" : "Join trip",
      destructive: leaving,
    });

    if (!agreed) return;

    if (leaving && currentUserTrip) {
      updateUserTrip({
        id: currentUserTrip.id,
        userTrip: {
          status: UserTripStatus.COMPLETED,
          exitLocation: {
            type: "Point",
            coordinates: [browserLocation.lat, browserLocation.lng],
          },
          endTime: new Date().toISOString(),
        },
      });
      return;
    }

    if (trip?.id && user?.id) {
      createUserTrip({
        tripId: trip.id,
        userId: user.id,
        entranceLocation: {
          type: "Point",
          coordinates: [browserLocation.lat, browserLocation.lng],
        },
      });
    }
  };

  const onStartTrip = async () => {
    if (!trip?.id) return;
    const agreed = await confirm({
      title: "Start this trip?",
      description:
        "Riders will be able to join, and the trip will show as running.",
      confirmLabel: "Start trip",
    });
    if (agreed) startTrip(trip.id);
  };

  const onCompleteTrip = async () => {
    if (!trip?.id) return;
    const agreed = await confirm({
      title: "Complete this trip?",
      description:
        "The trip closes to new riders and is recorded as finished. This cannot be undone.",
      confirmLabel: "Complete trip",
    });
    if (agreed) completeTrip(trip.id);
  };

  const onCancelTrip = async () => {
    if (!trip?.id) return;
    const agreed = await confirm({
      title: "Cancel this trip?",
      description:
        "Riders will be told the service is not running. This cannot be undone.",
      confirmLabel: "Cancel trip",
      destructive: true,
    });
    if (agreed) cancelTrip(trip.id);
  };

  return (
    <AppLayout>
      <PageBody>
        <PageHeader
          title={`Trip #${trip?.referenceId ?? ''}`}
          description="Route, schedule, and who is on board."
          actions={

            <ul className="flex flex-wrap items-center gap-2">
              {/* JOIN / EXIT TRIP */}
              {isRider && (
                <Button
                  primary={!currentUserTrip}
                  onClick={(e) => {
                    e.preventDefault();
                    void onToggleTripMembership();
                  }}
                  disabled={
                    createUserTripIsLoading ||
                    updateUserTripIsLoading ||
                    browserLocationIsLoading
                  }
                  isLoading={createUserTripIsLoading || updateUserTripIsLoading}
                >
                  {currentUserTrip ? "Exit trip" : "Join trip"}
                </Button>
              )}

              {/* START / COMPLETE / CANCEL TRIP */}
              {showStartTrip && (
                <Button
                  primary
                  onClick={(e) => {
                    e.preventDefault();
                    void onStartTrip();
                  }}
                  isLoading={isLoading}
                >
                  Start trip
                </Button>
              )}
              {showCompleteTrip && (
                <Button
                  primary
                  onClick={(e) => {
                    e.preventDefault();
                    void onCompleteTrip();
                  }}
                  isLoading={completeTripIsLoading}
                >
                  Complete trip
                </Button>
              )}
              {showCancelTrip && (
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    void onCancelTrip();
                  }}
                  isLoading={cancelTripIsLoading}
                >
                  Cancel trip
                </Button>
              )}
            </ul>
          }
        />
        <section className="w-full flex flex-col gap-4">
          <article className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Trip Status */}
            <article className="card-framed p-5">
              <h3 className="type-meta mb-2">
                Trip Status
              </h3>
              <p
                className={`${getStatusColor(
                  trip?.status as TripStatus,
                )} inline-block px-4 py-1 rounded-full text-sm font-normal`}
              >
                {capitalizeString(trip?.status) || "N/A"}
              </p>
            </article>

            {/* Trip Times */}
            <article className="card-framed p-5">
              <h3 className="type-meta mb-2">
                Trip Times
              </h3>
              <section className="space-y-1">
                <ul className="w-full flex items-center gap-2 justify-between py-2">
                  <p className="text-sm font-normal text-(--muted)">
                    Start:{" "}
                    {trip?.startTime
                      ? moment(new Date(trip.startTime)).format("HH:mm")
                      : "Not started"}
                  </p>
                  <p className="text-sm font-normal text-(--muted)">
                    End:{" "}
                    {trip?.endTime
                      ? moment(new Date(trip.endTime)).format("HH:mm")
                      : "Not completed"}
                  </p>
                </ul>
                <p className="text-sm font-normal text-(--muted) underline">
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
            <article className="card-framed p-5">
              <h3 className="type-meta mb-2">
                Trip Locations
              </h3>
              <section className="space-y-1">
                <p className="text-sm font-normal text-(--muted)">
                  From: {trip?.locationFrom?.name || "N/A"}
                </p>
                <p className="text-sm font-normal text-(--muted)">
                  To: {trip?.locationTo?.name || "N/A"}
                </p>
              </section>
            </article>

            {/* Available Seats */}
            <article className="card-framed p-5">
              <h3 className="type-meta mb-2">
                Available Seats
              </h3>
              <p className="text-lg font-medium text-(--ink)">
                {tripAvailableCapacityIsFetching ? (
                  <Loader className="text-(--ink)" />
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
        {confirmDialog}
      </PageBody>
    </AppLayout>
  );
};

export default TripDetailsPage;
