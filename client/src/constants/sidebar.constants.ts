import {
  faBus,
  faChartLine,
  faMapMarkerAlt,
  faUsers,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons';

interface NavigationItem {
  title: string;
  path: string;
  icon: IconDefinition;
  subcategories?: NavigationItem[];
  roles?: string[];
}

export const SIDEBAR_NAV_ITEMS: NavigationItem[] = [
  {
    title: 'Dashboard',
    path: `/dashboard`,
    icon: faChartLine,
    roles: ['ADMIN', 'USER', 'DRIVER', 'SUPER_ADMIN'],
  },
  {
    title: 'Trips',
    path: `/trips`,
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
    title: 'Locations',
    path: `/locations`,
    icon: faMapMarkerAlt,
    roles: ['ADMIN', 'SUPER_ADMIN'],
  },
];
