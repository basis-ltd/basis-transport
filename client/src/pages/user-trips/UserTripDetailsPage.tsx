import { Heading } from '@/components/inputs/TextInputs';
import AppLayout from '@/containers/navigation/AppLayout';
import { useAppSelector } from '@/states/hooks';
import { useGetUserTrip } from '@/usecases/user-trip/userTrip.hooks';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import MapView from '@/components/maps/MapView';
import { UserTripStatus } from '@/constants/userTrip.constants';
import moment from 'moment';
import Button from '@/components/inputs/Button';

const UserTripDetailsPage = () => {
  /**
   * STATE VARIABLES
   */
  const { userTrip } = useAppSelector((state) => state.userTrip);
  const [defaultCenter, setDefaultCenter] = useState({
    lat: 0,
    lng: 0,
  });
  const [origin, setOrigin] = useState({
    lat: 0,
    lng: 0,
  });
  const [destination, setDestination] = useState({
    lat: 0,
    lng: 0,
  });

  /**
   * NAVIGATION
   */
  const navigate = useNavigate();

  useEffect(() => {
    if (userTrip) {
      if (userTrip?.entranceLocation) {
        setOrigin({
          lat:
            userTrip?.entranceLocation?.coordinates?.[0] ??
            userTrip?.trip?.locationFrom?.address?.coordinates?.[0] ??
            0,
          lng:
            userTrip?.entranceLocation?.coordinates?.[1] ??
            userTrip?.trip?.locationFrom?.address?.coordinates?.[1] ??
            0,
        });
      } else {
        setOrigin({
          lat:
            userTrip?.trip?.locationFrom?.address?.coordinates?.[0] ??
            userTrip?.trip?.locationTo?.address?.coordinates?.[0] ??
            0,
          lng:
            userTrip?.trip?.locationFrom?.address?.coordinates?.[1] ??
            userTrip?.trip?.locationTo?.address?.coordinates?.[1] ??
            0,
        });
      }
      if (userTrip?.exitLocation) {
        setDestination({
          lat:
            userTrip?.exitLocation?.coordinates?.[0] ??
            userTrip?.trip?.locationTo?.address?.coordinates?.[0] ??
            1,
          lng:
            userTrip?.exitLocation?.coordinates?.[1] ??
            userTrip?.trip?.locationTo?.address?.coordinates?.[1] ??
            0,
        });
      } else {
        setDestination({
          lat:
            userTrip?.trip?.locationTo?.address?.coordinates?.[0] ??
            userTrip?.trip?.locationFrom?.address?.coordinates?.[0] ??
            0,
          lng:
            userTrip?.trip?.locationTo?.address?.coordinates?.[1] ??
            userTrip?.trip?.locationFrom?.address?.coordinates?.[1] ??
            0,
        });
      }

      setDefaultCenter({
        lat:
          userTrip?.trip?.locationFrom?.address?.coordinates?.[0] ??
          userTrip?.trip?.locationTo?.address?.coordinates?.[0] ??
          0,
        lng:
          userTrip?.trip?.locationFrom?.address?.coordinates?.[1] ??
          userTrip?.trip?.locationTo?.address?.coordinates?.[1] ??
          0,
      });
    }
  }, [userTrip]);

  /**
   * NAVIGATION
   */
  const { id } = useParams();

  /**
   * USER TRIP HOOKS
   */
  const { getUserTrip, userTripIsFetching } = useGetUserTrip();

  useEffect(() => {
    if (id) getUserTrip(id);
  }, [getUserTrip, id]);

  // Helper function to get status color
  const getStatusColor = (status: UserTripStatus) => {
    switch (status) {
      case UserTripStatus.IN_PROGRESS:
        return 'text-blue-700 bg-blue-50';
      case UserTripStatus.COMPLETED:
        return 'text-green-700 bg-green-50';
      case UserTripStatus.CANCELLED:
        return 'text-red-700 bg-red-50';
      default:
        return 'text-secondary bg-background-secondary/60';
    }
  };

  // Before rendering, ensure defaultCenter is not zero
  const mapDefaultCenter = (defaultCenter.lat === 0 && defaultCenter.lng === 0)
    ? origin
    : defaultCenter;

  return (
    <AppLayout>
      <main className="w-full flex flex-col gap-4">
        <header className="w-full flex flex-col gap-4">
          <nav className="w-full">
            <ul className="w-full flex items-center gap-3 justify-between">
              <Heading isLoading={userTripIsFetching}>
                {userTrip?.user?.name}'s Trip #{userTrip?.trip?.referenceId}
              </Heading>
            </ul>
          </nav>
        </header>

        <article className="w-full flex flex-col gap-4">
          <section className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Trip Status */}
            <article className="bg-white rounded-2xl shadow-sm border border-primary/10 p-5">
              <h3 className="text-sm font-medium text-secondary/70 mb-2">
                Trip Status
              </h3>
              <span
                className={`inline-block px-4 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  userTrip?.status as UserTripStatus
                )}`}
              >
                {userTrip?.status || 'Unknown'}
              </span>
            </article>

            {/* Trip Times */}
            <article className="bg-white rounded-2xl shadow-sm border border-primary/10 p-5">
              <h3 className="text-sm font-medium text-secondary/70 mb-2">
                Trip Times (
                {moment(
                  new Date(
                    userTrip?.startTime ??
                      userTrip?.trip?.startTime ??
                      new Date()
                  )
                ).format('DD/MM/YYYY')}
                )
              </h3>
              <section className="space-y-1">
                <ul className="w-full flex items-center gap-2 justify-between py-2">
                  <p className="text-sm text-secondary/80">
                    Start:{' '}
                    {userTrip?.startTime
                      ? moment(new Date(userTrip.startTime)).format('HH:mm')
                      : 'Not started'}
                  </p>
                  <p className="text-sm text-secondary/80">
                    End:{' '}
                    {userTrip?.endTime
                      ? moment(new Date(userTrip.endTime)).format('HH:mm')
                      : 'Not completed'}
                  </p>
                </ul>
                <p className="text-sm text-secondary/80 font-medium underline">
                  Time spent:{' '}
                  {userTrip?.endTime
                    ? moment(new Date(userTrip.endTime)).diff(
                        moment(new Date(userTrip.startTime)),
                        'minutes'
                      )
                    : 'Not completed'}{' '}
                  minutes
                </p>
              </section>
            </article>

            {/* User Information */}
            <article className="bg-white rounded-2xl shadow-sm border border-primary/10 p-5">
              <h3 className="text-sm font-medium text-secondary/70 mb-2">
                Passenger Information
              </h3>
              <section className="space-y-1">
                <p className="text-sm text-secondary/80">
                  Name: {userTrip?.user?.name || 'Unknown'}
                </p>
                <p className="text-sm text-secondary/80">
                  Phone: {userTrip?.user?.phoneNumber || 'N/A'}
                </p>
              </section>
            </article>

            {/* Trip Reference */}
            <article className="bg-white rounded-2xl shadow-sm border border-primary/10 p-5">
              <h3 className="text-sm font-medium text-secondary/70 mb-2">
                Trip Reference
              </h3>
              <p className="text-lg font-semibold text-primary">
                #{userTrip?.trip?.referenceId || 'N/A'}
              </p>
            </article>
          </section>
        </article>

        <section className="w-full flex flex-col gap-4">
          <Heading type="h2">Trip Map</Heading>
          <MapView
            height="40vh"
            origin={origin}
            destination={destination}
            defaultCenter={mapDefaultCenter}
            fromLabel={userTrip?.entranceLocation ? 'Entry Point' : 'Start Location'}
            toLabel={userTrip?.exitLocation ? 'Exit Point' : 'Destination'}
          />
        </section>
        <menu className="w-full flex items-center gap-3 justify-between">
          <Button onClick={(e) => {
            e.preventDefault();
            navigate(-1);
          }}>
            Back
          </Button>
        </menu>
      </main>
    </AppLayout>
  );
};

export default UserTripDetailsPage;
