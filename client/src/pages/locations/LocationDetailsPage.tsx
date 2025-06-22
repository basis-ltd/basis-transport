import Button from '@/components/inputs/Button';
import { SkeletonLoader } from '@/components/inputs/Loader';
import { Heading } from '@/components/inputs/TextInputs';
import { TableUserLabel } from '@/components/users/TableUserLabel';
import { environment } from '@/constants/environment.constants';
import AppLayout from '@/containers/navigation/AppLayout';
import { useAppSelector } from '@/states/hooks';
import { useGetLocationById } from '@/usecases/locations/location.hooks';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const LocationDetailsPage = () => {
  /**
   * STATE VARIABLES
   */
  const { location } = useAppSelector((state) => state.location);

  /**
   * NAVIGATION
   */
  const { id } = useParams();
  const navigate = useNavigate();

  /**
   * LOCATION HOOKS
   */
  const { getLocationById, locationIsFetching, locationIsError } =
    useGetLocationById();

  // FETCH LOCATION
  useEffect(() => {
    if (id) {
      getLocationById(id);
    }
  }, [getLocationById, id]);

  if (locationIsFetching) {
    return (
      <AppLayout>
        <main className="w-full max-w-6xl mx-auto px-4 py-8 space-y-8">
          <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-200">
            <section>
              <SkeletonLoader width="300px" height="36px" className="mb-2" />
              <SkeletonLoader width="400px" height="20px" />
            </section>
          </header>

          <article className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <section className="lg:col-span-2 bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <header className="mb-8">
                <SkeletonLoader width="250px" height="28px" className="mb-2" />
                <SkeletonLoader width="200px" height="20px" />
              </header>

              <dl>
                <dt className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  <SkeletonLoader width="100px" height="16px" />
                </dt>
                <dd className="mt-2">
                  <SkeletonLoader width="220px" height="20px" />
                </dd>

                <dt className="mt-6 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  <SkeletonLoader width="120px" height="16px" />
                </dt>
                <dd className="mt-2">
                  <SkeletonLoader width="180px" height="20px" />
                </dd>

                <dt className="mt-6 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  <SkeletonLoader width="110px" height="16px" />
                </dt>
                <dd className="mt-2">
                  <SkeletonLoader width="150px" height="20px" />
                </dd>
              </dl>
            </section>

            <section className="lg:col-span-3 bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <header className="mb-8">
                <SkeletonLoader width="60px" height="28px" className="mb-2" />
                <SkeletonLoader width="220px" height="20px" />
              </header>
              <SkeletonLoader type="card" height="24rem" />
            </section>
          </article>
        </main>
      </AppLayout>
    );
  }

  if (locationIsError || !location) {
    return (
      <AppLayout>
        <main className="w-full min-h-screen flex items-center justify-center">
          <section className="text-center space-y-4">
            <h1 className="text-2xl font-semibold text-gray-700">
              Location Not Found
            </h1>
            <p className="text-gray-500">
              We couldn't locate this location's information.
            </p>
          </section>
        </main>
      </AppLayout>
    );
  }

  const position =
    location?.address?.coordinates &&
    Array.isArray(location.address.coordinates) &&
    location.address.coordinates.length >= 2
      ? {
          lat: location.address.coordinates[0],
          lng: location.address.coordinates[1],
        }
      : undefined;

  return (
    <AppLayout>
      <main className="w-full max-w-6xl mx-auto px-4 py-6 space-y-8">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-200">
          <section>
            <Heading className="text-3xl font-bold text-gray-900 mb-2">
              {location?.name}
            </Heading>
            <p className="text-gray-600">
              Detailed information about {location?.name}
            </p>
          </section>
        </header>

        <article className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <section className="lg:col-span-2 bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <header className="mb-8">
              <Heading
                type="h2"
                className="text-2xl font-semibold text-gray-900 mb-2"
              >
                Location Information
              </Heading>
              <p className="text-gray-600">Basic location details</p>
            </header>

            <dl>
              <dt className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Description
              </dt>
              <dd className="mt-2 text-md font-medium text-gray-900">
                {location?.description || 'Not provided'}
              </dd>

              <dt className="mt-6 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Created By
              </dt>
              <dd className="mt-2">
                <TableUserLabel user={location?.createdBy} />
              </dd>

              <dt className="mt-6 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Created At
              </dt>
              <dd className="mt-2 text-md font-medium text-gray-900">
                {new Date(location?.createdAt).toLocaleDateString()}
              </dd>
            </dl>
          </section>

          <section className="lg:col-span-3 bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <header className="mb-8">
              <Heading
                type="h2"
                className="text-2xl font-semibold text-gray-900 mb-2"
              >
                Map
              </Heading>
              <p className="text-gray-600">Geographical location</p>
            </header>
            {position ? (
              <section className="h-[50vh] w-full rounded-lg overflow-hidden">
                <APIProvider apiKey={environment.googleMapsApiKey}>
                  <Map
                    defaultCenter={position}
                    defaultZoom={15}
                    gestureHandling={'greedy'}
                    fullscreenControl={true}
                  >
                    <Marker position={position} title={location?.name} />
                  </Map>
                </APIProvider>
              </section>
            ) : (
              <section className="h-[50vh] w-full flex items-center justify-center bg-gray-50 rounded-lg">
                <p className="text-gray-500">Address is not available.</p>
              </section>
            )}
          </section>
        </article>
        <menu className='w-full flex items-center gap-3 justify-between'>
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

export default LocationDetailsPage;

