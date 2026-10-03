/**
 * category-plp-data.js — Product data for all Category PLP pages.
 * Keyed by route slug. category-page.js reads window.categoryPlpData[slug].
 * Future: replace with API fetch per category.
 */

const categoryPlpData = {

  // Trending data is fetched live from the backend API (/api/products/trending)
  trending: [],

  // Mobiles data is fetched live from the backend API (PostgreSQL + Cloudinary)
  mobiles: [],

  // TVs data is fetched live from the backend API (PostgreSQL + Cloudinary)
  tvs: [],

  // ACs data is fetched live from the backend API (PostgreSQL + Cloudinary)
  acs: [],

  'home-theatres': [
    { id: 501, brand: 'Sony',    name: 'HT-A9 4.0ch Dolby Atmos',  rating: 4.8, reviews:  240, originalPrice:  99990, salePrice:  84990, discount: 15, badge: 'Premium', badgeType: 'primary', color: '#374151' },
    { id: 502, brand: 'Samsung', name: 'Q990C 11.1.4ch Soundbar',  rating: 4.7, reviews:  180, originalPrice:  89990, salePrice:  74990, discount: 17, badge: 'Dolby',   badgeType: 'accent',  color: '#1e3d8f' },
    { id: 503, brand: 'LG',      name: 'SP11RA 7.1.4ch Soundbar',  rating: 4.6, reviews:  150, originalPrice:  69990, salePrice:  57990, discount: 17, badge: null,      badgeType: 'primary', color: '#b85e00' },
    { id: 504, brand: 'Bose',    name: 'Smart Soundbar 900',       rating: 4.8, reviews:  320, originalPrice:  84990, salePrice:  71990, discount: 15, badge: 'Top Pick',badgeType: 'success', color: '#374151' },
    { id: 505, brand: 'JBL',     name: 'Bar 1300 11.1.4ch',        rating: 4.5, reviews:  210, originalPrice:  74990, salePrice:  62990, discount: 16, badge: null,      badgeType: 'accent',  color: '#0ea5e9' },
    { id: 506, brand: 'Yamaha',  name: 'YHT-4950U 5.1ch System',   rating: 4.4, reviews:  280, originalPrice:  39990, salePrice:  33990, discount: 15, badge: 'Value',   badgeType: 'primary', color: '#1e3d8f' },
    { id: 507, brand: 'Denon',   name: 'DHT-S517 Soundbar',        rating: 4.5, reviews:  160, originalPrice:  44990, salePrice:  37990, discount: 16, badge: null,      badgeType: 'primary', color: '#374151' },
    { id: 508, brand: 'Philips', name: 'TAB8905 3.1ch Soundbar',   rating: 4.2, reviews:  190, originalPrice:  29990, salePrice:  24990, discount: 17, badge: null,      badgeType: 'accent',  color: '#374151' },
  ],

  // Kitchen Appliances — temporarily unavailable (not in showroom inventory).
  // To re-enable: restore product data here and in src/config/categoryConfig.js.
  kitchen: [],

  // Refrigerators — temporarily unavailable (not in showroom inventory).
  // To re-enable: restore product data here and in src/config/categoryConfig.js.
  refrigerators: [],

};

window.categoryPlpData = categoryPlpData;
