/**
 * category-page.js — Category PLP interactions.
 * Handles: filter groups collapse, mobile bottom sheet, sort, pagination, product rendering.
 *
 * Architecture:
 * - Mobiles, TVs, ACs : Fetched live from backend API (PostgreSQL + Cloudinary)
 * - Home Theatres      : Read from window.categoryPlpData static data
 * - Kitchen, Fridges   : Inactive — server redirects before this file runs
 */

(function () {
  'use strict';

  // ─── Filter group collapse ────────────────────────────────────────────────
  document.querySelectorAll('.plp-filter-group__toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const group  = btn.closest('.plp-filter-group');
      const isOpen = group.classList.contains('plp-filter-group--open');
      group.classList.toggle('plp-filter-group--open',   !isOpen);
      group.classList.toggle('plp-filter-group--closed',  isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  // ─── Clear filters ────────────────────────────────────────────────────────
  const clearBtn = document.getElementById('plpClearFilters');
  clearBtn && clearBtn.addEventListener('click', () => {
    document.querySelectorAll('.plp-filter-option input[type="checkbox"]')
      .forEach(cb  => { cb.checked = false; });
    document.querySelectorAll('.plp-filter-price__input')
      .forEach(inp => { inp.value  = '';    });
    document.querySelectorAll('.plp-filter-rating__option input')
      .forEach(rb  => { rb.checked = false; });
    renderProducts();
  });

  // ─── Mobile bottom sheet ──────────────────────────────────────────────────
  const filterBtn     = document.getElementById('plpFilterBtn');
  const filterOverlay = document.getElementById('plpFilterOverlay');
  const filterSheet   = document.getElementById('plpFilterSheet');
  const sheetClose    = document.getElementById('plpSheetClose');
  const sheetApply    = document.getElementById('plpSheetApply');

  function openSheet() {
    filterOverlay && filterOverlay.classList.add('open');
    filterSheet   && filterSheet.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeSheet() {
    filterOverlay && filterOverlay.classList.remove('open');
    filterSheet   && filterSheet.classList.remove('open');
    document.body.style.overflow = '';
  }

  filterBtn     && filterBtn.addEventListener('click', openSheet);
  sheetClose    && sheetClose.addEventListener('click', closeSheet);
  sheetApply    && sheetApply.addEventListener('click', () => { closeSheet(); renderProducts(); });
  filterOverlay && filterOverlay.addEventListener('click', closeSheet);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeSheet();
  });

  // ─── Sort ─────────────────────────────────────────────────────────────────
  const sortSelect = document.getElementById('plpSort');
  sortSelect && sortSelect.addEventListener('change', () => {
    currentPage = 1;
    renderProducts();
  });

  // ─── State ────────────────────────────────────────────────────────────────
  const grid     = document.getElementById('plpGrid');
  const countEl  = document.getElementById('plpCount');
  const paginEl  = document.getElementById('plpPagination');
  const SLUG     = document.getElementById('plpRoot')?.dataset.slug || 'mobiles';
  const PER_PAGE = 8;

  let currentPage  = 1;
  let isApiLoading = false;
  let apiError     = null;

  // ─── Helpers ──────────────────────────────────────────────────────────────
  function fmt(n) {
    return '₹' + n.toLocaleString('en-IN');
  }

  function stars(rating) {
    const rId = Math.random().toString(36).slice(2, 8);
    const percent = Math.round((rating % 1) * 100);
    return Array.from({ length: 5 }, (_, i) => {
      let fill = 'var(--gray-300)';
      let defs = '';
      if (rating >= i + 1) {
        fill = 'var(--color-warning-500)';
      } else if (rating > i) {
        fill = `url(#grad-${rId}-${i})`;
        defs = `<defs><linearGradient id="grad-${rId}-${i}" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="${percent}%" stop-color="var(--color-warning-500)" /><stop offset="${percent}%" stop-color="var(--gray-300)" /></linearGradient></defs>`;
      }
      return `<svg class="plp-card__star" style="fill:${fill};" viewBox="0 0 16 16"><path d="M8 1.5l1.8 5.5H16l-4.6 3.3 1.8 5.5L8 11.5l-5.2 3.3 1.8-5.5L0 7h6.2z"/>${defs}</svg>`;
    }).join('');
  }

  function placeholder(color) {
    return `<svg viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="220" height="220" fill="var(--color-bg-tertiary)"/>
      <rect x="55" y="40" width="110" height="140" rx="10" fill="${color}14" stroke="${color}35" stroke-width="1.5"/>
      <rect x="70" y="56" width="80"  height="100" rx="6"  fill="${color}08" stroke="${color}20" stroke-width="1"/>
      <rect x="80" y="70" width="60"  height="5"   rx="2.5" fill="${color}45"/>
      <rect x="80" y="82" width="44"  height="4"   rx="2"   fill="${color}28"/>
      <rect x="80" y="94" width="52"  height="4"   rx="2"   fill="${color}22"/>
      <rect x="80" y="110" width="60" height="18"  rx="6"  fill="${color}28" stroke="${color}45" stroke-width="1"/>
      <circle cx="110" cy="158" r="5" fill="${color}38" stroke="${color}55" stroke-width="1.5"/>
    </svg>`;
  }

  function buildCard(p) {
    const route = `/product/${p.slug || p.id}`;
    const imageContent = p.imageUrl
      ? `<img src="${p.imageUrl}" alt="${p.brand} ${p.name}" class="plp-card__img" loading="lazy" />`
      : placeholder(p.color || '#1e3d8f');

    const isAvailable = p.availability ? p.availability === 'AVAILABLE' : true;
    const badgeText   = p.badge || (isAvailable ? 'In Stock' : 'Out of Stock');
    const badgeCls    = p.badgeType
      ? `plp-card__badge--${p.badgeType}`
      : (isAvailable ? 'plp-card__badge--success' : 'plp-card__badge--primary');

    return `
      <article class="plp-card" role="listitem" aria-label="${p.brand} ${p.name}">
        <div class="plp-card__image-wrap">
          <span class="plp-card__badge ${badgeCls}">${badgeText}</span>
          <div class="plp-card__image-placeholder" aria-hidden="true">
            ${imageContent}
          </div>
        </div>
        <div class="plp-card__body">
          <p class="plp-card__brand">${p.brand}</p>
          <h3 class="plp-card__name">${p.name}</h3>
          <div class="plp-card__rating">
            <div class="plp-card__stars" aria-label="Rating ${p.rating} out of 5">${stars(p.rating)}</div>
            <span class="plp-card__review-count">(${(p.reviews || 0).toLocaleString()})</span>
          </div>
          <div class="plp-card__price">
            <span class="plp-card__price-sale">${fmt(p.salePrice)}</span>
            ${p.originalPrice && p.originalPrice > p.salePrice
              ? `<span class="plp-card__price-original">${fmt(p.originalPrice)}</span>`
              : ''}
            ${p.discount && p.discount > 0
              ? `<span class="plp-card__price-discount">${p.discount}% off</span>`
              : ''}
          </div>
        </div>
        <div class="plp-card__footer">
          <a href="${route}" class="btn btn--primary plp-card__cta">
            View Details
          </a>
        </div>
      </article>`;
  }

  // ─── Filtering & sorting ──────────────────────────────────────────────────
  function getFilteredProducts() {
    if (!window.categoryPlpData) return [];
    const all = window.categoryPlpData[SLUG] || [];

    const checkedBrands = Array.from(
      document.querySelectorAll('.plp-filter-brand input:checked')
    ).map(el => el.value.toLowerCase());

    const minEl = document.getElementById('plpPriceMin');
    const maxEl = document.getElementById('plpPriceMax');
    const min   = minEl && minEl.value ? parseInt(minEl.value) : 0;
    const max   = maxEl && maxEl.value ? parseInt(maxEl.value) : Infinity;

    const ratingEl    = document.querySelector('.plp-filter-rating__option input:checked');
    const minRating   = ratingEl ? parseFloat(ratingEl.value) : 0;

    const discountEl  = document.querySelector('.plp-filter-discount input:checked');
    const minDiscount = discountEl ? parseInt(discountEl.value) : 0;

    let result = all.filter(p => {
      if (checkedBrands.length && !checkedBrands.includes(p.brand.toLowerCase())) return false;
      if (p.salePrice < min || p.salePrice > max) return false;
      if (p.rating < minRating)    return false;
      if (p.discount < minDiscount) return false;
      return true;
    });

    const sort = sortSelect ? sortSelect.value : 'popularity';
    if (sort === 'price-asc')  result.sort((a, b) => a.salePrice - b.salePrice);
    if (sort === 'price-desc') result.sort((a, b) => b.salePrice - a.salePrice);
    if (sort === 'rating')     result.sort((a, b) => b.rating - a.rating);
    if (sort === 'newest')     result.sort((a, b) => (b.id > a.id ? 1 : -1));
    if (sort === 'discount')   result.sort((a, b) => b.discount - a.discount);

    return result;
  }

  // ─── Pagination ───────────────────────────────────────────────────────────
  function renderPagination(total) {
    if (!paginEl) return;
    const totalPages = Math.ceil(total / PER_PAGE);
    if (totalPages <= 1) { paginEl.innerHTML = ''; return; }

    let html = '<div class="plp-pagination__inner">';

    html += `<button class="plp-pagination__btn ${currentPage === 1 ? 'plp-pagination__btn--disabled' : ''}"
      data-page="${currentPage - 1}" aria-label="Previous page">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="10 12 6 8 10 4"/></svg>
    </button>`;

    const range = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
        range.push(i);
      } else if (range[range.length - 1] !== '…') {
        range.push('…');
      }
    }

    range.forEach(p => {
      if (p === '…') {
        html += `<span class="plp-pagination__ellipsis">…</span>`;
      } else {
        html += `<button class="plp-pagination__btn ${p === currentPage ? 'plp-pagination__btn--active' : ''}"
          data-page="${p}" aria-label="Page ${p}" ${p === currentPage ? 'aria-current="page"' : ''}>${p}</button>`;
      }
    });

    html += `<button class="plp-pagination__btn ${currentPage === totalPages ? 'plp-pagination__btn--disabled' : ''}"
      data-page="${currentPage + 1}" aria-label="Next page">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="6 4 10 8 6 12"/></svg>
    </button>`;

    html += '</div>';
    paginEl.innerHTML = html;

    paginEl.querySelectorAll('.plp-pagination__btn[data-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = parseInt(btn.dataset.page);
        if (!isNaN(p) && p !== currentPage) {
          currentPage = p;
          renderProducts();
          document.getElementById('plpGrid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  function renderProducts() {
    if (!grid) return;

    if (isApiLoading) {
      if (countEl) countEl.textContent = 'Loading products…';
      grid.innerHTML = `
        <div class="plp-empty" style="grid-column: 1 / -1; min-height: 240px;">
          <p class="plp-empty__title" style="color:var(--color-text-secondary); font-size:var(--text-base);">
            Fetching products from database…
          </p>
        </div>`;
      if (paginEl) paginEl.innerHTML = '';
      return;
    }

    if (apiError) {
      if (countEl) countEl.textContent = 'Unable to load products';
      grid.innerHTML = `
        <div class="plp-empty" style="grid-column: 1 / -1;">
          <h3 class="plp-empty__title">Unable to load products</h3>
          <p class="plp-empty__desc">${apiError}</p>
          <button class="btn btn--outline" onclick="window.location.reload()">Retry</button>
        </div>`;
      if (paginEl) paginEl.innerHTML = '';
      return;
    }

    const filtered = getFilteredProducts();
    const total    = filtered.length;
    const start    = (currentPage - 1) * PER_PAGE;
    const page     = filtered.slice(start, start + PER_PAGE);

    if (countEl) {
      countEl.textContent = `Showing ${total} product${total !== 1 ? 's' : ''}`;
    }

    if (total === 0) {
      grid.innerHTML = `
        <div class="plp-empty" style="grid-column: 1 / -1;">
          <div class="plp-empty__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              <path d="M8 11h6M11 8v6"/>
            </svg>
          </div>
          <h3 class="plp-empty__title">No Products Found</h3>
          <p class="plp-empty__desc">Try changing or clearing your filters.</p>
          <button class="btn btn--outline" onclick="document.getElementById('plpClearFilters')?.click()">
            Clear Filters
          </button>
        </div>`;
    } else {
      grid.innerHTML = page.map(buildCard).join('');
    }

    renderPagination(total);
  }

  // ─── API-backed categories ────────────────────────────────────────────────

  // Accent colour per category slug — used for placeholder SVGs when no image is available.
  const CATEGORY_COLORS = {
    trending: '#f59e0b',
    mobiles:  '#1e3d8f',
    tvs:      '#b85e00',
    acs:      '#0369a1',
  };

  // Slugs that are served live from the backend API (PostgreSQL + Cloudinary).
  // Add a slug here when its products are seeded into the DB.
  const API_SLUGS = ['trending', 'mobiles', 'mobile', 'tvs', 'tv', 'acs', 'ac'];

  // URL alias → canonical API slug used by /api/products/category/:slug
  const SLUG_ALIASES = { mobile: 'mobiles', tv: 'tvs', ac: 'acs' };

  /**
   * Dynamically add brand checkboxes to sidebar filter if not present
   */
  function updateBrandFilters(products) {
    if (!Array.isArray(products) || products.length === 0) return;
    const brandContainers = document.querySelectorAll('.plp-filter-brand');
    if (!brandContainers.length) return;

    const uniqueBrands = [...new Set(products.map(p => p.brand).filter(Boolean))].sort();

    brandContainers.forEach(container => {
      const existingValues = Array.from(container.querySelectorAll('input')).map(inp => (inp.value || '').toLowerCase());
      uniqueBrands.forEach(brand => {
        if (!existingValues.includes(brand.toLowerCase())) {
          const label = document.createElement('label');
          label.className = 'plp-filter-option';
          label.innerHTML = `
            <input type="checkbox" value="${brand}" aria-label="${brand}"/>
            <span class="plp-filter-option__label">${brand}</span>
          `;
          label.querySelector('input').addEventListener('change', () => {
            currentPage = 1;
            renderProducts();
          });
          container.appendChild(label);
        }
      });
    });
  }

  /**
   * Fetch products for `slug` from /api/products/category/:slug or /api/products/trending,
   * map the response to PLP card shape, write into categoryPlpData,
   * then re-render the grid.
   */
  async function loadCategoryFromApi(slug) {
    isApiLoading = true;
    apiError     = null;
    renderProducts();

    try {
      const endpoint = slug === 'trending'
        ? '/api/products/trending?limit=100'
        : `/api/products/category/${slug}`;
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();

      if (json.success && Array.isArray(json.data)) {
        window.categoryPlpData       = window.categoryPlpData || {};
        window.categoryPlpData[SLUG] = json.data.map(p => {
          const primaryImg  = p.productImages?.find(img => img.isPrimary)?.imageUrl
            || p.productImages?.[0]?.imageUrl
            || p.imageUrl
            || '';
          const price       = parseFloat(p.price) || 0;
          const isAvailable = p.availability === 'AVAILABLE';

          return {
            id:            p.slug || p.id,
            slug:          p.slug,
            dbId:          p.id,
            brand:         p.brand,
            name:          p.name,
            description:   p.description,
            rating:        parseFloat(p.rating) || 0,
            reviews:       p.reviews || 0,
            originalPrice: price,
            salePrice:     price,
            discount:      0,
            availability:  p.availability,
            badge:         isAvailable ? (SLUG === 'trending' ? 'Trending' : 'In Stock') : 'Out of Stock',
            badgeType:     isAvailable ? (SLUG === 'trending' ? 'accent' : 'success') : 'primary',
            color:         CATEGORY_COLORS[slug] || '#1e3d8f',
            imageUrl:      primaryImg,
          };
        });

        // Add brand checkboxes dynamically for products
        updateBrandFilters(window.categoryPlpData[SLUG]);
      } else {
        throw new Error(json.message || `Failed to load ${slug} products`);
      }
    } catch (err) {
      console.error(`Error fetching ${slug} products from backend:`, err);
      apiError = 'Could not load products from database. Please try again.';
    } finally {
      isApiLoading = false;
      renderProducts();
    }
  }

  // ─── Init ─────────────────────────────────────────────────────────────────
  function init() {
    if (API_SLUGS.includes(SLUG)) {
      const apiSlug = SLUG_ALIASES[SLUG] || SLUG;
      loadCategoryFromApi(apiSlug);
    } else {
      renderProducts();
    }

    // Re-render on any filter change
    document.querySelectorAll(
      '.plp-filter-option input, .plp-filter-rating__option input, .plp-filter-discount input'
    ).forEach(el => el.addEventListener('change', () => { currentPage = 1; renderProducts(); }));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
