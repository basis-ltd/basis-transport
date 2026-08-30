import Button from '@/components/inputs/Button';
import Table from '@/components/table/Table';
import AppLayout from '@/containers/navigation/AppLayout';
import { useAppSelector } from '@/states/hooks';
import { useLocationColumns } from '@/usecases/locations/columns.location';
import { useFetchLocations } from '@/usecases/locations/location.hooks';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageBody, PageHeader } from "@/components/layout/PageShell";

const LocationsPage = () => {
  /**
   * STATE VARIABLES
   */
  const { locationsList } = useAppSelector((state) => state.location);

  /**
   * NAVIGATION
   */
  const navigate = useNavigate();

  /**
   * LOCATIONS HOOKS
   */
  const {
    locationsIsFetching,
    page,
    size,
    totalPages,
    totalCount,
    setPage,
    setSize,
    fetchLocations,
  } = useFetchLocations();

  // FETCH LOCATIONS
  useEffect(() => {
    fetchLocations({
      page,
      size,
    });
  }, [fetchLocations, page, size]);

  // LOCATIONS COLUMNS
  const { locationColumns } = useLocationColumns({
    page: 1,
    size: 10,
  });

  return (
    <AppLayout>
      <PageBody>
        <PageHeader
          title="Locations"
          description="Stops and stations trips can run between."
          actions={
            <Button
              primary
              icon={faPlus}
              onClick={(e) => {
                e.preventDefault();
                navigate('/locations/create');
              }}
            >
              Add location
            </Button>
          }
        />
        <section className="w-full flex flex-col gap-4">
          <Table
            columns={locationColumns}
            data={locationsList}
            isLoading={locationsIsFetching}
            page={page}
            size={size}
            totalPages={totalPages}
            totalCount={totalCount}
            setPage={setPage}
            setSize={setSize}
          />
        </section>
      </PageBody>
    </AppLayout>
  );
};

export default LocationsPage;
