import Button from "@/components/inputs/Button";
import Table from "@/components/table/Table";

import { useUserColumns } from "@/usecases/users/columns.user";
import { useFetchUsers } from "@/usecases/users/user.hooks";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import {
  PageBody,
  PageHeader,
  PageSection,
} from "@/components/layout/PageShell";

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
    <PageBody>
      <PageHeader
        eyebrow="People"
        title="Users"
        description="Everyone with access to Basis Transport."
        actions={
          <Button route="/users/create" icon={faPlus} primary>
            Create
          </Button>
        }
      />
      <PageSection
        title="Directory"
        description="Search and open anyone with access."
        bodyClassName="gap-4"
      >
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
      </PageSection>
    </PageBody>
  );
};

export default UsersPage;
