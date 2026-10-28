export interface NavLink {
  href: string;
  label: string;
}

export interface NavGroup {
  title: string;
  links: NavLink[];
}

/** Primary navigation shared by the desktop header and mobile menu. */
export const primaryNav: NavLink[] = [
  { href: '/directory', label: 'Browse' },
  { href: '/map', label: 'Map' },
  { href: '/ecosystem', label: 'Ecosystem' },
  { href: '/stats', label: 'Stats' },
  { href: '/get-involved', label: 'Get Involved' },
  { href: '/contact', label: 'Contact' },
];

/** Grouped footer navigation, kept in one place so new pages are easy to add. */
export const footerNav: NavGroup[] = [
  {
    title: 'Browse',
    links: [
      { href: '/directory', label: 'Directory' },
      { href: '/map', label: 'Map' },
      { href: '/domains', label: 'Domains' },
      { href: '/stats', label: 'Stats' },
      { href: '/regions', label: 'Regions' },
      { href: '/tags', label: 'Tags' },
      { href: '/saved', label: 'Saved' },
    ],
  },
  {
    title: 'Info',
    links: [
      { href: '/get-involved', label: 'Get Involved' },
      { href: '/contact', label: 'Contact' },
      { href: '/saved', label: 'Saved' },
    ],
  },
];
