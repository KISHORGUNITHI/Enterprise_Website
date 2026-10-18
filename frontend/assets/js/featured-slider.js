/**
 * featured-slider.js — Real Trending Deals horizontal product carousel
 * Fetches top 10 trending products from GET /api/products/trending?limit=10.
 * Features:
 *   - Polished Skeleton screen loading states (zero layout shift)
 *   - Real product data integration (images, prices, discounts, stock status)
 *   - Resilient error & empty state handling with debounced Retry
 *   - Smooth carousel controls (button scroll, mouse drag, touch swipe, scroll thumb)
 */

(function () {
  'use strict';

  const track       = document.getElementById('featuredTrack');
  const prevBtn     = document.getElementById('featuredPrev');
  const nextBtn     = document.getElementById('featuredNext');
  const scrollThumb = document.getElementById('featuredScrollThumb');
  const viewport    = track ? track.closest('.featured__viewport') : null;

  if (!track || !viewport) return;

  const SKELETON_COUNT = 5;
  const API_ENDPOINT   = '/api/products/trending?limit=10';
  let isLoading        = false;

  // ─── Utility: Safe HTML & Attribute Escaping ────────────────────────────────
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function escapeAttr(str) {
    return escapeHtml(str);
  }

  // ─── Price Formatter (INR) ──────────────────────────────────────────────────
  function formatPrice(n) {
    const num = Number(n) || 0;
    return '₹' + num.toLocaleString('en-IN');
  }

  // ─── Build Star SVG ─────────────────────────────────────────────────────────
  function buildStars(rating) {
    const numRating = parseFloat(rating) || 0;
    const rId = Math.random().toString(36).slice(2, 8);
    const percent = Math.round((numRating % 1) * 100);

    return Array.from({ length: 5 }, (_, i) => {
      let fill = 'var(--gray-300)';
      let defs = '';
      if (numRating >= i + 1) {
        fill = 'var(--color-warning-500)';
      } else if (numRating > i) {
        fill = `url(#grad-${rId}-${i})`;
        defs = `<defs><linearGradient id="grad-${rId}-${i}" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="${percent}%" stop-color="var(--color-warning-500)" /><stop offset="${percent}%" stop-color="var(--gray-300)" /></linearGradient></defs>`;
      }
      return `<svg class="product-card__star" style="fill:${fill};" viewBox="0 0 16 16" aria-hidden="true">${defs}<path d="M8 1.5l1.8 5.5H16l-4.6 3.3 1.8 5.5L8 11.5l-5.2 3.3 1.8-5.5L0 7h6.2z"/></svg>`;
    }).join('');
  }

  // ─── Image Fallback SVG Placeholder ─────────────────────────────────────────
  function buildPlaceholder(color = '#1e3d8f') {
    return `
      <svg viewBox="0 0 260 260" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="260" height="260" fill="var(--color-bg-tertiary)"/>
        <rect x="80" y="60" width="100" height="140" rx="12"
          fill="${color}18" stroke="${color}40" stroke-width="2"/>
        <rect x="95" y="78" width="70" height="104" rx="6"
          fill="${color}10" stroke="${color}25" stroke-width="1.5"/>
        <rect x="106" y="92" width="48" height="6" rx="3" fill="${color}50"/>
        <rect x="106" y="106" width="36" height="4" rx="2" fill="${color}30"/>
        <rect x="106" y="118" width="42" height="4" rx="2" fill="${color}25"/>
        <rect x="106" y="136" width="48" height="18" rx="6"
          fill="${color}30" stroke="${color}50" stroke-width="1"/>
        <circle cx="130" cy="173" r="5" fill="${color}40" stroke="${color}60" stroke-width="1.5"/>
      </svg>`;
  }

  // ─── Render Skeletons ───────────────────────────────────────────────────────
  function renderSkeletons(count = SKELETON_COUNT) {
    track.classList.remove('featured__track--status');
    const items = [];
    for (let i = 0; i < count; i++) {
      items.push(`
        <article class="product-card product-card--skeleton" role="listitem" aria-hidden="true">
          <div class="product-card__image-wrap">
            <div class="skeleton-shimmer skeleton-shimmer--image"></div>
          </div>
          <div class="product-card__body">
            <div class="skeleton-shimmer skeleton-shimmer--brand"></div>
            <div class="skeleton-shimmer skeleton-shimmer--title"></div>
            <div class="skeleton-shimmer skeleton-shimmer--title-short"></div>
            <div class="skeleton-shimmer skeleton-shimmer--rating"></div>
            <div class="skeleton-shimmer skeleton-shimmer--price"></div>
          </div>
          <div class="product-card__footer">
            <div class="skeleton-shimmer skeleton-shimmer--btn"></div>
          </div>
        </article>
      `);
    }
    track.innerHTML = items.join('');
    updateThumb();
  }

  // ─── Render Real Product Cards ──────────────────────────────────────────────
  function renderCards(products) {
    track.classList.remove('featured__track--status');

    // Limit to top 10 products
    const displayList = products.slice(0, 10);

    track.innerHTML = displayList.map((p) => {
      const basePrice     = parseFloat(p.price) || 0;
      const offer         = parseFloat(p.offer) || 0;
      let price           = basePrice;
      let originalPrice   = parseFloat(p.originalPrice) || 0;
      let discount        = parseInt(p.discount, 10) || 0;

      if (offer > 0) {
        discount = offer;
        originalPrice = basePrice;
        price = Math.round(basePrice * (1 - offer / 100));
      } else if (!discount && originalPrice > price) {
        discount = Math.round(((originalPrice - price) / originalPrice) * 100);
      }

      const rating     = parseFloat(p.rating) || 0;
      const reviews    = parseInt(p.reviews, 10) || 0;
      const brand      = escapeHtml(p.brand || '');
      const name       = escapeHtml(p.name || 'Product');
      const detailSlug = encodeURIComponent(p.slug || p.id || '');
      const detailUrl  = `/product/${detailSlug}`;

      // Image source resolution
      const rawImgUrl = p.imageUrl || (Array.isArray(p.productImages) && p.productImages[0] ? p.productImages[0].imageUrl : '');
      const hasImage  = Boolean(rawImgUrl);

      // Badge resolution based strictly on backend data
      let badgeHtml = '';
      if (p.availability === 'OUT_OF_STOCK') {
        badgeHtml = '<span class="product-card__badge product-card__badge--primary">Out of Stock</span>';
      } else if (p.badge) {
        const badgeClass = p.badgeType ? `product-card__badge--${escapeAttr(p.badgeType)}` : 'product-card__badge--accent';
        badgeHtml = `<span class="product-card__badge ${badgeClass}">${escapeHtml(p.badge)}</span>`;
      } else if (p.availability === 'AVAILABLE') {
        badgeHtml = '<span class="product-card__badge product-card__badge--success">In Stock</span>';
      }

      // Review & Star label
      const starsLabel  = rating > 0 ? `Rating: ${rating} out of 5` : 'No rating yet';
      const reviewsText = reviews > 0 ? `(${reviews.toLocaleString('en-IN')})` : '(No reviews)';

      return `
        <article
          class="product-card"
          role="listitem"
          aria-label="${brand} ${name}"
        >
          <div class="product-card__image-wrap">
            ${badgeHtml}

            ${hasImage ? `
              <img
                src="${escapeAttr(rawImgUrl)}"
                alt="${brand} ${name}"
                class="product-card__image"
                loading="lazy"
                onerror="this.style.display='none'; if (this.nextElementSibling) this.nextElementSibling.style.display='flex';"
              />
              <div class="product-card__image-placeholder" style="display:none;" aria-hidden="true">
                ${buildPlaceholder()}
              </div>
            ` : `
              <div class="product-card__image-placeholder" aria-hidden="true">
                ${buildPlaceholder()}
              </div>
            `}
          </div>

          <div class="product-card__body">
            <p class="product-card__brand">${brand}</p>
            <h3 class="product-card__name">${name}</h3>

            <div class="product-card__rating">
              <div class="product-card__stars" aria-label="${starsLabel}">
                ${buildStars(rating)}
              </div>
              <span class="product-card__review-count">${reviewsText}</span>
            </div>

            <div class="product-card__price">
              <span class="product-card__price-sale">${formatPrice(price)}</span>
              ${originalPrice > price ? `<span class="product-card__price-original">${formatPrice(originalPrice)}</span>` : ''}
              ${discount > 0 ? `<span class="product-card__price-discount">${discount}% off</span>` : ''}
            </div>
          </div>

          <div class="product-card__footer">
            <a href="${detailUrl}" class="btn btn--primary product-card__cta" aria-label="View ${name}">
              View Product
            </a>
          </div>
        </article>
      `;
    }).join('');

    // Re-enable controls and update scroll thumb position
    if (prevBtn) prevBtn.disabled = false;
    if (nextBtn) nextBtn.disabled = false;
    updateThumb();
  }

  // ─── Render Clean Empty State ───────────────────────────────────────────────
  function renderEmpty() {
    track.classList.add('featured__track--status');
    track.innerHTML = `
      <div class="featured__status featured__status--empty" role="status">
        <div class="featured__status-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
        </div>
        <div>
          <h3 class="featured__status-title">No Trending Deals Right Now</h3>
          <p class="featured__status-desc">We are refreshing our trending catalogue. Please check back shortly for today's top picks.</p>
        </div>
      </div>
    `;

    if (prevBtn) prevBtn.disabled = true;
    if (nextBtn) nextBtn.disabled = true;
    if (scrollThumb) {
      scrollThumb.style.width = '0%';
      scrollThumb.style.marginLeft = '0%';
    }
  }

  // ─── Render Resilient Error State with Debounced Retry ──────────────────────
  function renderError(message) {
    track.classList.add('featured__track--status');
    track.innerHTML = `
      <div class="featured__status featured__status--error" role="alert">
        <div class="featured__status-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <div>
          <h3 class="featured__status-title">Unable to Load Trending Deals</h3>
          <p class="featured__status-desc">${escapeHtml(message || 'We encountered a momentary issue retrieving trending products.')}</p>
        </div>
        <button type="button" class="featured__retry-btn" id="featuredRetryBtn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
          </svg>
          <span>Try Again</span>
        </button>
      </div>
    `;

    if (prevBtn) prevBtn.disabled = true;
    if (nextBtn) nextBtn.disabled = true;
    if (scrollThumb) {
      scrollThumb.style.width = '0%';
      scrollThumb.style.marginLeft = '0%';
    }

    const retryBtn = document.getElementById('featuredRetryBtn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        if (isLoading) return;
        retryBtn.disabled = true;
        retryBtn.classList.add('loading');
        fetchTrendingProducts();
      });
    }
  }

  // ─── Fetch Trending Products from API ──────────────────────────────────────
  async function fetchTrendingProducts() {
    if (isLoading) return;
    isLoading = true;

    // Render skeleton placeholders while fetching
    renderSkeletons(SKELETON_COUNT);

    try {
      const response = await fetch(API_ENDPOINT, {
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Failed to load products (HTTP ${response.status})`);
      }

      const result = await response.json();

      if (!result || !result.success || !Array.isArray(result.data)) {
        throw new Error('Invalid response structure received from server');
      }

      if (result.data.length === 0) {
        renderEmpty();
      } else {
        renderCards(result.data);
      }
    } catch (err) {
      renderError('Something went wrong fetching trending products. Please verify your connection and try again.');
    } finally {
      isLoading = false;
    }
  }

  // ─── Carousel Navigation & Thumb Calculation ────────────────────────────────
  function getScrollStep() {
    const firstCard = track.firstElementChild;
    const cardWidth = firstCard ? firstCard.getBoundingClientRect().width : 260;
    return (cardWidth + 20) * 3;
  }

  function updateThumb() {
    if (!scrollThumb || !viewport) return;
    const maxScroll = viewport.scrollWidth - viewport.clientWidth;

    if (maxScroll <= 0) {
      scrollThumb.style.width = '100%';
      scrollThumb.style.marginLeft = '0%';
      if (prevBtn) prevBtn.disabled = true;
      if (nextBtn) nextBtn.disabled = true;
      return;
    }

    if (prevBtn) prevBtn.disabled = viewport.scrollLeft <= 4;
    if (nextBtn) nextBtn.disabled = viewport.scrollLeft >= maxScroll - 4;

    const ratio = Math.max(0, Math.min(1, viewport.scrollLeft / maxScroll));
    const thumbWidth = Math.max(12, (viewport.clientWidth / viewport.scrollWidth) * 100);
    scrollThumb.style.width = `${thumbWidth}%`;
    scrollThumb.style.marginLeft = `${ratio * (100 - thumbWidth)}%`;
  }

  // ─── Button Controls ────────────────────────────────────────────────────────
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      viewport.scrollBy({ left: -getScrollStep(), behavior: 'smooth' });
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      viewport.scrollBy({ left: getScrollStep(), behavior: 'smooth' });
    });
  }

  viewport.addEventListener('scroll', updateThumb, { passive: true });
  window.addEventListener('resize', updateThumb, { passive: true });

  // ─── Mouse Drag ─────────────────────────────────────────────────────────────
  let isDragging = false;
  let startX     = 0;
  let scrollLeft = 0;
  let hasDragged = false;

  viewport.addEventListener('mousedown', (e) => {
    isDragging = true;
    hasDragged = false;
    startX     = e.pageX - viewport.offsetLeft;
    scrollLeft = viewport.scrollLeft;
    viewport.style.cursor = 'grabbing';
  });

  viewport.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x    = e.pageX - viewport.offsetLeft;
    const walk = (x - startX) * 1.5;
    if (Math.abs(walk) > 4) {
      hasDragged = true;
    }
    viewport.scrollLeft = scrollLeft - walk;
  });

  const stopDrag = () => {
    isDragging = false;
    viewport.style.cursor = 'grab';
  };

  viewport.addEventListener('mouseup',    stopDrag);
  viewport.addEventListener('mouseleave', stopDrag);

  // Prevent accidental link clicks after mouse drag
  viewport.addEventListener('click', (e) => {
    if (hasDragged) {
      e.preventDefault();
      e.stopPropagation();
      hasDragged = false;
    }
  }, true);

  // ─── Touch Support ──────────────────────────────────────────────────────────
  let touchStartX     = 0;
  let touchScrollLeft = 0;

  viewport.addEventListener('touchstart', (e) => {
    touchStartX     = e.touches[0].clientX;
    touchScrollLeft = viewport.scrollLeft;
  }, { passive: true });

  viewport.addEventListener('touchmove', (e) => {
    const diff = touchStartX - e.touches[0].clientX;
    viewport.scrollLeft = touchScrollLeft + diff;
  }, { passive: true });

  // ─── Keyboard Support ───────────────────────────────────────────────────────
  viewport.setAttribute('tabindex', '0');
  viewport.addEventListener('keydown', (e) => {
    const firstCard = track.firstElementChild;
    const cardStep  = (firstCard ? firstCard.getBoundingClientRect().width : 260) + 20;
    if (e.key === 'ArrowLeft')  viewport.scrollBy({ left: -cardStep, behavior: 'smooth' });
    if (e.key === 'ArrowRight') viewport.scrollBy({ left:  cardStep, behavior: 'smooth' });
  });

  // ─── Initialize Fetch ───────────────────────────────────────────────────────
  fetchTrendingProducts();

})();
