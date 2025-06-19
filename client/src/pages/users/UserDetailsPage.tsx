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
        <main className="w-full min-h-screen flex items-center justify-center">
          <section className="text-center space-y-4">
            <h1 className="text-2xl font-semibold text-gray-700">
              Loading user details...
            </h1>
            <p className="text-gray-500">
              Please wait while we fetch the user information.
            </p>
          </section>
        </main>
      </AppLayout>
    );
  }

  if (!user) {
    return (
      <AppLayout>
        <main className="w-full min-h-screen flex items-center justify-center">
          <section className="text-center space-y-4">
            <h1 className="text-2xl font-semibold text-gray-700">
              User Not Found
            </h1>
            <p className="text-gray-500">
              We couldn't locate this user's information.
            </p>
          </section>
        </main>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <main className="w-full max-w-6xl mx-auto px-4 py-8 space-y-8">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-200">
          <section>
            <Heading className="text-3xl font-bold text-gray-900 mb-2">
              User Details
            </Heading>
            <p className="text-gray-600">
              View detailed information about {user.name}
            </p>
          </section>
        </header>

        <article className="space-y-8">
          {/* Profile Overview Card */}
          <section className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 shadow-lg border border-blue-100">
            <header className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
              <figure className="relative flex-shrink-0">
                <img
                  src={`https://ui-avatars.com/api/?name=${user?.name}&background=0D8ABC&color=fff&size=120`}
                  alt={user?.name}
                  className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg ring-4 ring-blue-100"
                />
                <figcaption className="sr-only">
                  {user?.name} profile picture
                </figcaption>
              </figure>
              <hgroup className="text-center md:text-left">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {user?.name}
                </h1>
                <p className="text-md text-gray-600 mb-1">{user?.email}</p>
                <mark
                  className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                    user?.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : 'bg-gray-100 text-gray-800 border border-gray-200'
                  }`}
                >
                  {user?.status}
                </mark>
              </hgroup>
            </header>
          </section>

          {/* Personal Information Card */}
          <section className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <header className="mb-8">
              <Heading type="h2" className="text-2xl font-semibold text-gray-900 mb-2">
                Personal Information
              </Heading>
              <p className="text-gray-600">Basic profile details</p>
            </header>

            <dl className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section className="space-y-3 p-6 bg-gray-50 rounded-xl border border-gray-200">
                <dt className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Phone Number
                </dt>
                <dd className="text-[14px] font-medium text-gray-900">
                  {user?.phoneNumber || 'Not provided'}
                </dd>
              </section>

              <section className="space-y-3 p-6 bg-gray-50 rounded-xl border border-gray-200">
                <dt className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Gender
                </dt>
                <dd className="text-[14px] font-medium text-gray-900">
                  {getGenderLabel(user?.gender || Gender.MALE)}
                </dd>
              </section>

              <section className="space-y-3 p-6 bg-gray-50 rounded-xl border border-gray-200">
                <dt className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Nationality
                </dt>
                <dd className="text-[14px] font-medium text-gray-900">
                  {user?.nationality || 'Not provided'}
                </dd>
              </section>

              <section className="space-y-3 p-6 bg-gray-50 rounded-xl border border-gray-200">
                <dt className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Account Created
                </dt>
                <dd className="text-[14px] font-medium text-gray-900">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : 'Not available'}
                </dd>
              </section>
            </dl>
          </section>

          {/* Roles & Permissions Card */}
          <section className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <header className="mb-8">
              <Heading type="h2" className="text-2xl font-semibold text-gray-900 mb-2">
                Roles & Permissions
              </Heading>
              <p className="text-gray-600">
                Assigned roles and access levels
              </p>
            </header>
            {user?.userRoles && user?.userRoles.length > 0 ? (
              <ul className="flex flex-wrap gap-4">
                {user?.userRoles.map((userRole, index) => (
                  <li
                    key={index}
                    className="px-6 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 rounded-xl text-sm font-semibold border border-blue-200 shadow-sm"
                  >
                    {userRole?.role?.name}
                  </li>
                ))}
              </ul>
            ) : (
              <section className="text-center py-8">
                <p className="text-gray-500 text-lg">No roles assigned</p>
                <p className="text-gray-400 text-sm mt-2">
                  This user has no roles assigned
                </p>
              </section>
            )}
          </section>
        </article>

        <footer className="pt-8 border-t border-gray-200">
          <menu className="flex items-center justify-between">
            <Button
              onClick={(e) => {
                e.preventDefault();
                navigate(-1);
              }}
            >
              Back
            </Button>
            <p className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </menu>
        </footer>
      </main>
    </AppLayout>
  );
};

export default UserDetailsPage;
