import Button from '@/components/inputs/Button';
import { Heading } from '@/components/inputs/TextInputs';
import { Gender, getGenderLabel } from '@/constants/user.constants';
import AppLayout from '@/containers/navigation/AppLayout';
import { useAppSelector } from '@/states/hooks';
import { faEdit, faKey } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';

const UserProfilePage = () => {
  /**
   * STATE VARIABLES
   */
  const { user } = useAppSelector((state) => state.auth);

  /**
   * NAVIGATION
   */
  const navigate = useNavigate();

  if (!user) {
    return (
      <AppLayout>
        <main className="w-full">
          <p>Profile not found</p>
        </main>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <main className="w-full max-w-[80%] mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <Heading>My Profile</Heading>
          <nav className="flex gap-3">
            <Button route="/account/profile/edit" icon={faEdit} primary>
              Edit Profile
            </Button>
            <Button route="/account/profile/change-password" icon={faKey}>
              Change Password
            </Button>
          </nav>
        </header>

        <article className="space-y-6">
          <section className="bg-white rounded-lg p-8 shadow-sm">
            <header className="flex items-center gap-6 mb-8">
              <figure className="relative">
                <img
                  src={`https://ui-avatars.com/api/?name=${user.name}&background=0D8ABC&color=fff`}
                  alt={user.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                />
                <figcaption className="sr-only">
                  {user?.name}'s profile picture
                </figcaption>
              </figure>
              <hgroup>
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <p className="text-gray-500">{user?.email}</p>
              </hgroup>
            </header>

            <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="space-y-1">
                <dt className="text-sm font-medium text-gray-500">
                  Phone Number
                </dt>
                <dd className="text-lg">
                  {user?.phoneNumber || 'Not provided'}
                </dd>
              </section>

              <section className="space-y-1">
                <dt className="text-sm font-medium text-gray-500">Gender</dt>
                <dd className="text-lg">
                  {getGenderLabel(user?.gender || Gender.MALE)}
                </dd>
              </section>

              <section className="space-y-1">
                <dt className="text-sm font-medium text-gray-500">
                  Nationality
                </dt>
                <dd className="text-lg">
                  {user?.nationality || 'Not provided'}
                </dd>
              </section>

              <section className="space-y-1">
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="text-lg">
                  <mark
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                      user?.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {user?.status}
                  </mark>
                </dd>
              </section>
            </dl>
          </section>

          <section className="bg-white rounded-lg p-8 shadow-sm">
            <h2 className="text-xl font-semibold mb-6">Roles & Permissions</h2>
            {user?.userRoles && user?.userRoles.length > 0 ? (
              <ul className="flex flex-wrap gap-3">
                {user?.userRoles.map((userRole, index) => (
                  <li
                    key={index}
                    className="px-4 py-2 bg-blue-50 text-primary hover:bg-primary/10 hover:text-primary transition-colors rounded-full text-sm font-medium"
                  >
                    {userRole?.role?.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No roles assigned</p>
            )}
          </section>

          <section className="bg-white rounded-lg p-8 shadow-sm">
            <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
            <nav className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                to="/account/transport-cards"
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-medium mb-1">My Cards</h3>
                <p className="text-sm text-gray-500">
                  View and manage your transport cards
                </p>
              </Link>
              <Link
                to="/account/settings"
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-medium mb-1">Settings</h3>
                <p className="text-sm text-gray-500">Manage your preferences</p>
              </Link>
            </nav>
          </section>
        </article>
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

export default UserProfilePage;
