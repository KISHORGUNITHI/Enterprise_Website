/**
 * featured-slider.js — Netflix-style horizontal product carousel
 * Reads window.featuredProductsData (featured-products.js must load first).
 * Features: button scroll, mouse drag, touch swipe, scroll-thumb indicator.
 */

(function () {
  'use strict';

  const track     = document.getElementById('featuredTrack');
  const prevBtn   = document.getElementById('featuredPrev');
  const nextBtn   = document.getElementById('featuredNext');
  const scrollThumb = document.getElementById('featuredScrollThumb');
  const viewport  = track ? track.closest('.featured__viewport') : null;

  if (!track || !window.featuredProductsData) return;

  const products = window.featuredProductsData;

  // ─── Build star SVG ─────────────────────────────────────────────────────────
  function buildStars(rating) {
    return Array.from({ length: 5 }, (_, i) => {
      const filled = i < Math.floor(rating);
      return `<svg class="product-card__star${filled ? '' : ' product-card__star--empty'}" viewBox="0 0 16 16" aria-hidden="true">
        <path d="M8 1.5l1.8 5.5H16l-4.6 3.3 1.8 5.5L8 11.5l-5.2 3.3 1.8-5.5L0 7h6.2z"/>
      </svg>`;
    }).join('');
  }

  // ─── Product image placeholder SVGs ─────────────────────────────────────────
  function buildPlaceholder(color) {
    return `
      <svg viewBox="0 0 260 260" fill="none" xmlns="http://www.w3.org/2000/svg">
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

  // ─── Format price ─────────────────────────────────────────────────────────
  function formatPrice(n) {
    return '₹' + n.toLocaleString('en-IN');
  }

  // ─── Render cards ──────────────────────────────────────────────────────────
  function buildCards() {
    track.innerHTML = products.map((p) => `
      <article
        class="product-card"
        role="listitem"
        aria-label="${p.brand} ${p.name}"
      >
        <div class="product-card__image-wrap">

          ${p.badge ? `<span class="product-card__badge product-card__badge--${p.badgeType}">${p.badge}</span>` : ''}

          <button class="product-card__wishlist" aria-label="Add ${p.name} to wishlist">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"/>
            </svg>
          </button>

          <div class="product-card__image-placeholder" aria-hidden="true">
            ${buildPlaceholder(p.color)}
          </div>

        </div>

        <div class="product-card__body">
          <p class="product-card__brand">${p.brand}</p>
          <h3 class="product-card__name">${p.name}</h3>

          <div class="product-card__rating">
            <div class="product-card__stars" aria-label="Rating: ${p.rating} out of 5">
              ${buildStars(p.rating)}
            </div>
            <span class="product-card__review-count">(${p.reviewCount.toLocaleString()})</span>
          </div>

          <div class="product-card__price">
            <span class="product-card__price-sale">${formatPrice(p.salePrice)}</span>
            <span class="product-card__price-original">${formatPrice(p.originalPrice)}</span>
            <span class="product-card__price-discount">${p.discount}% off</span>
          </div>
        </div>

        <div class="product-card__footer">
          <button
            class="btn btn--primary product-card__cta"
            aria-label="View ${p.name}"
            onclick="showLoginRequiredModal('/products/${p.id}')"
          >
            View Product
          </button>
        </div>

      </article>
    `).join('');
  }

  buildCards();

  // ─── Scroll amount per click ───────────────────────────────────────────────
  const CARD_WIDTH  = 260 + 20; // card + gap
  const SCROLL_STEP = CARD_WIDTH * 3;

  // ─── Update scroll thumb ───────────────────────────────────────────────────
  function updateThumb() {
    if (!scrollThumb || !viewport) return;
    const ratio = viewport.scrollLeft / (viewport.scrollWidth - viewport.clientWidth);
    const thumbWidth = (viewport.clientWidth / viewport.scrollWidth) * 100;
    scrollThumb.style.width = `${Math.min(thumbWidth, 100)}%`;
    scrollThumb.style.marginLeft = `${ratio * (100 - thumbWidth)}%`;
  }

  // ─── Button controls ──────────────────────────────────────────────────────
  prevBtn.addEventListener('click', () => {
    viewport.scrollBy({ left: -SCROLL_STEP, behavior: 'smooth' });
  });

  nextBtn.addEventListener('click', () => {
    viewport.scrollBy({ left: SCROLL_STEP, behavior: 'smooth' });
  });

  viewport.addEventListener('scroll', updateThumb, { passive: true });
  updateThumb();

  // ─── Mouse drag ───────────────────────────────────────────────────────────
  let isDragging = false;
  let startX     = 0;
  let scrollLeft = 0;

  viewport.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX     = e.pageX - viewport.offsetLeft;
    scrollLeft = viewport.scrollLeft;
    viewport.style.cursor = 'grabbing';
  });

  viewport.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x    = e.pageX - viewport.offsetLeft;
    const walk = (x - startX) * 1.5;
    viewport.scrollLeft = scrollLeft - walk;
  });

  const stopDrag = () => {
    isDragging = false;
    viewport.style.cursor = 'grab';
  };

  viewport.addEventListener('mouseup',    stopDrag);
  viewport.addEventListener('mouseleave', stopDrag);

  // Prevent accidental link clicks after drag
  viewport.addEventListener('click', (e) => {
    if (Math.abs(viewport.scrollLeft - scrollLeft) > 5) {
      e.preventDefault();
    }
  });

  // ─── Touch support ────────────────────────────────────────────────────────
  let touchStartX = 0;
  let touchScrollLeft = 0;

  viewport.addEventListener('touchstart', (e) => {
    touchStartX     = e.touches[0].clientX;
    touchScrollLeft = viewport.scrollLeft;
  }, { passive: true });

  viewport.addEventListener('touchmove', (e) => {
    const diff = touchStartX - e.touches[0].clientX;
    viewport.scrollLeft = touchScrollLeft + diff;
  }, { passive: true });

  // ─── Keyboard support ────────────────────────────────────────────────────
  viewport.setAttribute('tabindex', '0');
  viewport.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  viewport.scrollBy({ left: -CARD_WIDTH, behavior: 'smooth' });
    if (e.key === 'ArrowRight') viewport.scrollBy({ left:  CARD_WIDTH, behavior: 'smooth' });
  });

})();
