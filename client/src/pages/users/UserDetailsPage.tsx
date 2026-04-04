import Button from '@/components/inputs/Button';
import { Gender, getGenderLabel } from '@/constants/user.constants';
import AppLayout from '@/containers/navigation/AppLayout';
import { publicColors } from '@/containers/public/publicTheme';
import { capitalizeString } from '@/helpers/strings.helper';
import { useAppSelector } from '@/states/hooks';
import { useGetUserById } from '@/usecases/users/user.hooks';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

/** DESIGN.md §0: rounded-md max, shadow-sm max, no section borders */
const surfaceCard =
  'rounded-md bg-white/90 shadow-sm p-6 md:p-8 flex flex-col gap-5';

const UserDetailsPage = () => {
  const { user } = useAppSelector((state) => state.user);
  const { id } = useParams();
  const navigate = useNavigate();
  const { getUserById, userIsFetching } = useGetUserById();

  useEffect(() => {
    if (id) {
      getUserById(id);
    }
  }, [getUserById, id]);

  if (userIsFetching) {
    return (
      <AppLayout>
        <main className="w-full min-h-[60vh] flex items-center justify-center px-6 lg:px-8 py-16">
          <section
            className={`${surfaceCard} max-w-md w-full text-center gap-4 animate-fade-in-up`}
          >
            <h1
              className="text-[13px] font-semibold leading-tight"
              style={{ color: publicColors.primary }}
            >
              Loading user details…
            </h1>
            <p
              className="text-[12px] leading-relaxed font-normal"
              style={{ color: publicColors.neutralLight }}
            >
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
        <main className="w-full min-h-[60vh] flex items-center justify-center px-6 lg:px-8 py-16">
          <section
            className={`${surfaceCard} max-w-md w-full text-center gap-4 animate-fade-in-up`}
          >
            <h1
              className="text-[13px] font-semibold leading-tight"
              style={{ color: publicColors.primary }}
            >
              User not found
            </h1>
            <p
              className="text-[12px] leading-relaxed font-normal"
              style={{ color: publicColors.neutralLight }}
            >
              We couldn&apos;t locate this user&apos;s information.
            </p>
          </section>
        </main>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <main
        className="w-full flex flex-col gap-10"
        style={{ color: publicColors.neutral }}
      >
        <header className="flex flex-col gap-2 animate-fade-in-up">
          <h1
            className="text-[13px] font-semibold leading-tight text-balance tracking-tight"
            style={{ color: publicColors.primary }}
          >
            User details
          </h1>
          <p
            className="text-[12px] leading-relaxed font-normal max-w-lg"
            style={{ color: publicColors.neutralLight }}
          >
            View detailed information about {user.name}
          </p>
        </header>

        <article className="flex flex-col gap-6">
          <section className={`${surfaceCard} animate-fade-in-up`}>
            <header className="flex flex-col md:flex-row md:items-center gap-6">
              <figure className="relative shrink-0 flex justify-center md:justify-start">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name ?? '')}&background=283618&color=fff&size=120`}
                  alt={user.name}
                  className="w-24 h-24 rounded-md object-cover shadow-sm"
                />
                <figcaption className="sr-only">
                  {user.name} profile picture
                </figcaption>
              </figure>
              <div className="text-center md:text-left flex flex-col gap-2 min-w-0">
                <p
                  className="text-[13px] font-semibold leading-tight"
                  style={{ color: publicColors.primary }}
                >
                  {user.name}
                </p>
                <p
                  className="text-[12px] leading-relaxed font-normal break-all"
                  style={{ color: publicColors.neutralLight }}
                >
                  {user.email}
                </p>
                <span
                  className={`inline-flex self-center md:self-start items-center px-3 py-1 rounded-md text-[12px] font-normal shadow-sm ${
                    user.status === 'ACTIVE'
                      ? 'bg-green-50 text-green-800'
                      : 'text-secondary'
                  }`}
                  style={
                    user.status !== 'ACTIVE'
                      ? { backgroundColor: `${publicColors.bgAlt}` }
                      : undefined
                  }
                >
                  {user.status}
                </span>
              </div>
            </header>
          </section>

          <section className={surfaceCard}>
            <header className="flex flex-col gap-1.5">
              <h2
                className="text-[13px] font-semibold leading-tight"
                style={{ color: publicColors.primary }}
              >
                Personal information
              </h2>
              <p
                className="text-[12px] leading-relaxed font-normal"
                style={{ color: publicColors.neutralLight }}
              >
                Basic profile details
              </p>
            </header>

            <dl className="flex flex-col gap-5 pt-1">
              {(
                [
                  ['Phone number', user.phoneNumber || 'Not provided'],
                  ['Gender', getGenderLabel(user.gender || Gender.MALE)],
                  ['Nationality', user.nationality || 'Not provided'],
                  [
                    'Account created',
                    user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : 'Not available',
                  ],
                ] as const
              ).map(([label, value]) => (
                <div key={label} className="flex flex-col gap-1">
                  <dt
                    className="text-[12px] font-normal leading-tight"
                    style={{ color: publicColors.neutralLight }}
                  >
                    {label}
                  </dt>
                  <dd
                    className="text-[12px] font-normal leading-relaxed"
                    style={{ color: publicColors.primary }}
                  >
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section className={surfaceCard}>
            <header className="flex flex-col gap-1.5">
              <h2
                className="text-[13px] font-semibold leading-tight"
                style={{ color: publicColors.primary }}
              >
                Roles & permissions
              </h2>
              <p
                className="text-[12px] leading-relaxed font-normal"
                style={{ color: publicColors.neutralLight }}
              >
                Assigned roles and access levels
              </p>
            </header>
            {user.userRoles && user.userRoles.length > 0 ? (
              <ul className="flex flex-wrap gap-2 pt-1">
                {user.userRoles.map((userRole, index) => (
                  <li
                    key={index}
                    className="px-3 py-1.5 rounded-md text-[12px] font-normal bg-primary/5 text-primary shadow-sm"
                  >
                    {capitalizeString(userRole?.role?.name)}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col gap-2 text-center py-2 pt-1">
                <p
                  className="text-[12px] font-normal leading-relaxed"
                  style={{ color: publicColors.neutralLight }}
                >
                  No roles assigned
                </p>
                <p
                  className="text-[12px] font-normal leading-relaxed"
                  style={{ color: publicColors.neutralLighter }}
                >
                  This user has no roles assigned
                </p>
              </div>
            )}
          </section>
        </article>

        <footer className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4 pt-4">
          <Button
            onClick={(e) => {
              e.preventDefault();
              navigate(-1);
            }}
          >
            Back
          </Button>
          <p
            className="text-[12px] font-normal"
            style={{ color: publicColors.neutralLight }}
          >
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </footer>
      </main>
    </AppLayout>
  );
};

export default UserDetailsPage;
