import Button from '@/components/inputs/Button';
import { Heading } from '@/components/inputs/TextInputs';
import { Gender, getGenderLabel } from '@/constants/user.constants';
import AppLayout from '@/containers/navigation/AppLayout';
import { capitalizeString } from '@/helpers/strings.helper';
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
            <h1 className="text-2xl font-semibold text-secondary">
              Loading user details...
            </h1>
            <p className="text-secondary/70">
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
            <h1 className="text-2xl font-semibold text-secondary">
              User Not Found
            </h1>
            <p className="text-secondary/70">
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
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-primary/10">
          <section>
            <Heading className="text-3xl font-semibold text-primary mb-2">
              User Details
            </Heading>
            <p className="text-secondary/80">
              View detailed information about {user.name}
            </p>
          </section>
        </header>

        <article className="space-y-8">
          {/* Profile Overview Card */}
          <section className="bg-gradient-to-br from-primary/10 to-background rounded-2xl p-8 shadow-sm border border-primary/10">
            <header className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
              <figure className="relative flex-shrink-0">
                <img
                  src={`https://ui-avatars.com/api/?name=${user?.name}&background=283618&color=fff&size=120`}
                  alt={user?.name}
                  className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-md ring-4 ring-primary/10"
                />
                <figcaption className="sr-only">
                  {user?.name} profile picture
                </figcaption>
              </figure>
              <hgroup className="text-center md:text-left">
                <h1 className="text-2xl font-semibold text-primary mb-2">
                  {user?.name}
                </h1>
                <p className="text-md text-secondary/80 mb-1">{user?.email}</p>
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
          <section className="bg-white rounded-2xl p-8 shadow-sm border border-primary/10">
            <header className="mb-8">
              <Heading type="h2" className="text-2xl font-semibold text-primary mb-2">
                Personal Information
              </Heading>
              <p className="text-secondary/80">Basic profile details</p>
            </header>

            <dl className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section className="space-y-3 p-6 bg-background-secondary/60 rounded-xl border border-primary/10">
                <dt className="text-sm font-semibold text-secondary uppercase tracking-wide">
                  Phone Number
                </dt>
                <dd className="text-[14px] font-medium text-primary">
                  {user?.phoneNumber || 'Not provided'}
                </dd>
              </section>

              <section className="space-y-3 p-6 bg-background-secondary/60 rounded-xl border border-primary/10">
                <dt className="text-sm font-semibold text-secondary uppercase tracking-wide">
                  Gender
                </dt>
                <dd className="text-[14px] font-medium text-primary">
                  {getGenderLabel(user?.gender || Gender.MALE)}
                </dd>
              </section>

              <section className="space-y-3 p-6 bg-background-secondary/60 rounded-xl border border-primary/10">
                <dt className="text-sm font-semibold text-secondary uppercase tracking-wide">
                  Nationality
                </dt>
                <dd className="text-[14px] font-medium text-primary">
                  {user?.nationality || 'Not provided'}
                </dd>
              </section>

              <section className="space-y-3 p-6 bg-background-secondary/60 rounded-xl border border-primary/10">
                <dt className="text-sm font-semibold text-secondary uppercase tracking-wide">
                  Account Created
                </dt>
                <dd className="text-[14px] font-medium text-primary">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : 'Not available'}
                </dd>
              </section>
            </dl>
          </section>

          {/* Roles & Permissions Card */}
          <section className="bg-white rounded-2xl p-8 shadow-sm border border-primary/10">
            <header className="mb-8">
              <Heading type="h2" className="text-2xl font-semibold text-primary mb-2">
                Roles & Permissions
              </Heading>
              <p className="text-secondary/80">
                Assigned roles and access levels
              </p>
            </header>
            {user?.userRoles && user?.userRoles.length > 0 ? (
              <ul className="flex flex-wrap gap-4">
                {user?.userRoles.map((userRole, index) => (
                  <li
                    key={index}
                    className="px-6 py-3 bg-primary/10 text-primary transition-all duration-200 rounded-xl text-sm font-semibold border border-primary/20 shadow-sm"
                  >
                    {capitalizeString(userRole?.role?.name)}
                  </li>
                ))}
              </ul>
            ) : (
              <section className="text-center py-8">
                <p className="text-secondary/70 text-lg">No roles assigned</p>
                <p className="text-secondary/60 text-sm mt-2">
                  This user has no roles assigned
                </p>
              </section>
            )}
          </section>
        </article>

        <footer className="pt-8 border-t border-primary/10">
          <menu className="flex items-center justify-between">
            <Button
              onClick={(e) => {
                e.preventDefault();
                navigate(-1);
              }}
            >
              Back
            </Button>
            <p className="text-sm text-secondary/70">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </menu>
        </footer>
      </main>
    </AppLayout>
  );
};

export default UserDetailsPage;
