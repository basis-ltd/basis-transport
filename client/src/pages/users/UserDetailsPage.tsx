import Button from '@/components/inputs/Button';
import { Heading } from '@/components/inputs/TextInputs';
import { Gender, getGenderLabel } from '@/constants/user.constants';
import AppLayout from '@/containers/navigation/AppLayout';
import { useAppSelector } from '@/states/hooks';
import { useGetUserById } from '@/usecases/users/user.hooks';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const UserDetailsPage = () => {
  /**
   * STATE VARIABLES
   */
  const { user } = useAppSelector((state) => state.user);

  /**
   * NAVIGATION
   */
  const { id } = useParams();
  const navigate = useNavigate();

  /**
   * FETCH USER
   */
  const { getUserById, userIsFetching } = useGetUserById();

  /**
   * EFFECTS
   */
  useEffect(() => {
    if (id) {
      getUserById(id);
    }
  }, [getUserById, id]);

  if (userIsFetching) {
    return (
      <AppLayout>
        <main className="w-full">
          <p>Loading user details...</p>
        </main>
      </AppLayout>
    );
  }

  if (!user) {
    return (
      <AppLayout>
        <main className="w-full">
          <p>User not found</p>
        </main>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <main className="w-full space-y-8">
        <header>
          <Heading>User Details</Heading>
        </header>

        <article className="space-y-6">
          <section className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <dt className="font-medium text-gray-500">Name</dt>
              <dd>{user.name}</dd>

              <dt className="font-medium text-gray-500">Email</dt>
              <dd>{user.email}</dd>

              <dt className="font-medium text-gray-500">Phone</dt>
              <dd>{user.phoneNumber}</dd>

              <dt className="font-medium text-gray-500">Gender</dt>
              <dd>{getGenderLabel(user.gender || Gender.MALE)}</dd>

              <dt className="font-medium text-gray-500">Nationality</dt>
              <dd>{user.nationality}</dd>

              <dt className="font-medium text-gray-500">Status</dt>
              <dd>{user.status}</dd>
            </dl>
          </section>

          <section className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Roles</h2>
            {user.userRoles && user.userRoles.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {user.userRoles.map((userRole, index) => (
                  <li
                    key={index}
                    className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                  >
                    {userRole.role?.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No roles assigned</p>
            )}
          </section>
        </article>
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

export default UserDetailsPage;
