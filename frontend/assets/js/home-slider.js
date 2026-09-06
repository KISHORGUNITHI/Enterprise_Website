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
    return Array.from({ length: 5 }, (_, i) => {
      const cls = i < Math.floor(rating) ? '' : ' product-card__star--empty';
      return `<svg class="product-card__star${cls}" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.5l1.8 5.5H16l-4.6 3.3 1.8 5.5L8 11.5l-5.2 3.3 1.8-5.5L0 7h6.2z"/></svg>`;
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
            <div class="product-card__stars" aria-label="Rating: ${p.rating || 4.8} out of 5">${stars(p.rating || 4.8)}</div>
            <span class="product-card__review-count">(${(p.reviews || p.reviewCount || 1240).toLocaleString()})</span>
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

  document.querySelectorAll('[data-section]').forEach(section => {
    const id       = section.dataset.section;
    const dataKey  = KEY_MAP[id] || id;
    const products = data[dataKey];
    if (!products) return;

    const track    = section.querySelector(`[data-track="${id}"]`);
    const viewport = section.querySelector(`[data-viewport="${id}"]`);
    const prevBtn  = section.querySelector('[data-dir="prev"]');
    const nextBtn  = section.querySelector('[data-dir="next"]');

    if (!track || !viewport) return;

    // Render cards
    track.innerHTML = products.map(buildCard).join('');

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

  // ─── Fetch live Mobiles from Database API ─────────────────────────────────
  async function syncMobilesFromDb() {
    try {
      const res = await fetch('/api/products/category/mobiles');
      if (!res.ok) return;
      const json = await res.json();

      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        const dbMobiles = json.data.map(p => {
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
            rating: 4.8,
            reviews: 1240,
            originalPrice: price,
            salePrice: price,
            discount: 0,
            availability: p.availability,
            badge: isAvailable ? 'In Stock' : 'Out of Stock',
            badgeType: isAvailable ? 'success' : 'primary',
            color: '#1e3d8f',
            imageUrl: primaryImg,
          };
        });

        // Update in-memory data
        window.homeProductsData.mobiles = dbMobiles;

        // Re-render mobile track
        const mobileSection = document.querySelector('[data-section="mobiles"]');
        if (mobileSection) {
          const track = mobileSection.querySelector('[data-track="mobiles"]');
          if (track) {
            track.innerHTML = dbMobiles.map(buildCard).join('');
          }
        }
      }
    } catch (err) {
      console.warn('Could not sync mobiles from database:', err);
    }
  }

  syncMobilesFromDb();

})();
