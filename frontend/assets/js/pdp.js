/**
 * pdp.js — Product Details Page interactions.
 * Handles: gallery, variant selection, color picker,
 *          description collapse, sticky bar, related carousel.
 * Hybrid Architecture:
 * - Reads window.productCatalogue[id] for static categories (TVs, ACs, etc.)
 * - Fetches from GET /api/products/:id for database-backed Mobile products
 */

(function () {
  'use strict';

  // ─── Resolve product ID / slug from URL ───────────────────────────────────
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  const rawId = pathParts[pathParts.length - 1];
  const numericId = parseInt(rawId, 10);

  // ─── Helpers ──────────────────────────────────────────────────────────────
  function fmt(n) {
    return '₹' + Number(n).toLocaleString('en-IN');
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
  const mainImg     = document.getElementById('pdpMainImg');
  const pdpBadge    = document.getElementById('pdpBadge');
  const thumbWrap   = document.getElementById('pdpThumbs');
  const titleEl     = document.getElementById('pdpTitle');
  const taglineEl   = document.getElementById('pdpTagline');
  const brandEl     = document.getElementById('pdpBrand');
  const ratingEl    = document.getElementById('pdpRating');
  const priceSale   = document.getElementById('pdpPriceSale');
  const priceOrig   = document.getElementById('pdpPriceOrig');
  const priceDis    = document.getElementById('pdpPriceDiscount');
  const priceSave   = document.getElementById('pdpPriceSave');
  const emiNote     = document.getElementById('pdpEmiNote');
  const variantsEl  = document.getElementById('pdpVariants');
  const colorsEl    = document.getElementById('pdpColors');
  const colorLbl    = document.getElementById('pdpColorLabel');
  const hlList      = document.getElementById('pdpHighlights');
  const descBody    = document.getElementById('pdpDescBody');
  const descToggle  = document.getElementById('pdpDescToggle');
  const specsEl     = document.getElementById('pdpSpecs');
  const deliveryEl  = document.getElementById('pdpDelivery');
  const emiEl       = document.getElementById('pdpEmi');
  const barPrice    = document.getElementById('pdpBarPrice');
  const barEmi      = document.getElementById('pdpBarEmi');
  const relTrack    = document.getElementById('pdpRelTrack');
  const relPrev     = document.getElementById('pdpRelPrev');
  const relNext     = document.getElementById('pdpRelNext');
  const relViewport = document.getElementById('pdpRelViewport');

  let selectedColor = 0;
  let selectedVariants = {};

  // ─── Main Render Function ─────────────────────────────────────────────────
  function renderProduct(product) {
    if (!product) return;

    const isAvailable = product.availability ? product.availability === 'AVAILABLE' : true;

    // Title / brand / tagline
    titleEl   && (titleEl.textContent   = product.name);
    taglineEl && (taglineEl.textContent = product.tagline || '');
    brandEl   && (brandEl.textContent   = product.brand);

    // Rating
    if (ratingEl) {
      ratingEl.innerHTML = `
        <span class="pdp-info__rating-badge">
          ${starsSVG(product.rating || 4.8)}
          <strong>${product.rating || 4.8}</strong>
        </span>
        <span class="pdp-info__rating-sep"></span>
        <span class="pdp-info__rating-count">${(product.reviews || 1240).toLocaleString()} ratings</span>`;
    }

    // Badge
    if (pdpBadge) {
      if (!isAvailable) {
        pdpBadge.textContent = 'Out of Stock';
        pdpBadge.style.backgroundColor = 'var(--color-primary-700)';
      } else if (product.discount && product.discount > 0) {
        pdpBadge.textContent = `${product.discount}% Off`;
        pdpBadge.style.backgroundColor = 'var(--color-accent-500)';
      } else {
        pdpBadge.textContent = 'Official';
        pdpBadge.style.backgroundColor = 'var(--color-primary-700)';
      }
    }

    // Price
    const origPrice = product.originalPrice || product.salePrice;
    const salePriceVal = product.salePrice;
    const save = origPrice - salePriceVal;

    priceSale && (priceSale.textContent = fmt(salePriceVal));
    if (priceOrig) {
      priceOrig.textContent = save > 0 ? fmt(origPrice) : '';
    }
    if (priceDis) {
      priceDis.textContent = product.discount && product.discount > 0 ? `${product.discount}% off` : '';
    }
    if (priceSave) {
      priceSave.textContent = save > 0 ? `Save ${fmt(save)}` : '';
    }
    if (emiNote) {
      emiNote.innerHTML = product.emi
        ? `No cost EMI from <strong>${fmt(product.emi.from)}/mo</strong> · ${product.emi.months} months`
        : '';
    }

    // Sticky bar price
    barPrice && (barPrice.textContent = fmt(salePriceVal));
    barEmi   && (barEmi.textContent   = product.emi ? `EMI from ${fmt(product.emi.from)}/mo` : '');

    // Buy bar availability state
    if (!isAvailable) {
      document.querySelectorAll('[data-action="buy-now"]').forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.6';
        btn.style.cursor = 'not-allowed';
        const label = btn.querySelector('.pdp-buy-bar__buy-label');
        if (label) label.textContent = 'Out of Stock';
      });
      document.querySelectorAll('[data-action="add-cart"]').forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.6';
        btn.style.cursor = 'not-allowed';
      });
    }

    // ─── Gallery ────────────────────────────────────────────────────────────
    if (product.imageUrl) {
      // Cloudinary / Real image
      if (mainImg) {
        mainImg.innerHTML = `<img src="${product.imageUrl}" alt="${product.brand} ${product.name}" class="pdp-gallery__img" />`;
      }
      if (thumbWrap) {
        const images = (product.images && product.images.length) ? product.images : [product.imageUrl];
        thumbWrap.innerHTML = images.map((imgUrl, i) => `
          <button class="pdp-gallery__thumb${i === 0 ? ' active' : ''}"
            data-idx="${i}" aria-label="Product view ${i + 1}">
            <img src="${imgUrl}" alt="${product.name} thumbnail ${i + 1}" />
          </button>`
        ).join('');

        thumbWrap.querySelectorAll('.pdp-gallery__thumb').forEach(thumb => {
          thumb.addEventListener('click', () => {
            thumbWrap.querySelectorAll('.pdp-gallery__thumb').forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
            const img = thumb.querySelector('img');
            if (mainImg && img) {
              mainImg.innerHTML = `<img src="${img.src}" alt="${product.name}" class="pdp-gallery__img" />`;
            }
          });
        });
      }
    } else {
      // SVG Placeholder fallback
      const colorHex = (product.colors && product.colors[0]?.hex) || '#1e3d8f';
      if (mainImg) mainImg.innerHTML = placeholder(colorHex, 400);

      if (thumbWrap) {
        thumbWrap.innerHTML = Array.from({ length: 5 }, (_, i) => `
          <button class="pdp-gallery__thumb${i === 0 ? ' active' : ''}"
            data-idx="${i}" aria-label="Product view ${i + 1}">
            ${placeholder(colorHex, 60)}
          </button>`
        ).join('');

        thumbWrap.querySelectorAll('.pdp-gallery__thumb').forEach(thumb => {
          thumb.addEventListener('click', () => {
            thumbWrap.querySelectorAll('.pdp-gallery__thumb').forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
          });
        });
      }
    }

    // ─── Variants ───────────────────────────────────────────────────────────
    if (variantsEl && product.variants && product.variants.length) {
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

      product.variants.forEach(g => { selectedVariants[g.group] = g.options[0]; });

      variantsEl.querySelectorAll('.pdp-variant-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const group = btn.dataset.group;
          const value = btn.dataset.value;
          selectedVariants[group] = value;
          variantsEl.querySelectorAll(`.pdp-variant-btn[data-group="${group}"]`)
            .forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const lbl = document.getElementById(`varLabel-${group.replace(/\s+/g,'-')}`);
          lbl && (lbl.textContent = value);
        });
      });
    } else if (variantsEl) {
      variantsEl.innerHTML = '';
    }

    // ─── Colors ─────────────────────────────────────────────────────────────
    if (colorsEl && product.colors && product.colors.length > 1) {
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
          if (!product.imageUrl && mainImg) {
            mainImg.innerHTML = placeholder(btn.dataset.color, 400);
          }
        });
      });
    } else if (colorsEl) {
      const parentColorSec = colorsEl.closest('.pdp-colors');
      if (parentColorSec) parentColorSec.style.display = 'none';
    }

    // ─── Highlights ─────────────────────────────────────────────────────────
    if (hlList && product.highlights && product.highlights.length) {
      hlList.innerHTML = product.highlights.map(h => `
        <li class="pdp-highlights__item">
          <span class="pdp-highlights__dot" aria-hidden="true"></span>
          <span>${h}</span>
        </li>`
      ).join('');
    }

    // ─── Description toggle ─────────────────────────────────────────────────
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

    // ─── Specifications ─────────────────────────────────────────────────────
    if (specsEl && product.specs && product.specs.length) {
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

    // ─── Delivery ───────────────────────────────────────────────────────────
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
            <p class="pdp-delivery__note--green pdp-delivery__note">Estimated: ${d.date}</p>
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

    // ─── EMI card ───────────────────────────────────────────────────────────
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

    // ─── Related products carousel ──────────────────────────────────────────
    loadRelatedProducts(product);
  }

  // ─── Related Products ─────────────────────────────────────────────────────
  async function loadRelatedProducts(currentProduct) {
    if (!relTrack) return;

    if (currentProduct.relatedCategory === 'mobiles') {
      try {
        const res = await fetch('/api/products/category/mobiles');
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const others = json.data.filter(p => p.slug !== currentProduct.slug && p.id !== currentProduct.dbId);
          renderRelatedTrack(others.map(p => ({
            id: p.slug,
            brand: p.brand,
            name: p.name,
            salePrice: parseFloat(p.price) || 0,
            discount: 0,
            imageUrl: p.productImages?.[0]?.imageUrl || '',
            badge: p.availability === 'AVAILABLE' ? 'In Stock' : 'Out of Stock',
            badgeType: p.availability === 'AVAILABLE' ? 'success' : 'primary',
          })));
          return;
        }
      } catch (err) {
        console.error('Failed to load related mobile products:', err);
      }
    }

    if (window.categoryPlpData && currentProduct.relatedCategory) {
      const relProducts = (window.categoryPlpData[currentProduct.relatedCategory] || [])
        .filter(p => p.id !== currentProduct.id)
        .slice(0, 8);
      renderRelatedTrack(relProducts);
    }
  }

  function renderRelatedTrack(products) {
    if (!relTrack) return;
    relTrack.innerHTML = products.map(p => `
      <article class="plp-card" role="listitem" style="width:200px; flex-shrink:0;">
        <div class="plp-card__image-wrap">
          ${p.badge ? `<span class="plp-card__badge plp-card__badge--${p.badgeType || 'primary'}">${p.badge}</span>` : ''}
          <div class="plp-card__image-placeholder" aria-hidden="true">
            ${p.imageUrl
              ? `<img src="${p.imageUrl}" alt="${p.brand} ${p.name}" class="plp-card__img" loading="lazy" />`
              : `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="200" height="200" fill="var(--color-bg-tertiary)"/>
                  <rect x="50" y="38" width="100" height="124" rx="9" fill="#1e3d8f14" stroke="#1e3d8f35" stroke-width="1.5"/>
                  <rect x="64" y="52" width="72" height="92" rx="5" fill="#1e3d8f08"/>
                  <rect x="72" y="64" width="56" height="5" rx="2.5" fill="#1e3d8f45"/>
                  <rect x="72" y="76" width="42" height="3.5" rx="1.75" fill="#1e3d8f28"/>
                  <rect x="72" y="90" width="56" height="16" rx="5" fill="#1e3d8f28" stroke="#1e3d8f45" stroke-width="1"/>
                </svg>`}
          </div>
        </div>
        <div class="plp-card__body">
          <p class="plp-card__brand">${p.brand}</p>
          <h3 class="plp-card__name">${p.name}</h3>
          <div class="plp-card__price">
            <span class="plp-card__price-sale">₹${p.salePrice.toLocaleString('en-IN')}</span>
            ${p.discount ? `<span class="plp-card__price-discount">${p.discount}% off</span>` : ''}
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
      relViewport && relViewport.scrollBy({ left: -SCROLL * 3, behavior: 'smooth' });
    });
    relNext && relNext.addEventListener('click', () => {
      relViewport && relViewport.scrollBy({ left:  SCROLL * 3, behavior: 'smooth' });
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

  // ─── Fetch Product from Database or Load Static ───────────────────────────
  async function initProduct() {
    // 1. Check if it's an existing static non-mobile product (TV 301, AC 401, etc.)
    if (numericId && window.productCatalogue && window.productCatalogue[numericId]) {
      const staticProd = window.productCatalogue[numericId];
      if (staticProd.category !== 'mobiles') {
        renderProduct(staticProd);
        return;
      }
    }

    // 2. Otherwise, fetch from backend API (/api/products/:identifier)
    try {
      if (titleEl) titleEl.textContent = 'Loading product details…';
      const res = await fetch(`/api/products/${encodeURIComponent(rawId)}`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();

      if (json.success && json.data) {
        const p = json.data;
        const primaryImg = p.productImages?.find(img => img.isPrimary)?.imageUrl
          || p.productImages?.[0]?.imageUrl
          || '';
        const allImages = p.productImages?.map(img => img.imageUrl) || [];
        const price = parseFloat(p.price) || 0;
        const isAvailable = p.availability === 'AVAILABLE';

        const backendProduct = {
          id: p.slug || p.id,
          slug: p.slug,
          dbId: p.id,
          category: 'mobiles',
          brand: p.brand,
          name: p.name,
          tagline: `${p.brand} Official Smartphone · 100% Genuine`,
          originalPrice: price,
          salePrice: price,
          discount: 0,
          rating: 4.8,
          reviews: 1240,
          availability: p.availability,
          imageUrl: primaryImg,
          images: allImages.length ? allImages : [primaryImg],
          colors: [
            { label: 'Standard', hex: '#1c1c1e', images: [] }
          ],
          variants: [
            { group: 'Storage', options: ['128GB', '256GB', '512GB'] },
          ],
          highlights: [
            `${p.brand} Official Warranty — 1 Year`,
            `100% Original & Authentic Product`,
            `Free & Secure Doorstep Delivery`,
            `7 Days Replacement Guarantee`,
            `0% Interest EMI Options Available`,
          ],
          description: p.description || `${p.name} by ${p.brand}. Official product with manufacturer warranty.`,
          specs: [
            {
              group: 'General',
              rows: [
                ['Brand', p.brand],
                ['Model', p.name],
                ['Availability', isAvailable ? 'In Stock' : 'Out of Stock'],
                ['Warranty', '1 Year Official Warranty'],
              ]
            },
            {
              group: 'Purchase & Delivery',
              rows: [
                ['Delivery', isAvailable ? 'Available for Delivery' : 'Out of Stock'],
                ['Payment Modes', 'Cash on Delivery, UPI, Cards, 0% EMI'],
                ['Store Pickup', 'Available at Hyderabad Main Branch'],
              ]
            }
          ],
          delivery: {
            date: isAvailable ? 'Tomorrow' : 'Currently Unavailable',
            note: isAvailable ? 'Order before 8 PM for express dispatch' : 'Item is currently out of stock',
            pickup: isAvailable,
            installation: false,
            free: isAvailable,
          },
          emi: {
            from: Math.ceil(price / 12),
            months: 12,
          },
          relatedCategory: 'mobiles',
        };

        renderProduct(backendProduct);
      } else {
        throw new Error(json.message || 'Product not found');
      }
    } catch (err) {
      console.error('Error fetching product from API:', err);
      if (titleEl) titleEl.textContent = 'Product Not Found';
      if (taglineEl) taglineEl.textContent = 'The product you are looking for is currently unavailable or does not exist.';
    }
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

  // ─── Initialize ───────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProduct);
  } else {
    initProduct();
  }

})();
