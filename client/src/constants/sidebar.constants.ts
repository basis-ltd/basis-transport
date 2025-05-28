import { faBus, IconDefinition } from '@fortawesome/free-solid-svg-icons';

interface NavigationItem {
  title: string;
  path: string;
  icon: IconDefinition;
  subcategories?: NavigationItem[];
}

export const SIDEBAR_NAV_ITEMS: NavigationItem[] = [
  {
    title: 'Trips',
    path: `/trips`,
    icon: faBus,
  },
];
