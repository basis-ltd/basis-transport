import {
  faBus,
  faChartLine,
  faMapMarkerAlt,
  faUsers,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons';

export interface NavigationItem {
  title: string;
  path: string;
  icon: IconDefinition;
  subCategories?: NavigationItem[];
  roles?: string[];
}

export const SIDEBAR_NAV_ITEMS: NavigationItem[] = [
  {
    title: 'Saved journeys',
    path: `/saved`,
    icon: faChartLine,
    roles: ['ADMIN', 'USER', 'DRIVER', 'SUPER_ADMIN'],
  },
  {
    title: 'Plan a journey',
    path: `/travel`,
    icon: faBus,
    roles: ['ADMIN', 'USER', 'DRIVER', 'SUPER_ADMIN'],
  },
  {
    title: 'Users',
    path: `/users`,
    icon: faUsers,
    roles: ['ADMIN', 'SUPER_ADMIN'],
  },
  {
    title: 'Network administration',
    path: `/admin/network`,
    icon: faMapMarkerAlt,
    roles: ['ADMIN', 'SUPER_ADMIN'],
  },
];

const filterNavigationItemsByRoles = (
  items: NavigationItem[],
  roleNames: string[],
): NavigationItem[] => {
  return items.flatMap((item) => {
    const isAllowed =
      !item.roles?.length || roleNames.some((roleName) => item.roles?.includes(roleName));

    if (!isAllowed) {
      return [];
    }

    return [
      {
        ...item,
        subCategories: item.subCategories
          ? filterNavigationItemsByRoles(item.subCategories, roleNames)
          : undefined,
      },
    ];
  });
};

export const getSidebarNavigationForUser = (
  roleNames: string[] = [],
): NavigationItem[] => {
  if (!roleNames.length) {
    return [];
  }

  return filterNavigationItemsByRoles(SIDEBAR_NAV_ITEMS, roleNames);
};
