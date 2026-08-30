import BackButton from '@/components/inputs/BackButton';
import StatusBadge from '@/components/inputs/StatusBadge';
import {
  DetailList,
  IdentityCard,
  PageBody,
  PageFooter,
  PageHeader,
  PageSection,
} from '@/components/layout/PageShell';
import { Gender, getGenderLabel } from '@/constants/user.constants';
import AppLayout from '@/containers/navigation/AppLayout';
import { capitalizeString } from '@/helpers/strings.helper';
import { useAppSelector } from '@/states/hooks';
import { useGetUserById } from '@/usecases/users/user.hooks';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

const UserDetailsPage = () => {
  const { user } = useAppSelector((state) => state.user);
  const { id } = useParams();
  const { getUserById, userIsFetching } = useGetUserById();

  useEffect(() => {
    if (id) {
      getUserById(id);
    }
  }, [getUserById, id]);

  if (userIsFetching || !user) {
    return (
      <AppLayout>
        <PageBody>
          <PageHeader title="User details" />
          <PageSection>
            <p className="type-body-sm text-(--muted)">
              {userIsFetching
                ? 'Loading this user’s details…'
                : 'We couldn’t find this user. They may have been removed.'}
            </p>
            {!userIsFetching ? (
              <div>
                <BackButton />
              </div>
            ) : null}
          </PageSection>
        </PageBody>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageBody>
        <PageHeader
          title="User details"
          description={`Profile, roles, and access for ${user.name}.`}
        />

        <IdentityCard
          name={user.name}
          email={user.email}
          status={<StatusBadge status={user.status} />}
        />

        <PageSection
          title="Personal information"
          description="Basic profile details."
        >
          <DetailList
            items={[
              { label: 'Phone number', value: user.phoneNumber || 'Not provided' },
              {
                label: 'Gender',
                value: getGenderLabel(user.gender || Gender.MALE),
              },
              { label: 'Nationality', value: user.nationality || 'Not provided' },
              {
                label: 'Account created',
                value: user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : 'Not available',
              },
            ]}
          />
        </PageSection>

        <PageSection
          title="Roles and permissions"
          description="Assigned roles and access levels."
        >
          {user.userRoles?.length ? (
            <ul className="flex flex-wrap gap-2">
              {user.userRoles.map((userRole, index) => (
                <li
                  key={index}
                  className="rounded-(--radius-pill) bg-(--surface) px-3 py-1.5 text-sm text-(--ink)"
                >
                  {capitalizeString(userRole?.role?.name)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="type-body-sm text-(--muted)">
              No roles assigned yet. Assign one to control what this user can
              reach.
            </p>
          )}
        </PageSection>

        <PageFooter>
          <BackButton />
        </PageFooter>
      </PageBody>
    </AppLayout>
  );
};

export default UserDetailsPage;
