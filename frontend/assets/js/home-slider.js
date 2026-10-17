/**
 * home-slider.js — Product carousel engine for all Home page sections.
 * Reads window.homeProductsData keyed by sectionId.
 * Attaches to every [data-section] element on the page.
 * Synchronizes 'mobiles' category live from database API (/api/products/category/mobiles).
 */

(function () {
  'use strict';

  if (!window.homeProductsData) return;

  const data = window.homeProductsData;

  // ─── Helpers ──────────────────────────────────────────────────────────────

  function fmt(n) {
    return '₹' + Number(n).toLocaleString('en-IN');
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
      return `<svg class="product-card__star" style="fill:${fill};" viewBox="0 0 16 16" aria-hidden="true">${defs}<path d="M8 1.5l1.8 5.5H16l-4.6 3.3 1.8 5.5L8 11.5l-5.2 3.3 1.8-5.5L0 7h6.2z"/></svg>`;
    }).join('');
  }

  function placeholder(color) {
    return `<svg viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="220" height="220" fill="var(--color-bg-tertiary)"/>
      <rect x="60" y="45" width="100" height="130" rx="10" fill="${color}15" stroke="${color}35" stroke-width="1.5"/>
      <rect x="74" y="60" width="72" height="96" rx="6" fill="${color}08" stroke="${color}20" stroke-width="1"/>
      <rect x="84" y="74" width="52" height="5" rx="2.5" fill="${color}45"/>
      <rect x="84" y="86" width="38" height="3.5" rx="1.75" fill="${color}28"/>
      <rect x="84" y="96" width="44" height="3.5" rx="1.75" fill="${color}22"/>
      <rect x="84" y="112" width="52" height="16" rx="5" fill="${color}28" stroke="${color}45" stroke-width="1"/>
      <circle cx="110" cy="158" r="4" fill="${color}38" stroke="${color}55" stroke-width="1.5"/>
    </svg>`;
  }

  function buildCard(p) {
    const route = `/product/${p.slug || p.id}`;
    const isAvailable = p.availability ? p.availability === 'AVAILABLE' : true;
    const badgeText = p.badge || (isAvailable ? 'In Stock' : 'Out of Stock');
    const badgeType = p.badgeType || (isAvailable ? 'success' : 'primary');

    const imageContent = p.imageUrl
      ? `<img src="${p.imageUrl}" alt="${p.brand} ${p.name}" class="product-card__img" loading="lazy" />`
      : placeholder(p.color || '#1e3d8f');

    return `
      <article class="product-card" role="listitem" aria-label="${p.brand} ${p.name}">
        <div class="product-card__image-wrap">
          ${badgeText ? `<span class="product-card__badge product-card__badge--${badgeType}">${badgeText}</span>` : ''}
          <div class="product-card__image-placeholder" aria-hidden="true">
            ${imageContent}
          </div>
        </div>

        <div class="product-card__body">
          <p class="product-card__brand">${p.brand}</p>
          <h3 class="product-card__name">${p.name}</h3>
          <div class="product-card__rating">
            <div class="product-card__stars" aria-label="Rating: ${p.rating || 0} out of 5">${stars(p.rating || 0)}</div>
            <span class="product-card__review-count">(${(p.reviews || p.reviewCount || 0).toLocaleString()})</span>
          </div>
          <div class="product-card__price">
            <span class="product-card__price-sale">${fmt(p.salePrice)}</span>
            ${p.originalPrice && p.originalPrice > p.salePrice ? `<span class="product-card__price-original">${fmt(p.originalPrice)}</span>` : ''}
            ${p.discount && p.discount > 0 ? `<span class="product-card__price-discount">${p.discount}% off</span>` : ''}
          </div>
        </div>

        <div class="product-card__footer">
          <a href="${route}" class="btn btn--primary product-card__cta"
            aria-label="View ${p.name}">
            View Product
          </a>
        </div>
      </article>`;
  }

  const SECTION_CONFIG = {
    trending: {
      badge: 'All Deals',
      title: 'View All',
      desc: 'Discover more trending products & offers',
      btnText: 'Explore Deals',
      defaultHref: '/products/trending',
    },
    mobiles: {
      badge: 'All Mobiles',
      title: 'View All',
      desc: 'Discover latest smartphones & accessories',
      btnText: 'Explore Mobiles',
      defaultHref: '/products/mobiles',
    },
    tvs: {
      badge: 'All TVs',
      title: 'View All',
      desc: 'Discover smart, 4K & OLED televisions',
      btnText: 'Explore TVs',
      defaultHref: '/products/tvs',
    },
    acs: {
      badge: 'All ACs',
      title: 'View All',
      desc: 'Discover split, inverter & 5-star ACs',
      btnText: 'Explore ACs',
      defaultHref: '/products/acs',
    },
    homeTheatres: {
      badge: 'All Audio',
      title: 'View All',
      desc: 'Discover soundbars & home audio systems',
      btnText: 'Explore Audio',
      defaultHref: '/products/home-theatres',
    },
  };

  function buildViewAllCard(sectionId, viewAllHref) {
    const config = SECTION_CONFIG[sectionId] || {
      badge: 'All Products',
      title: 'View All',
      desc: 'Discover more products & exclusive offers',
      btnText: 'Explore More',
      defaultHref: '/products',
    };
    const href = viewAllHref || config.defaultHref;
    return `
      <a href="${href}" class="product-card product-card--view-all" role="listitem" aria-label="View all ${config.badge}">
        <div class="product-card__view-all-content">
          <div class="product-card__view-all-icon-wrap" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </div>
          <div class="product-card__view-all-text">
            <span class="product-card__view-all-badge">${config.badge}</span>
            <h3 class="product-card__view-all-title">${config.title}</h3>
            <p class="product-card__view-all-desc">${config.desc}</p>
          </div>
          <div class="product-card__view-all-cta">
            <span class="btn btn--accent btn--sm product-card__view-all-btn">
              ${config.btnText}
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
            </span>
          </div>
        </div>
      </a>`;
  }

  // ─── Wire up each section ────────────────────────────────────────────────

  const KEY_MAP = {
    trending:       'trending',
    mobiles:        'mobiles',
    tvs:            'tvs',
    acs:            'acs',
    homeTheatres:   'homeTheatres',
    kitchen:        'kitchen',
    refrigerators:  'refrigerators',
  };

  function buildSkeletonCard() {
    return `
      <div class="product-card product-card--skeleton" role="listitem" aria-hidden="true">
        <div class="product-card__image-wrap skeleton-shimmer">
          <span class="skeleton-badge skeleton-shimmer"></span>
        </div>
        <div class="product-card__body">
          <span class="skeleton-bar skeleton-bar--brand skeleton-shimmer"></span>
          <span class="skeleton-bar skeleton-bar--title-1 skeleton-shimmer"></span>
          <span class="skeleton-bar skeleton-bar--title-2 skeleton-shimmer"></span>
          <span class="skeleton-bar skeleton-bar--rating skeleton-shimmer"></span>
          <span class="skeleton-bar skeleton-bar--price skeleton-shimmer"></span>
        </div>
        <div class="product-card__footer">
          <span class="skeleton-bar skeleton-bar--cta skeleton-shimmer"></span>
        </div>
      </div>`;
  }

  function renderSkeletons(targetTrack, count = 6) {
    if (!targetTrack) return;
    targetTrack.innerHTML = Array.from({ length: count }, buildSkeletonCard).join('');
  }

  document.querySelectorAll('[data-section]').forEach(section => {
    const id       = section.dataset.section;
    const dataKey  = KEY_MAP[id] || id;
    const products = data[dataKey] || [];

    const track    = section.querySelector(`[data-track="${id}"]`);
    const viewport = section.querySelector(`[data-viewport="${id}"]`);
    const prevBtn  = section.querySelector('[data-dir="prev"]');
    const nextBtn  = section.querySelector('[data-dir="next"]');

    if (!track || !viewport) return;

    // Show skeletons initially if no products in memory yet
    if (!products.length) {
      if (track.children.length === 0) {
        renderSkeletons(track, 6);
      }
    } else {
      const viewAllHref = section.querySelector('.prod-section__view-all')?.getAttribute('href');
      const viewAllCardHtml = buildViewAllCard(id, viewAllHref);
      track.innerHTML = products.map(buildCard).join('') + viewAllCardHtml;
    }

    // Wire PRODUCT_VIEW tracking on every card's CTA click (event delegation on track)
    track.addEventListener('click', e => {
      const cta = e.target.closest('.product-card__cta');
      if (!cta) return;
      const href = cta.getAttribute('href') || '';
      const productId = href.split('/product/')[1];
      if (productId) recordInteraction(productId, 'PRODUCT_VIEW');
    }, { passive: true });

    // ─── Scroll helpers ──────────────────────────────────────────────────
    const CARD_W    = 220 + 16; // card width + gap
    const SCROLL_BY = CARD_W * 3;

    prevBtn && prevBtn.addEventListener('click', () => {
      viewport.scrollBy({ left: -SCROLL_BY, behavior: 'smooth' });
    });
    nextBtn && nextBtn.addEventListener('click', () => {
      viewport.scrollBy({ left: SCROLL_BY, behavior: 'smooth' });
    });

    // ─── Mouse drag ──────────────────────────────────────────────────────
    let dragging = false, startX = 0, startScroll = 0;

    viewport.addEventListener('mousedown', e => {
      dragging    = true;
      startX      = e.pageX - viewport.offsetLeft;
      startScroll = viewport.scrollLeft;
      viewport.style.cursor = 'grabbing';
    });

    viewport.addEventListener('mousemove', e => {
      if (!dragging) return;
      e.preventDefault();
      viewport.scrollLeft = startScroll - (e.pageX - viewport.offsetLeft - startX) * 1.4;
    });

    const stopDrag = () => { dragging = false; viewport.style.cursor = 'grab'; };
    viewport.addEventListener('mouseup',    stopDrag);
    viewport.addEventListener('mouseleave', stopDrag);

    // ─── Touch ───────────────────────────────────────────────────────────
    let touchX = 0, touchScroll = 0;
    viewport.addEventListener('touchstart', e => {
      touchX      = e.touches[0].clientX;
      touchScroll = viewport.scrollLeft;
    }, { passive: true });
    viewport.addEventListener('touchmove', e => {
      viewport.scrollLeft = touchScroll + (touchX - e.touches[0].clientX);
    }, { passive: true });

    // ─── Keyboard ────────────────────────────────────────────────────────
    viewport.setAttribute('tabindex', '0');
    viewport.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft')  viewport.scrollBy({ left: -CARD_W, behavior: 'smooth' });
      if (e.key === 'ArrowRight') viewport.scrollBy({ left:  CARD_W, behavior: 'smooth' });
    });
  });

  // ─── Generic DB sync: fetches a category from the API and re-renders its track ──
  async function syncCategoryFromDb(apiSlug, sectionId, color) {
    try {
      const res = await fetch(`/api/products/category/${apiSlug}`);
      if (!res.ok) return;
      const json = await res.json();

      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        const dbProducts = json.data.map(p => {
          const primaryImg = p.productImages?.find(img => img.isPrimary)?.imageUrl
            || p.productImages?.[0]?.imageUrl
            || '';
          const price = parseFloat(p.price) || 0;
          const isAvailable = p.availability === 'AVAILABLE';

          return {
            id: p.slug || p.id,
            slug: p.slug,
            dbId: p.id,
            brand: p.brand,
            name: p.name,
            description: p.description,
            rating: parseFloat(p.rating) || 0,
            reviews: p.reviews || 0,
            originalPrice: price,
            salePrice: (p.offer && parseFloat(p.offer) > 0) ? Math.round(price * (1 - parseFloat(p.offer) / 100)) : price,
            discount: (p.offer && parseFloat(p.offer) > 0) ? parseFloat(p.offer) : 0,
            availability: p.availability,
            badge: isAvailable ? 'In Stock' : 'Out of Stock',
            badgeType: isAvailable ? 'success' : 'primary',
            color,
            imageUrl: primaryImg,
          };
        });

        // Update in-memory data
        window.homeProductsData[sectionId] = dbProducts;

        // Re-render the section track
        const section = document.querySelector(`[data-section="${sectionId}"]`);
        if (section) {
          const track = section.querySelector(`[data-track="${sectionId}"]`);
          if (track) {
            const viewAllHref = section.querySelector('.prod-section__view-all')?.getAttribute('href');
            track.innerHTML = dbProducts.map(buildCard).join('') + buildViewAllCard(sectionId, viewAllHref);
          }
        }
      }
    } catch (err) {
      console.warn(`Could not sync ${sectionId} from database:`, err);
    }
  }

  // ─── Fetch live Mobiles from Database API ─────────────────────────────────
  async function syncMobilesFromDb() {
    return syncCategoryFromDb('mobiles', 'mobiles', '#1e3d8f');
  }

  // ─── Fetch live TVs from Database API ────────────────────────────────────
  async function syncTvsFromDb() {
    return syncCategoryFromDb('tvs', 'tvs', '#b85e00');
  }

  // ─── Fetch live ACs from Database API ────────────────────────────────────
  async function syncAcsFromDb() {
    return syncCategoryFromDb('acs', 'acs', '#0369a1');
  }

  // ─── Fetch live Home Theatres from Database API ───────────────────────────
  async function syncHomeTheatresFromDb() {
    return syncCategoryFromDb('home-theatres', 'homeTheatres', '#374151');
  }

  // ─── Interaction tracking helpers ────────────────────────────────────────────
  //
  // getSessionId() returns a stable pseudo-anonymous session identifier stored
  // in sessionStorage.  Used only for guest view-deduplication — no PII stored.
  function getSessionId() {
    let sid = sessionStorage.getItem('_ks_sid');
    if (!sid) {
      sid = 'sid_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem('_ks_sid', sid);
    }
    return sid;
  }

  /**
   * Fire a product interaction event to the backend.
   * Uses navigator.sendBeacon when available (fire-and-forget, survives navigation).
   * Falls back to fetch with keepalive.
   *
   * @param {string} productId  — product id (DB id preferred, slug also accepted)
   * @param {string} type       — PRODUCT_VIEW | WISHLIST_ADD | CART_ADD | PURCHASE
   */
  function recordInteraction(productId, type) {
    if (!productId) return;
    const url  = `/api/products/${encodeURIComponent(productId)}/interaction`;
    const body = JSON.stringify({ type });
    const sid  = getSessionId();

    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' });
      // sendBeacon does not support custom headers, so we use fetch for this
    }

    // fetch with keepalive — non-blocking, survives page unload
    fetch(url, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'x-session-id': sid },
      body,
      keepalive: true,
    }).catch(() => { /* silently ignore — interaction tracking is best-effort */ });
  }

  // ─── Trending Deals: fetch from /api/products/trending ───────────────────────
  async function syncTrendingFromApi() {
    try {
      const res = await fetch('/api/products/trending?limit=10');
      if (!res.ok) return;
      const json = await res.json();

      if (!json.success || !Array.isArray(json.data) || json.data.length === 0) return;

      const trendingProducts = json.data.map(p => {
        const primaryImg = p.productImages?.find(img => img.isPrimary)?.imageUrl
          || p.productImages?.[0]?.imageUrl
          || p.imageUrl
          || '';
        const price = parseFloat(p.price) || 0;
        const isAvailable = p.availability === 'AVAILABLE';

        return {
          id:           p.slug || p.id,
          slug:         p.slug,
          dbId:         p.id,
          brand:        p.brand,
          name:         p.name,
          description:  p.description,
          rating:       parseFloat(p.rating) || 0,
          reviews:      p.reviews || 0,
          originalPrice: price,
          salePrice:    (p.offer && parseFloat(p.offer) > 0) ? Math.round(price * (1 - parseFloat(p.offer) / 100)) : price,
          discount:     (p.offer && parseFloat(p.offer) > 0) ? parseFloat(p.offer) : 0,
          availability: p.availability,
          badge:        isAvailable ? 'Trending' : 'Out of Stock',
          badgeType:    isAvailable ? 'accent'   : 'primary',
          color:        '#1e3d8f',
          imageUrl:     primaryImg,
        };
      });

      // Replace static mock data with live ranked data
      window.homeProductsData['trending'] = trendingProducts;

      // Re-render the trending track
      const section = document.querySelector('[data-section="trending"]');
      if (section) {
        const track = section.querySelector('[data-track="trending"]');
        if (track) {
          const viewAllHref = section.querySelector('.prod-section__view-all')?.getAttribute('href') || '/products/trending';
          track.innerHTML = trendingProducts.map(buildCard).join('') + buildViewAllCard('trending', viewAllHref);

          // Wire PRODUCT_VIEW tracking on every card's CTA click
          // Uses event delegation on the track to avoid per-card listeners.
          track.addEventListener('click', e => {
            const cta = e.target.closest('.product-card__cta');
            if (!cta) return;
            const card = cta.closest('.product-card');
            // Extract product id from the href: /product/<id-or-slug>
            const href = cta.getAttribute('href') || '';
            const productId = href.split('/product/')[1];
            if (productId) recordInteraction(productId, 'PRODUCT_VIEW');
          }, { passive: true });
        }
      }
    } catch (err) {
      console.warn('Could not sync trending products from API:', err);
      // Static fallback in home-products.js is already rendered — nothing more needed
    }
  }

  syncTrendingFromApi();
  syncMobilesFromDb();
  syncTvsFromDb();
  syncAcsFromDb();
  syncHomeTheatresFromDb();

})();
