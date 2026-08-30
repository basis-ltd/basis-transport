import Button from '@/components/inputs/Button';
import { SkeletonLoader } from '@/components/inputs/Loader';
import {
  DetailList,
  PageBody,
  PageFooter,
  PageHeader,
  PageSection,
} from '@/components/layout/PageShell';
import { TableUserLabel } from '@/components/users/TableUserLabel';
import { environment } from '@/constants/environment.constants';
import AppLayout from '@/containers/navigation/AppLayout';
import { useAppSelector } from '@/states/hooks';
import { useGetLocationById } from '@/usecases/locations/location.hooks';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const LocationDetailsPage = () => {
  const { location } = useAppSelector((state) => state.location);

  const { id } = useParams();
  const navigate = useNavigate();

  const { getLocationById, locationIsFetching, locationIsError } =
    useGetLocationById();

  useEffect(() => {
    if (id) {
      getLocationById(id);
    }
  }, [getLocationById, id]);

  if (locationIsFetching) {
    return (
      <AppLayout>
        <PageBody>
          <PageHeader title="Location" />
          <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
            <PageSection title="Location information">
              <SkeletonLoader type="text" height="1rem" />
              <SkeletonLoader type="text" height="1rem" />
              <SkeletonLoader type="text" height="1rem" />
            </PageSection>
            <PageSection title="Map">
              <SkeletonLoader type="card" height="24rem" />
            </PageSection>
          </div>
        </PageBody>
      </AppLayout>
    );
  }

  if (locationIsError || !location) {
    return (
      <AppLayout>
        <PageBody>
          <PageHeader title="Location" />
          <PageSection>
            <p className="type-body-sm text-(--muted)">
              We couldn’t find this location. It may have been removed.
            </p>
            <div>
              <Button
                onClick={(event) => {
                  event.preventDefault();
                  navigate(-1);
                }}
              >
                Back
              </Button>
            </div>
          </PageSection>
        </PageBody>
      </AppLayout>
    );
  }

  const coordinates = location?.address?.coordinates;
  const position =
    Array.isArray(coordinates) && coordinates.length >= 2
      ? { lat: coordinates[0], lng: coordinates[1] }
      : undefined;

  return (
    <AppLayout>
      <PageBody>
        <PageHeader
          title={location?.name}
          description="Stop details and where it sits on the map."
        />

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <PageSection
            title="Location information"
            description="Basic stop details."
          >
            <DetailList
              columns={1}
              items={[
                {
                  label: 'Description',
                  value:
                    location?.description ||
                    'No description provided for this location yet.',
                },
                {
                  label: 'Created by',
                  value: <TableUserLabel user={location?.createdBy} />,
                },
                {
                  label: 'Created',
                  value: new Date(location?.createdAt).toLocaleDateString(),
                },
              ]}
            />
          </PageSection>

          <PageSection title="Map" description="Where this stop is.">
            {position && environment.googleMapsApiKey ? (
              <div className="h-[420px] w-full overflow-hidden rounded-(--radius-card)">
                <APIProvider apiKey={environment.googleMapsApiKey}>
                  <Map
                    defaultCenter={position}
                    defaultZoom={15}
                    gestureHandling="greedy"
                    fullscreenControl
                  >
                    <Marker position={position} title={location?.name} />
                  </Map>
                </APIProvider>
              </div>
            ) : (
              <div className="flex h-[420px] w-full items-center justify-center rounded-(--radius-card) bg-(--surface)">
                <p className="type-meta">
                  {position
                    ? 'Map appears when Google Maps is configured.'
                    : 'No address recorded for this stop.'}
                </p>
              </div>
            )}
          </PageSection>
        </div>

        <PageFooter>
          <Button
            onClick={(event) => {
              event.preventDefault();
              navigate(-1);
            }}
          >
            Back
          </Button>
        </PageFooter>
      </PageBody>
    </AppLayout>
  );
};

export default LocationDetailsPage;
