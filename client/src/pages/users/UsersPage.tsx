import Button from '@/components/inputs/Button';
import Table from '@/components/table/Table';
import AppLayout from '@/containers/navigation/AppLayout';
import { useUserColumns } from '@/usecases/users/columns.user';
import { useFetchUsers } from '@/usecases/users/user.hooks';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { PageBody, PageHeader } from "@/components/layout/PageShell";

const UsersPage = () => {
  /**
   * FETCH USERS
   */
  const {
    usersList,
    usersIsFetching,
    page,
    size,
    totalCount,
    totalPages,
    setPage,
    setSize,
  } = useFetchUsers();

  // USERS COLUMNS
  const { userColumns } = useUserColumns({ page, size });

  return (
    <AppLayout>
      <PageBody>
        <PageHeader
          title="Users"
          description="Everyone with access to Basis Transport."
          actions={
            <Button route="/users/create" icon={faPlus} primary>
              Create
            </Button>
          }
        />
        <section className="w-full flex flex-col gap-4">
          <Table
            columns={userColumns}
            data={usersList}
            isLoading={usersIsFetching}
            page={page}
            size={size}
            totalCount={totalCount}
            totalPages={totalPages}
            setPage={setPage}
            setSize={setSize}
          />
        </section>
      </PageBody>
    </AppLayout>
  );
};

export default UsersPage;
