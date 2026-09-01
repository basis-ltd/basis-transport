import CustomPopover from "@/components/custom/CustomPopover";
import BackButton from "@/components/inputs/BackButton";
import Button from "@/components/inputs/Button";
import StatusBadge from "@/components/inputs/StatusBadge";
import {
  DetailList,
  IdentityCard,
  PageBody,
  PageFooter,
  PageHeader,
  PageSection,
} from "@/components/layout/PageShell";
import {
  ellipsisHClassName,
  tableActionClassName,
} from "@/constants/input.constants";
import { Gender, getGenderLabel } from "@/constants/user.constants";
import { capitalizeString } from "@/helpers/strings.helper";
import { useAppSelector } from "@/states/hooks";
import { faPenToSquare } from "@fortawesome/free-regular-svg-icons";
import {
  faBus,
  faCreditCard,
  faEllipsisH,
  faKey,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

const quickActions = [
  {
    to: "/saved",
    icon: faCreditCard,
    title: "Saved places and journeys",
    description: "Keep your usual connections close.",
  },
  {
    to: "/travel",
    icon: faBus,
    title: "Plan a journey",
    description: "Find a connection through the bus network.",
  },
];

const UserProfilePage = () => {
  const { user } = useAppSelector((state) => state.auth);

  if (!user) {
    return (
      <PageBody>
        <PageHeader eyebrow="Account" title="My profile" />
        <PageSection>
          <p className="type-body-sm text-(--muted)">
            We couldn’t load your profile. Sign in again to continue.
          </p>
          <div>
            <Button primary route="/auth/login">
              Sign in
            </Button>
          </div>
        </PageSection>
      </PageBody>
    );
  }

  return (
    <PageBody>
      <PageHeader
        eyebrow="Account"
        title="My profile"
        description="Manage your personal information and preferences."
        actions={
          <CustomPopover
            trigger={
              <button
                type="button"
                aria-label="Profile actions"
                className={ellipsisHClassName}
              >
                <FontAwesomeIcon icon={faEllipsisH} />
              </button>
            }
          >
            <menu className="flex w-full flex-col gap-1">
              <Link to="/account/profile/edit" className={tableActionClassName}>
                <FontAwesomeIcon icon={faPenToSquare} aria-hidden="true" />
                Edit profile
              </Link>
              <Link
                to="/account/profile/change-password"
                className={tableActionClassName}
              >
                <FontAwesomeIcon icon={faKey} aria-hidden="true" />
                Change password
              </Link>
            </menu>
          </CustomPopover>
        }
      />

      <IdentityCard
        name={user.name}
        email={user.email}
        status={user.status ? <StatusBadge status={user.status} /> : null}
      />

      <PageSection
        title="Personal information"
        description="Your basic profile details."
      >
        <DetailList
          items={[
            {
              label: "Phone number",
              value: user.phoneNumber || "Not provided",
            },
            {
              label: "Gender",
              value: getGenderLabel(user.gender || Gender.MALE),
            },
            {
              label: "Nationality",
              value: user.nationality || "Not provided",
            },
            {
              label: "Account created",
              value: user.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : "Not available",
            },
          ]}
        />
      </PageSection>

      <PageSection
        title="Roles and permissions"
        description="Your assigned roles and access levels."
      >
        {user.userRoles?.length ? (
          <ul className="flex flex-wrap gap-2">
            {user.userRoles.map((userRole, index) => (
              <li
                key={index}
                className="rounded-(--radius-pill) border border-(--line) bg-(--surface) px-3 py-1.5 text-sm font-medium text-(--ink)"
              >
                {capitalizeString(userRole?.role?.name)}
              </li>
            ))}
          </ul>
        ) : (
          <p className="type-body-sm text-(--muted)">
            No roles assigned yet. Ask your administrator to assign one.
          </p>
        )}
      </PageSection>

      <PageSection
        title="Quick actions"
        description="The places you visit most."
      >
        <nav className="grid gap-4 sm:grid-cols-2">
          {quickActions.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="group flex items-start gap-3 rounded-(--radius-control) border border-(--line) bg-(--surface-sunken) p-4 transition-[background-color,border-color,box-shadow] duration-200 ease-(--ease-flat) hover:border-(--line-strong) hover:bg-(--surface) hover:shadow-(--shadow-card)"
            >
              <span
                aria-hidden="true"
                className="flex size-9 shrink-0 items-center justify-center rounded-(--radius-control) bg-(--accent-surface) text-(--accent-ink)"
              >
                <FontAwesomeIcon icon={action.icon} className="size-4" />
              </span>
              <span className="flex min-w-0 flex-col gap-1">
                <span className="type-label">{action.title}</span>
                <span className="type-meta">{action.description}</span>
              </span>
            </Link>
          ))}
        </nav>
      </PageSection>

      <PageFooter>
        <BackButton />
      </PageFooter>
    </PageBody>
  );
};

export default UserProfilePage;
