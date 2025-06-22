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
}

export const SIDEBAR_NAV_ITEMS: NavigationItem[] = [
  {
    title: 'Dashboard',
    path: `/dashboard`,
    icon: faChartLine,
  },
  {
    title: 'Trips',
    path: `/trips`,
    icon: faBus,
  },
  {
    title: 'Users',
    path: `/users`,
    icon: faUsers,
  },
  {
    title: 'Locations',
    path: `/locations`,
    icon: faMapMarkerAlt,
  },
];
