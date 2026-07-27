/**
 * pdp.js — Product Details Page interactions.
 * Handles: gallery, variant selection, color picker,
 *          description collapse, sticky bar, related carousel.
 * Reads window.productCatalogue[id] from product-data.js.
 */

(function () {
  'use strict';

  // ─── Resolve product ID from URL ─────────────────────────────────────────
  const pathParts = window.location.pathname.split('/');
  const productId = parseInt(pathParts[pathParts.length - 1], 10);
  const product   = window.productCatalogue && window.productCatalogue[productId];

  if (!product) return; // Unknown product — page shows fallback content

  // ─── Helpers ──────────────────────────────────────────────────────────────
  function fmt(n) {
    return '₹' + n.toLocaleString('en-IN');
  }

  function starsSVG(rating) {
    return Array.from({ length: 5 }, (_, i) => {
      const full = i < Math.floor(rating);
      return `<svg width="14" height="14" viewBox="0 0 16 16" style="fill:${full ? 'var(--color-warning-500)' : 'var(--gray-300)'}"><path d="M8 1.5l1.8 5.5H16l-4.6 3.3 1.8 5.5L8 11.5l-5.2 3.3 1.8-5.5L0 7h6.2z"/></svg>`;
    }).join('');
  }

  function placeholder(color, size = 320) {
    return `<svg viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="var(--color-bg-secondary)"/>
      <rect x="${size*0.2}" y="${size*0.15}" width="${size*0.6}" height="${size*0.7}" rx="${size*0.06}" fill="${color}14" stroke="${color}35" stroke-width="${size*0.008}"/>
      <rect x="${size*0.28}" y="${size*0.25}" width="${size*0.44}" height="${size*0.52}" rx="${size*0.03}" fill="${color}08" stroke="${color}20" stroke-width="${size*0.005}"/>
      <rect x="${size*0.33}" y="${size*0.33}" width="${size*0.34}" height="${size*0.03}" rx="${size*0.015}" fill="${color}45"/>
      <rect x="${size*0.33}" y="${size*0.4}" width="${size*0.26}" height="${size*0.02}" rx="${size*0.01}" fill="${color}28"/>
      <rect x="${size*0.33}" y="${size*0.46}" width="${size*0.3}" height="${size*0.02}" rx="${size*0.01}" fill="${color}22"/>
      <rect x="${size*0.33}" y="${size*0.54}" width="${size*0.34}" height="${size*0.1}" rx="${size*0.04}" fill="${color}28" stroke="${color}45" stroke-width="${size*0.005}"/>
    </svg>`;
  }

  // ─── DOM refs ─────────────────────────────────────────────────────────────
  const mainImg   = document.getElementById('pdpMainImg');
  const thumbWrap = document.getElementById('pdpThumbs');
  const titleEl   = document.getElementById('pdpTitle');
  const taglineEl = document.getElementById('pdpTagline');
  const brandEl   = document.getElementById('pdpBrand');
  const ratingEl  = document.getElementById('pdpRating');
  const priceSale = document.getElementById('pdpPriceSale');
  const priceOrig = document.getElementById('pdpPriceOrig');
  const priceDis  = document.getElementById('pdpPriceDiscount');
  const priceSave = document.getElementById('pdpPriceSave');
  const emiNote   = document.getElementById('pdpEmiNote');
  const variantsEl= document.getElementById('pdpVariants');
  const colorsEl  = document.getElementById('pdpColors');
  const colorLbl  = document.getElementById('pdpColorLabel');
  const hlList    = document.getElementById('pdpHighlights');
  const descBody  = document.getElementById('pdpDescBody');
  const descToggle= document.getElementById('pdpDescToggle');
  const specsEl   = document.getElementById('pdpSpecs');
  const deliveryEl= document.getElementById('pdpDelivery');
  const emiEl     = document.getElementById('pdpEmi');
  const barPrice  = document.getElementById('pdpBarPrice');
  const barEmi    = document.getElementById('pdpBarEmi');
  const relTrack  = document.getElementById('pdpRelTrack');
  const relPrev   = document.getElementById('pdpRelPrev');
  const relNext   = document.getElementById('pdpRelNext');
  const relViewport = document.getElementById('pdpRelViewport');
  // Track state
  let selectedColor   = 0;
  let selectedVariants = {};

  // ─── Populate page ────────────────────────────────────────────────────────

  // Title / brand / tagline
  titleEl   && (titleEl.textContent   = product.name);
  taglineEl && (taglineEl.textContent = product.tagline);
  brandEl   && (brandEl.textContent   = product.brand);

  // Rating
  if (ratingEl) {
    ratingEl.innerHTML = `
      <span class="pdp-info__rating-badge">
        ${starsSVG(product.rating)}
        <strong>${product.rating}</strong>
      </span>
      <span class="pdp-info__rating-sep"></span>
      <span class="pdp-info__rating-count">${product.reviews.toLocaleString()} ratings</span>`;
  }

  // Price
  const save = product.originalPrice - product.salePrice;
  priceSale && (priceSale.textContent = fmt(product.salePrice));
  priceOrig && (priceOrig.textContent = fmt(product.originalPrice));
  priceDis  && (priceDis.textContent  = `${product.discount}% off`);
  priceSave && (priceSave.textContent = `Save ${fmt(save)}`);
  emiNote   && (emiNote.innerHTML     = product.emi
    ? `No cost EMI from <strong>${fmt(product.emi.from)}/mo</strong> · ${product.emi.months} months`
    : '');

  // Sticky bar price
  barPrice && (barPrice.textContent = fmt(product.salePrice));
  barEmi   && (barEmi.textContent   = product.emi ? `EMI from ${fmt(product.emi.from)}/mo` : '');

  // ─── Gallery ──────────────────────────────────────────────────────────────
  const color   = product.colors[0];
  const imgColor= color.hex;

  // Main image
  function setMainImage(color) {
    if (mainImg) mainImg.innerHTML = placeholder(color, 400);
  }

  setMainImage(imgColor);

  // Thumbnails (5 views of same product)
  if (thumbWrap) {
    thumbWrap.innerHTML = Array.from({ length: 5 }, (_, i) => `
      <button class="pdp-gallery__thumb${i === 0 ? ' active' : ''}"
        data-idx="${i}" aria-label="Product view ${i + 1}">
        ${placeholder(imgColor, 60)}
      </button>`
    ).join('');

    thumbWrap.querySelectorAll('.pdp-gallery__thumb').forEach(thumb => {
      thumb.addEventListener('click', () => {
        thumbWrap.querySelectorAll('.pdp-gallery__thumb').forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
        // Trigger zoom-out / zoom-in animation
        if (mainImg) {
          mainImg.style.opacity = '0';
          mainImg.style.transform = 'scale(0.96)';
          setTimeout(() => {
            mainImg.style.opacity = '1';
            mainImg.style.transform = 'scale(1)';
          }, 150);
        }
      });
    });

    if (mainImg) {
      mainImg.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
    }
  }


  // ─── Variants ─────────────────────────────────────────────────────────────
  if (variantsEl && product.variants.length) {
    variantsEl.innerHTML = product.variants.map(group => `
      <div class="pdp-variant-group" data-group="${group.group}">
        <p class="pdp-variant-group__label">
          ${group.group}: <span id="varLabel-${group.group.replace(/\s+/g,'-')}">${group.options[0]}</span>
        </p>
        <div class="pdp-variant-group__options">
          ${group.options.map((opt, i) => `
            <button class="pdp-variant-btn${i === 0 ? ' active' : ''}"
              data-group="${group.group}" data-value="${opt}">
              ${opt}
            </button>`).join('')}
        </div>
      </div>`
    ).join('');

    // Set default selected
    product.variants.forEach(g => { selectedVariants[g.group] = g.options[0]; });

    variantsEl.querySelectorAll('.pdp-variant-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const group = btn.dataset.group;
        const value = btn.dataset.value;
        selectedVariants[group] = value;
        // Update active state
        variantsEl.querySelectorAll(`.pdp-variant-btn[data-group="${group}"]`)
          .forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        // Update label
        const lbl = document.getElementById(`varLabel-${group.replace(/\s+/g,'-')}`);
        lbl && (lbl.textContent = value);
      });
    });
  }

  // ─── Colors ───────────────────────────────────────────────────────────────
  if (colorsEl && product.colors.length) {
    colorsEl.innerHTML = product.colors.map((c, i) => `
      <button class="pdp-color-btn${i === 0 ? ' active' : ''}"
        data-idx="${i}" data-color="${c.hex}" aria-label="${c.label}">
        <span class="pdp-color-btn__swatch" style="background-color:${c.hex};"></span>
        <span class="pdp-color-btn__name">${c.label}</span>
      </button>`
    ).join('');

    if (colorLbl) colorLbl.textContent = product.colors[0].label;

    colorsEl.querySelectorAll('.pdp-color-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedColor = parseInt(btn.dataset.idx);
        colorsEl.querySelectorAll('.pdp-color-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (colorLbl) colorLbl.textContent = product.colors[selectedColor].label;
        // Regenerate main image with new colour
        setMainImage(btn.dataset.color);
        // Regenerate thumbnails with new colour
        if (thumbWrap) {
          thumbWrap.querySelectorAll('.pdp-gallery__thumb').forEach(t => {
            t.innerHTML = placeholder(btn.dataset.color, 60);
          });
        }
      });
    });
  }

  // ─── Highlights ───────────────────────────────────────────────────────────
  if (hlList && product.highlights) {
    hlList.innerHTML = product.highlights.map(h => `
      <li class="pdp-highlights__item">
        <span class="pdp-highlights__dot" aria-hidden="true"></span>
        <span>${h}</span>
      </li>`
    ).join('');
  }

  // ─── Description toggle ───────────────────────────────────────────────────
  if (descBody && product.description) {
    descBody.textContent = product.description;
    descBody.classList.add('pdp-description__body--collapsed');
  }

  if (descToggle) {
    descToggle.addEventListener('click', () => {
      const expanded = descToggle.classList.toggle('expanded');
      descBody.classList.toggle('pdp-description__body--collapsed', !expanded);
      descBody.classList.toggle('pdp-description__body--expanded',   expanded);
      descToggle.innerHTML = expanded
        ? `Read Less <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="4 10 8 6 12 10"/></svg>`
        : `Read More <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="4 6 8 10 12 6"/></svg>`;
    });
  }

  // ─── Specifications ───────────────────────────────────────────────────────
  if (specsEl && product.specs) {
    specsEl.innerHTML = product.specs.map(group => `
      <div class="pdp-specs__group">
        <p class="pdp-specs__group-name">${group.group}</p>
        <table class="pdp-specs__table">
          ${group.rows.map(([key, val]) => `
            <tr class="pdp-specs__row">
              <td class="pdp-specs__key">${key}</td>
              <td class="pdp-specs__val">${val}</td>
            </tr>`).join('')}
        </table>
      </div>`
    ).join('');
  }

  // ─── Delivery ─────────────────────────────────────────────────────────────
  if (deliveryEl && product.delivery) {
    const d = product.delivery;
    deliveryEl.innerHTML = `
      <div class="pdp-delivery__row">
        <div class="pdp-delivery__icon" aria-hidden="true">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round">
            <rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h2l1 4v4h-3V8z"/><circle cx="5.5" cy="17.5" r="1.5"/><circle cx="15.5" cy="17.5" r="1.5"/>
          </svg>
        </div>
        <div>
          <p class="pdp-delivery__title">${d.free ? 'Free Delivery' : 'Standard Delivery'}</p>
          <p class="pdp-delivery__note--green pdp-delivery__note">Estimated by ${d.date}</p>
          <p class="pdp-delivery__note">${d.note}</p>
        </div>
      </div>
      ${d.pickup ? `
      <div class="pdp-delivery__row">
        <div class="pdp-delivery__icon" aria-hidden="true">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round">
            <path d="M10 18s-7-5.686-7-10a7 7 0 1114 0C17 12.314 10 18 10 18z"/><circle cx="10" cy="8" r="2.5"/>
          </svg>
        </div>
        <div>
          <p class="pdp-delivery__title">Store Pickup Available</p>
          <p class="pdp-delivery__note">Main Road, Hyderabad — Ready same day</p>
        </div>
      </div>` : ''}
      ${d.installation ? `
      <div class="pdp-delivery__row">
        <div class="pdp-delivery__icon" aria-hidden="true">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round">
            <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l1.7-1.7a6 6 0 01-7.4 7.4l-7 7a2.12 2.12 0 01-3-3l7-7a6 6 0 017.7-7.7z"/>
          </svg>
        </div>
        <div>
          <p class="pdp-delivery__title">Free Installation Included</p>
          <p class="pdp-delivery__note">By certified technician within 24–48 hrs of delivery</p>
        </div>
      </div>` : ''}`;
  }

  // ─── EMI card ─────────────────────────────────────────────────────────────
  if (emiEl && product.emi) {
    emiEl.innerHTML = `
      <div class="pdp-emi__header">
        <p class="pdp-emi__title">Need EMI?</p>
        <span class="pdp-emi__badge">0% Interest</span>
      </div>
      <p class="pdp-emi__desc">Reach out to us to know your EMI eligibility. Instant approval, zero paperwork.</p>
      <div class="pdp-emi__partners">
        <div class="pdp-emi__partner" style="background:#cc0000;"><span>TVS Credit</span></div>
        <div class="pdp-emi__partner" style="background:#00008b;"><span>Bajaj Finserv</span></div>
      </div>
      <a href="tel:9963657799" class="btn btn--accent pdp-emi__cta">
        <svg class="icon icon--sm" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
        </svg>
        Know Eligibility
      </a>`;
  }

  // ─── Related products carousel ────────────────────────────────────────────
  if (relTrack && window.categoryPlpData) {
    const relProducts = (window.categoryPlpData[product.relatedCategory] || [])
      .filter(p => p.id !== productId)
      .slice(0, 8);

    relTrack.innerHTML = relProducts.map(p => `
      <article class="plp-card" role="listitem" style="width:200px; flex-shrink:0;">
        <div class="plp-card__image-wrap">
          ${p.badge ? `<span class="plp-card__badge plp-card__badge--${p.badgeType}">${p.badge}</span>` : ''}
          <div class="plp-card__image-placeholder" aria-hidden="true">
            <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="200" height="200" fill="var(--color-bg-tertiary)"/>
              <rect x="50" y="38" width="100" height="124" rx="9" fill="${p.color}14" stroke="${p.color}35" stroke-width="1.5"/>
              <rect x="64" y="52" width="72" height="92" rx="5" fill="${p.color}08"/>
              <rect x="72" y="64" width="56" height="5" rx="2.5" fill="${p.color}45"/>
              <rect x="72" y="76" width="42" height="3.5" rx="1.75" fill="${p.color}28"/>
              <rect x="72" y="90" width="56" height="16" rx="5" fill="${p.color}28" stroke="${p.color}45" stroke-width="1"/>
            </svg>
          </div>
        </div>
        <div class="plp-card__body">
          <p class="plp-card__brand">${p.brand}</p>
          <h3 class="plp-card__name">${p.name}</h3>
          <div class="plp-card__price">
            <span class="plp-card__price-sale">₹${p.salePrice.toLocaleString('en-IN')}</span>
            <span class="plp-card__price-discount">${p.discount}% off</span>
          </div>
        </div>
        <div class="plp-card__footer">
          <a href="/product/${p.id}" class="btn btn--primary plp-card__cta">
            View Details
          </a>
        </div>
      </article>`
    ).join('');

    // Scroll controls
    const SCROLL = 220;
    relPrev && relPrev.addEventListener('click', () => {
      relViewport.scrollBy({ left: -SCROLL * 3, behavior: 'smooth' });
    });
    relNext && relNext.addEventListener('click', () => {
      relViewport.scrollBy({ left:  SCROLL * 3, behavior: 'smooth' });
    });

    // Drag
    let drag = false, startX = 0, scrollLeft = 0;
    relViewport && relViewport.addEventListener('mousedown', e => {
      drag = true; startX = e.pageX - relViewport.offsetLeft;
      scrollLeft = relViewport.scrollLeft; relViewport.style.cursor = 'grabbing';
    });
    relViewport && relViewport.addEventListener('mousemove', e => {
      if (!drag) return; e.preventDefault();
      relViewport.scrollLeft = scrollLeft - (e.pageX - relViewport.offsetLeft - startX) * 1.4;
    });
    const stopDrag = () => { drag = false; relViewport && (relViewport.style.cursor = 'grab'); };
    relViewport && relViewport.addEventListener('mouseup', stopDrag);
    relViewport && relViewport.addEventListener('mouseleave', stopDrag);
  }

  // ─── Buy Now + Add to Cart ────────────────────────────────────────────────
  document.querySelectorAll('[data-action="buy-now"]').forEach(btn => {
    btn.addEventListener('click', () => {
      window.location.href = '/checkout';
    });
  });

  // ─── Scroll reveal ────────────────────────────────────────────────────────
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  }

})();
