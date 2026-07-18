/**
 * home-banners.js — Hero carousel data for the Home page.
 */

const homeBannersData = [
  {
    id: 1,
    eyebrow: 'Trending Now',
    title: 'Deals of the Day',
    subtitle: 'Top offers on Mobiles, TVs, ACs and more. Updated every day.',
    cta:    { label: 'Shop Now',         href: '/products' },
    ctaAlt: { label: 'Trending Deals',   href: '/products' },
    badge:  'Limited Time',
    bg:     'linear-gradient(135deg, #0d1e4d 0%, #1e3d8f 60%, #2f52a0 100%)',
    accent: '#f58500',
    icon: 'deals',
  },
  {
    id: 2,
    eyebrow: 'New Arrivals',
    title: 'Latest Smartphones',
    subtitle: 'Apple, Samsung, OnePlus — brand new launches at best prices.',
    cta:    { label: 'Explore Mobiles',  href: '/products/mobiles' },
    ctaAlt: { label: 'View All',         href: '/products' },
    badge:  'Just Launched',
    bg:     'linear-gradient(135deg, #1a0a00 0%, #6b2d00 55%, #b85e00 100%)',
    accent: '#fbbf24',
    icon: 'mobile',
  },
  {
    id: 3,
    eyebrow: 'Zero Cost EMI',
    title: '0% EMI On Everything',
    subtitle: 'Instant approval. Zero interest. Flexible plans via TVS Credit & Bajaj Finserv.',
    cta:    { label: 'Know Eligibility', href: 'tel:9963657799' },
    ctaAlt: { label: 'Browse Products',  href: '/products' },
    badge:  'Zero Down Payment',
    bg:     'linear-gradient(135deg, #0a2218 0%, #0d4a2e 55%, #166534 100%)',
    accent: '#22c55e',
    icon: 'emi',
  },
  {
    id: 4,
    eyebrow: 'Big TV Sale',
    title: 'Premium TVs & Home Theatres',
    subtitle: 'OLED, QLED and Neo QLED. Massive screens, massive discounts.',
    cta:    { label: 'Shop TVs',         href: '/products/tvs' },
    ctaAlt: { label: 'Home Theatres',    href: '/products/home-theatres' },
    badge:  'Up to 25% Off',
    bg:     'linear-gradient(135deg, #1a0d2e 0%, #3b1f6b 55%, #5a2ea0 100%)',
    accent: '#a78bfa',
    icon: 'tv',
  },
];

window.homeBannersData = homeBannersData;
