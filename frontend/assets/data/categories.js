/**
 * categories.js — Shop by category data
 * Future migration: API endpoint or React prop.
 */

const categoriesData = [
  {
    id: 'mobiles',
    label: 'Mobiles',
    description: 'Latest smartphones',
    href: '#featured',
    color: '#1e3d8f',
    bgColor: 'rgba(30, 61, 143, 0.08)',
    icon: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="13" y="6" width="22" height="36" rx="5" stroke="currentColor" stroke-width="2.5" fill="none"/>
      <circle cx="24" cy="37" r="2" fill="currentColor"/>
      <rect x="19" y="10" width="10" height="2" rx="1" fill="currentColor"/>
    </svg>`,
  },
  {
    id: 'tvs',
    label: 'TVs',
    description: 'Smart & OLED TVs',
    href: '#featured',
    color: '#b85e00',
    bgColor: 'rgba(184, 94, 0, 0.08)',
    icon: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="10" width="36" height="24" rx="3" stroke="currentColor" stroke-width="2.5" fill="none"/>
      <rect x="14" y="16" width="20" height="12" rx="1.5" fill="currentColor" opacity="0.15"/>
      <path d="M18 38 L30 38" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M24 34 L24 38" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`,
  },
  {
    id: 'air-conditioners',
    label: 'Air Conditioners',
    description: 'Split & window ACs',
    href: '#featured',
    color: '#0369a1',
    bgColor: 'rgba(3, 105, 161, 0.08)',
    icon: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="14" width="36" height="16" rx="4" stroke="currentColor" stroke-width="2.5" fill="none"/>
      <circle cx="36" cy="22" r="3" fill="currentColor" opacity="0.3" stroke="currentColor" stroke-width="1.5"/>
      <path d="M12 22 L28 22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M10 32 Q14 36 18 32 Q22 28 26 32 Q30 36 34 32" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>
    </svg>`,
  },
  {
    id: 'refrigerators',
    label: 'Refrigerators',
    description: 'Double door & side-by-side',
    href: '#featured',
    color: '#047857',
    bgColor: 'rgba(4, 120, 87, 0.08)',
    icon: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="12" y="4" width="24" height="40" rx="4" stroke="currentColor" stroke-width="2.5" fill="none"/>
      <path d="M12 22 L36 22" stroke="currentColor" stroke-width="2.5"/>
      <path d="M30 13 L30 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M30 27 L30 35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
  },
  {
    id: 'kitchen',
    label: 'Kitchen Appliances',
    description: 'Mixers, microwaves & more',
    href: '#featured',
    color: '#9333ea',
    bgColor: 'rgba(147, 51, 234, 0.08)',
    icon: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 10 L16 26 C16 30.4 19.6 34 24 34 C28.4 34 32 30.4 32 26 L32 10" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M20 10 L20 20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M24 10 L24 22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M28 10 L28 20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M18 34 L30 34 L32 42 L16 42 Z" stroke="currentColor" stroke-width="2" fill="none"/>
    </svg>`,
  },
  {
    id: 'accessories',
    label: 'Accessories',
    description: 'Cases, chargers & cables',
    href: '#featured',
    color: '#dc2626',
    bgColor: 'rgba(220, 38, 38, 0.08)',
    icon: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="10" stroke="currentColor" stroke-width="2.5" fill="none"/>
      <circle cx="24" cy="24" r="4" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="1.5"/>
      <path d="M24 8 L24 14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M24 34 L24 40" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M8 24 L14 24" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M34 24 L40 24" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`,
  },
];

window.categoriesData = categoriesData;
