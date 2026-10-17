/**
 * home-products.js — Product data for all Home page carousel sections.
 * Keyed by category slug so home-slider.js can render each section independently.
 */

const homeProductsData = {
  // Live ranked data fetched via /api/products/trending
  trending: [],

  // Live category data fetched via /api/products/category/mobiles
  mobiles: [],

  // Live category data fetched via /api/products/category/tvs
  tvs: [],

  // Live category data fetched via /api/products/category/acs
  acs: [],

  // Live category data fetched via /api/products/category/home-theatres
  homeTheatres: [],

  // Kitchen Appliances — temporarily unavailable in showroom inventory
  kitchen: [],

  // Refrigerators — temporarily unavailable in showroom inventory
  refrigerators: [],
};

window.homeProductsData = homeProductsData;
