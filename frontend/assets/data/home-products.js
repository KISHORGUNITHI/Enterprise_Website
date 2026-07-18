/**
 * home-products.js — Product data for all Home page carousel sections.
 * Keyed by category slug so home-slider.js can render each section independently.
 */

const homeProductsData = {

  trending: [
    { id: 101, brand: 'Samsung',  name: 'Galaxy S24 Ultra',             category: 'Mobiles',  rating: 4.8, reviews: 2340, originalPrice: 134999, salePrice: 119999, discount: 11, badge: 'Bestseller', badgeType: 'primary', color: '#1e3d8f' },
    { id: 102, brand: 'Apple',    name: 'iPhone 15 Pro Max',             category: 'Mobiles',  rating: 4.9, reviews: 4120, originalPrice: 159900, salePrice: 149900, discount:  6, badge: 'Top Rated',  badgeType: 'accent',  color: '#374151' },
    { id: 103, brand: 'LG',       name: 'OLED C3 65" Smart TV',          category: 'TVs',      rating: 4.7, reviews:  890, originalPrice: 189990, salePrice: 159990, discount: 16, badge: 'Hot Deal',   badgeType: 'accent',  color: '#b85e00' },
    { id: 104, brand: 'Daikin',   name: '1.5 Ton 5-Star Inverter AC',    category: 'ACs',      rating: 4.6, reviews: 1450, originalPrice:  52990, salePrice:  44990, discount: 15, badge: '5 Star',     badgeType: 'success', color: '#0369a1' },
    { id: 105, brand: 'OnePlus',  name: 'OnePlus 12 5G',                 category: 'Mobiles',  rating: 4.7, reviews: 1870, originalPrice:  64999, salePrice:  56999, discount: 12, badge: 'New',        badgeType: 'primary', color: '#dc2626' },
    { id: 106, brand: 'Samsung',  name: '55" QLED 4K Smart TV',          category: 'TVs',      rating: 4.5, reviews:  670, originalPrice:  89999, salePrice:  74999, discount: 17, badge: 'Sale',       badgeType: 'accent',  color: '#1e3d8f' },
    { id: 107, brand: 'Whirlpool',name: '340L Double Door Refrigerator', category: 'Fridges',  rating: 4.4, reviews:  540, originalPrice:  38990, salePrice:  32990, discount: 15, badge: 'Popular',    badgeType: 'primary', color: '#047857' },
    { id: 108, brand: 'Sony',     name: 'WH-1000XM5 Headphones',         category: 'Acc',      rating: 4.8, reviews: 3100, originalPrice:  29990, salePrice:  24990, discount: 17, badge: 'Award Win',  badgeType: 'accent',  color: '#374151' },
  ],

  mobiles: [
    { id: 201, brand: 'Samsung',  name: 'Galaxy S24+',         rating: 4.7, reviews: 1820, originalPrice:  99999, salePrice:  89999, discount: 10, badge: 'New',       badgeType: 'primary', color: '#1e3d8f' },
    { id: 202, brand: 'Apple',    name: 'iPhone 15',           rating: 4.8, reviews: 3200, originalPrice: 109900, salePrice:  99900, discount:  9, badge: 'Popular',   badgeType: 'accent',  color: '#374151' },
    { id: 203, brand: 'OnePlus',  name: 'OnePlus Nord 3',      rating: 4.5, reviews:  980, originalPrice:  33999, salePrice:  29999, discount: 12, badge: 'Value',     badgeType: 'success', color: '#dc2626' },
    { id: 204, brand: 'Xiaomi',   name: 'Redmi Note 13 Pro+',  rating: 4.4, reviews: 2100, originalPrice:  31999, salePrice:  26999, discount: 16, badge: 'Trending',  badgeType: 'accent',  color: '#f97316' },
    { id: 205, brand: 'Realme',   name: 'Realme GT 5 Pro',     rating: 4.3, reviews:  760, originalPrice:  35999, salePrice:  29999, discount: 17, badge: null,        badgeType: 'primary', color: '#facc15' },
    { id: 206, brand: 'Vivo',     name: 'Vivo V29 Pro',        rating: 4.4, reviews:  890, originalPrice:  39999, salePrice:  34999, discount: 13, badge: null,        badgeType: 'accent',  color: '#6366f1' },
    { id: 207, brand: 'OPPO',     name: 'OPPO Reno 11 Pro',    rating: 4.3, reviews:  540, originalPrice:  35999, salePrice:  30999, discount: 14, badge: null,        badgeType: 'primary', color: '#0ea5e9' },
    { id: 208, brand: 'Google',   name: 'Pixel 8 Pro',         rating: 4.7, reviews: 1230, originalPrice:  89999, salePrice:  79999, discount: 11, badge: 'AI Camera', badgeType: 'success', color: '#16a34a' },
  ],

  tvs: [
    { id: 301, brand: 'Samsung',  name: 'Neo QLED 8K 75"',          rating: 4.8, reviews:  320, originalPrice: 349999, salePrice: 299999, discount: 14, badge: 'Premium',   badgeType: 'primary', color: '#1e3d8f' },
    { id: 302, brand: 'LG',       name: 'OLED C3 55"',              rating: 4.7, reviews:  890, originalPrice: 139990, salePrice: 119990, discount: 14, badge: 'Hot Deal',  badgeType: 'accent',  color: '#b85e00' },
    { id: 303, brand: 'Sony',     name: 'Bravia XR A80L 65"',       rating: 4.6, reviews:  470, originalPrice: 189990, salePrice: 159990, discount: 16, badge: null,        badgeType: 'primary', color: '#374151' },
    { id: 304, brand: 'TCL',      name: 'QLED C745 55"',            rating: 4.4, reviews:  650, originalPrice:  69999, salePrice:  54999, discount: 21, badge: 'Value',     badgeType: 'success', color: '#dc2626' },
    { id: 305, brand: 'Hisense',  name: 'ULED U7K 55"',             rating: 4.3, reviews:  410, originalPrice:  74999, salePrice:  59999, discount: 20, badge: null,        badgeType: 'accent',  color: '#0369a1' },
    { id: 306, brand: 'Mi',       name: 'Xiaomi TV X Pro 43"',      rating: 4.2, reviews: 1200, originalPrice:  34999, salePrice:  27999, discount: 20, badge: 'Budget',    badgeType: 'primary', color: '#f97316' },
    { id: 307, brand: 'OnePlus',  name: 'OnePlus TV Q2 Pro 65"',    rating: 4.5, reviews:  380, originalPrice:  84999, salePrice:  69999, discount: 18, badge: null,        badgeType: 'accent',  color: '#dc2626' },
    { id: 308, brand: 'Vu',       name: 'Vu GloLED 55"',            rating: 4.1, reviews:  290, originalPrice:  42999, salePrice:  34999, discount: 19, badge: null,        badgeType: 'primary', color: '#047857' },
  ],

  acs: [
    { id: 401, brand: 'Daikin',   name: '1.5T 5★ Inverter Split AC',  rating: 4.7, reviews: 1450, originalPrice:  52990, salePrice:  44990, discount: 15, badge: '5 Star',    badgeType: 'success', color: '#0369a1' },
    { id: 402, brand: 'Voltas',   name: '1.5T 3★ Window AC',          rating: 4.3, reviews:  780, originalPrice:  34990, salePrice:  27990, discount: 20, badge: 'Budget',    badgeType: 'primary', color: '#0ea5e9' },
    { id: 403, brand: 'Hitachi',  name: '1T 5★ Inverter AC',          rating: 4.5, reviews:  620, originalPrice:  44990, salePrice:  37990, discount: 16, badge: null,        badgeType: 'accent',  color: '#374151' },
    { id: 404, brand: 'Blue Star', name: '2T 3★ Split AC',            rating: 4.4, reviews:  510, originalPrice:  48990, salePrice:  41990, discount: 14, badge: null,        badgeType: 'primary', color: '#1e3d8f' },
    { id: 405, brand: 'LG',       name: '1.5T DUAL Inverter AC',      rating: 4.6, reviews:  930, originalPrice:  49990, salePrice:  42490, discount: 15, badge: 'Popular',   badgeType: 'accent',  color: '#b85e00' },
    { id: 406, brand: 'Samsung',  name: '1.5T 5★ Wind-Free AC',       rating: 4.5, reviews:  840, originalPrice:  55990, salePrice:  47490, discount: 15, badge: null,        badgeType: 'primary', color: '#1e3d8f' },
    { id: 407, brand: 'Carrier',  name: '1.5T 3★ Split AC',           rating: 4.2, reviews:  370, originalPrice:  38990, salePrice:  32990, discount: 15, badge: null,        badgeType: 'accent',  color: '#0ea5e9' },
    { id: 408, brand: 'Panasonic',name: '1T 5★ Inverter AC',          rating: 4.4, reviews:  410, originalPrice:  42990, salePrice:  35990, discount: 16, badge: null,        badgeType: 'success', color: '#047857' },
  ],

  homeTheatres: [
    { id: 501, brand: 'Sony',     name: 'HT-A9 4.0ch Dolby Atmos',   rating: 4.8, reviews:  240, originalPrice:  99990, salePrice:  84990, discount: 15, badge: 'Premium',   badgeType: 'primary', color: '#374151' },
    { id: 502, brand: 'Samsung',  name: 'Q990C 11.1.4ch Soundbar',   rating: 4.7, reviews:  180, originalPrice:  89990, salePrice:  74990, discount: 17, badge: 'Dolby',     badgeType: 'accent',  color: '#1e3d8f' },
    { id: 503, brand: 'LG',       name: 'SP11RA 7.1.4ch Soundbar',   rating: 4.6, reviews:  150, originalPrice:  69990, salePrice:  57990, discount: 17, badge: null,        badgeType: 'primary', color: '#b85e00' },
    { id: 504, brand: 'Bose',     name: 'Smart Soundbar 900',        rating: 4.8, reviews:  320, originalPrice:  84990, salePrice:  71990, discount: 15, badge: 'Top Pick',  badgeType: 'success', color: '#374151' },
    { id: 505, brand: 'JBL',      name: 'Bar 1300 11.1.4ch',         rating: 4.5, reviews:  210, originalPrice:  74990, salePrice:  62990, discount: 16, badge: null,        badgeType: 'accent',  color: '#0ea5e9' },
    { id: 506, brand: 'Yamaha',   name: 'YHT-4950U 5.1ch System',    rating: 4.4, reviews:  280, originalPrice:  39990, salePrice:  33990, discount: 15, badge: 'Value',     badgeType: 'primary', color: '#1e3d8f' },
    { id: 507, brand: 'Philips',  name: 'TAB8905 3.1ch Soundbar',    rating: 4.2, reviews:  190, originalPrice:  29990, salePrice:  24990, discount: 17, badge: null,        badgeType: 'accent',  color: '#374151' },
    { id: 508, brand: 'Denon',    name: 'DHT-S517 Soundbar',         rating: 4.5, reviews:  160, originalPrice:  44990, salePrice:  37990, discount: 16, badge: null,        badgeType: 'primary', color: '#374151' },
  ],

  kitchen: [
    { id: 601, brand: 'IFB',      name: '25L Convection Microwave',  rating: 4.5, reviews:  820, originalPrice:  14990, salePrice:  12490, discount: 17, badge: 'Popular',   badgeType: 'primary', color: '#9333ea' },
    { id: 602, brand: 'Bosch',    name: 'Series 6 Washing Machine',  rating: 4.7, reviews:  630, originalPrice:  49990, salePrice:  42990, discount: 14, badge: 'Top Brand', badgeType: 'accent',  color: '#374151' },
    { id: 603, brand: 'Philips',  name: 'HL7756 750W Mixer Grinder', rating: 4.4, reviews: 1200, originalPrice:   4999, salePrice:   3499, discount: 30, badge: '30% Off',   badgeType: 'accent',  color: '#0369a1' },
    { id: 604, brand: 'LG',       name: '6.5 Kg Top Load Washer',    rating: 4.3, reviews:  740, originalPrice:  28990, salePrice:  23990, discount: 17, badge: null,        badgeType: 'primary', color: '#b85e00' },
    { id: 605, brand: 'Havells',  name: 'Ebony OTG 28L',             rating: 4.3, reviews:  540, originalPrice:   7990, salePrice:   5990, discount: 25, badge: 'Deal',      badgeType: 'accent',  color: '#dc2626' },
    { id: 606, brand: 'Prestige', name: 'Deluxe Plus Induction',     rating: 4.2, reviews:  890, originalPrice:   3499, salePrice:   2699, discount: 23, badge: null,        badgeType: 'primary', color: '#9333ea' },
    { id: 607, brand: 'Bajaj',    name: 'Magnum 1000W Juicer',       rating: 4.1, reviews:  460, originalPrice:   2999, salePrice:   2299, discount: 23, badge: null,        badgeType: 'accent',  color: '#f97316' },
    { id: 608, brand: 'Samsung',  name: '32L Convection Microwave',  rating: 4.5, reviews:  670, originalPrice:  18990, salePrice:  15990, discount: 16, badge: null,        badgeType: 'primary', color: '#1e3d8f' },
  ],

  refrigerators: [
    { id: 701, brand: 'Samsung',  name: '524L French Door Fridge',   rating: 4.7, reviews:  420, originalPrice:  84999, salePrice:  69999, discount: 18, badge: 'Premium',   badgeType: 'primary', color: '#1e3d8f' },
    { id: 702, brand: 'LG',       name: '655L Side-By-Side Fridge',  rating: 4.6, reviews:  310, originalPrice:  89990, salePrice:  74990, discount: 17, badge: null,        badgeType: 'accent',  color: '#b85e00' },
    { id: 703, brand: 'Whirlpool',name: '340L Double Door',          rating: 4.4, reviews:  540, originalPrice:  38990, salePrice:  32990, discount: 15, badge: 'Popular',   badgeType: 'primary', color: '#047857' },
    { id: 704, brand: 'Haier',    name: '256L 3★ Double Door',       rating: 4.3, reviews:  480, originalPrice:  28990, salePrice:  23990, discount: 17, badge: 'Value',     badgeType: 'success', color: '#0369a1' },
    { id: 705, brand: 'Bosch',    name: '559L Multi Door Fridge',    rating: 4.7, reviews:  220, originalPrice:  94990, salePrice:  79990, discount: 16, badge: 'Premium',   badgeType: 'accent',  color: '#374151' },
    { id: 706, brand: 'Godrej',   name: '236L Direct Cool Fridge',   rating: 4.2, reviews:  670, originalPrice:  22990, salePrice:  18990, discount: 17, badge: null,        badgeType: 'primary', color: '#047857' },
    { id: 707, brand: 'Panasonic',name: '296L 3★ Double Door',       rating: 4.3, reviews:  360, originalPrice:  31990, salePrice:  26990, discount: 16, badge: null,        badgeType: 'accent',  color: '#9333ea' },
    { id: 708, brand: 'Hitachi',  name: '318L Double Door',          rating: 4.5, reviews:  290, originalPrice:  39990, salePrice:  33990, discount: 15, badge: null,        badgeType: 'primary', color: '#374151' },
  ],

};

window.homeProductsData = homeProductsData;
