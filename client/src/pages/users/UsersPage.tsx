import Button from '@/components/inputs/Button';
import { Heading } from '@/components/inputs/TextInputs';
import Table from '@/components/table/Table';
import AppLayout from '@/containers/navigation/AppLayout';
import { useAppSelector } from '@/states/hooks';
import { useUserColumns } from '@/usecases/users/columns.user';
import { useFetchUsers } from '@/usecases/users/user.hooks';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useEffect } from 'react';

const UsersPage = () => {
  /**
   * STATE VARIABLES
   */
  const { usersList } = useAppSelector((state) => state.user);

  /**
   * FETCH USERS
   */
  const {
    usersIsFetching,
    page,
    size,
    totalCount,
    totalPages,
    setPage,
    setSize,
    fetchUsers,
  } = useFetchUsers();

  // FETCH USERS
  useEffect(() => {
    fetchUsers({ page, size });
  }, [fetchUsers, page, size]);

  // USERS COLUMNS
  const { userColumns } = useUserColumns({ page, size });

  return (
    <AppLayout>
      <main className="w-full flex flex-col gap-4">
        <nav className="w-full flex flex-col gap-4">
          <ul className="w-full flex items-center gap-3 justify-between">
            <Heading>Users</Heading>
            <Button route="/users/create" icon={faPlus} primary>
              Create
            </Button>
          </ul>
        </nav>
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
      </main>
    </AppLayout>
  );
};

export default UsersPage;
