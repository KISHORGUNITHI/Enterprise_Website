/**
 * banners.js — Hero carousel slide data
 * Future migration: export default bannersData as a React constant or API response.
 */

const bannersData = [
  {
    id: 1,
    eyebrow: 'New Arrivals 2025',
    title: 'Latest Smartphones',
    subtitle: 'Premium flagship phones from Apple, Samsung & OnePlus. Get the best deals in town.',
    cta_primary: { label: 'Explore Products', href: '#featured' },
    cta_secondary: { label: 'Visit Store', href: '#location' },
    badge: 'Up to ₹5,000 Off',
    bgGradient: 'linear-gradient(135deg, #0d1e4d 0%, #1e3d8f 60%, #2f52a0 100%)',
    accentColor: '#f58500',
    illustration: 'smartphone',
  },
  {
    id: 2,
    eyebrow: 'Festival Season Offers',
    title: 'Big Festival Sale',
    subtitle: 'Unbeatable prices on TVs, ACs, and Refrigerators. Limited time offers — don\'t miss out.',
    cta_primary: { label: 'Shop Offers', href: '#categories' },
    cta_secondary: { label: 'Call Now', href: 'tel:9963657799' },
    badge: '20% Off Selected Items',
    bgGradient: 'linear-gradient(135deg, #1a0a00 0%, #6b2d00 55%, #b85e00 100%)',
    accentColor: '#f58500',
    illustration: 'festival',
  },
  {
    id: 3,
    eyebrow: 'Zero Cost EMI',
    title: '0% Interest EMI',
    subtitle: 'Buy now, pay later with zero interest. Instant approval on TVS Credit & Bajaj Finserv.',
    cta_primary: { label: 'Know Eligibility', href: 'tel:9963657799' },
    cta_secondary: { label: 'Explore Products', href: '#featured' },
    badge: 'Zero Down Payment',
    bgGradient: 'linear-gradient(135deg, #0a2218 0%, #0d4a2e 55%, #166534 100%)',
    accentColor: '#22c55e',
    illustration: 'emi',
  },
  {
    id: 4,
    eyebrow: 'Exchange & Upgrade',
    title: 'Exchange Your Old Device',
    subtitle: 'Get the best exchange value for your old electronics. Upgrade to latest models today.',
    cta_primary: { label: 'Get Exchange Value', href: 'tel:9963657799' },
    cta_secondary: { label: 'Visit Store', href: '#location' },
    badge: 'Best Exchange Rates',
    bgGradient: 'linear-gradient(135deg, #1a0d2e 0%, #3b1f6b 55%, #5a2ea0 100%)',
    accentColor: '#a78bfa',
    illustration: 'exchange',
  },
  {
    id: 5,
    eyebrow: 'Official Warranty',
    title: 'Genuine Products Only',
    subtitle: 'Every product comes with official brand warranty. Shop with confidence from Enterprise Store.',
    cta_primary: { label: 'Shop Now', href: '#categories' },
    cta_secondary: { label: 'Learn More', href: '#trust' },
    badge: '100% Official Warranty',
    bgGradient: 'linear-gradient(135deg, #0f1a30 0%, #1e3560 55%, #2952a0 100%)',
    accentColor: '#60a5fa',
    illustration: 'warranty',
  },
];

// Expose globally for hero-slider.js to consume
window.bannersData = bannersData;
