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
    const rId = Math.random().toString(36).slice(2, 8);
    const percent = Math.round((rating % 1) * 100);
    
    const stars = Array.from({ length: 5 }, (_, i) => {
      let fill = 'var(--gray-300)';
      let defs = '';
      if (rating >= i + 1) {
        fill = 'var(--color-warning-500)';
      } else if (rating > i) {
        fill = `url(#grad-${rId}-${i})`;
        defs = `<defs><linearGradient id="grad-${rId}-${i}" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="${percent}%" stop-color="var(--color-warning-500)" /><stop offset="${percent}%" stop-color="var(--gray-300)" /></linearGradient></defs>`;
      }
      return `<svg data-star="${i+1}" class="pdp-star-icon" width="18" height="18" viewBox="0 0 16 16" style="fill:${fill}; cursor: pointer; transition: transform 0.1s; margin-right: 2px;">${defs}<path d="M8 1.5l1.8 5.5H16l-4.6 3.3 1.8 5.5L8 11.5l-5.2 3.3 1.8-5.5L0 7h6.2z"/></svg>`;
    }).join('');
    
    return stars;
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

  function showRightToast(message) {
    let toast = document.getElementById('top-right-toast');
    if (!toast) {
      const style = document.createElement('style');
      style.textContent = `
        #top-right-toast {
          position: fixed;
          top: 90px;
          right: 20px;
          background: #1a1a1a;
          color: #fff;
          padding: 12px 20px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 9999;
          transform: translateX(150%);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-family: Inter, sans-serif;
          font-weight: 500;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          max-width: 350px;
        }
        #top-right-toast.show { transform: translateX(0); }
        @media (max-width: 768px) {
          #top-right-toast {
            top: 75px; right: 16px; width: calc(100vw - 32px); max-width: none;
          }
        }
      `;
      document.head.appendChild(style);
      toast = document.createElement('div');
      toast.id = 'top-right-toast';
      toast.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> <span class="toast-msg"></span>`;
      document.body.appendChild(toast);
    }
    toast.querySelector('.toast-msg').textContent = message;
    requestAnimationFrame(() => toast.classList.add('show'));
    if (toast.hideTimeout) clearTimeout(toast.hideTimeout);
    toast.hideTimeout = setTimeout(() => toast.classList.remove('show'), 3000);
  }

  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[&<>"']/g, m => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[m]);
  }

  function formatDescriptionToBullets(desc) {
    if (!desc || typeof desc !== 'string') return [];
    // Break content right after comma (,) or period (.), preserving decimals (1.5), thousands (50,000), and common abbreviations (sq.ft, etc.)
    const re = /(?<=(?:\D,|[0-9],(?!\d)|(?<!\b(?:sq|approx|etc|eg|ie))\.(?!\d)))\s*(?![.,])|\n+/i;
    return desc
      .split(re)
      .map(s => s.replace(/^[-•*]\s*/, '').trim())
      .filter(s => /[a-zA-Z0-9]/.test(s));
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
  let currentProductData = null;
  let currentSelectedVariant = null;

  // Pulse animation style injection
  if (!document.getElementById('pdp-price-anim-style')) {
    const animStyle = document.createElement('style');
    animStyle.id = 'pdp-price-anim-style';
    animStyle.textContent = `
      @keyframes pdpPricePulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.08); color: var(--color-primary-600, #1e3d8f); }
        100% { transform: scale(1); }
      }
      .pdp-price--updated {
        display: inline-block;
        animation: pdpPricePulse 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      }
    `;
    document.head.appendChild(animStyle);
  }

  function updatePriceAndDetails(newPrice, isAvail) {
    if (priceSale) {
      priceSale.textContent = fmt(newPrice);
      priceSale.classList.remove('pdp-price--updated');
      void priceSale.offsetWidth;
      priceSale.classList.add('pdp-price--updated');
    }
    if (barPrice) {
      barPrice.textContent = fmt(newPrice);
      barPrice.classList.remove('pdp-price--updated');
      void barPrice.offsetWidth;
      barPrice.classList.add('pdp-price--updated');
    }

    const baseOrig = (currentProductData && (currentProductData.originalPrice || currentProductData.salePrice)) || newPrice;
    const origPrice = baseOrig > newPrice ? baseOrig : newPrice;
    const save = origPrice - newPrice;

    if (priceOrig) priceOrig.textContent = save > 0 ? fmt(origPrice) : '';
    if (priceSave) priceSave.textContent = save > 0 ? `Save ${fmt(save)}` : '';
    if (priceDis) {
      if (currentProductData?.discount && currentProductData.discount > 0) {
        priceDis.textContent = `${currentProductData.discount}% off`;
      } else if (save > 0) {
        priceDis.textContent = `${Math.round((save / origPrice) * 100)}% off`;
      } else {
        priceDis.textContent = '';
      }
    }

    const emiFrom = Math.ceil(newPrice / 12);
    if (emiNote) {
      emiNote.innerHTML = `No cost EMI from <strong>${fmt(emiFrom)}/mo</strong> · 12 months`;
    }
    if (barEmi) {
      barEmi.textContent = `EMI from ${fmt(emiFrom)}/mo`;
    }

    // Update buttons & badge based on variant availability
    document.querySelectorAll('[data-action="buy-now"]').forEach(btn => {
      btn.disabled = !isAvail;
      btn.style.opacity = isAvail ? '1' : '0.6';
      btn.style.cursor = isAvail ? 'pointer' : 'not-allowed';
      const label = btn.querySelector('.pdp-buy-bar__buy-label');
      if (label) label.textContent = isAvail ? 'Buy Now' : 'Out of Stock';
    });
    document.querySelectorAll('[data-action="add-cart"]').forEach(btn => {
      btn.disabled = !isAvail;
      btn.style.opacity = isAvail ? '1' : '0.6';
      btn.style.cursor = isAvail ? 'pointer' : 'not-allowed';
    });

    if (pdpBadge) {
      if (!isAvail) {
        pdpBadge.textContent = 'Out of Stock';
        pdpBadge.style.backgroundColor = 'var(--color-primary-700)';
      } else if (save > 0) {
        pdpBadge.textContent = `${Math.round((save / origPrice) * 100)}% Off`;
        pdpBadge.style.backgroundColor = 'var(--color-accent-500)';
      } else {
        pdpBadge.textContent = 'Official';
        pdpBadge.style.backgroundColor = 'var(--color-primary-700)';
      }
    }
  }

  function handleVariantSelection(triggerGroup, triggerValue) {
    if (!currentProductData) return;
    const rawVariants = currentProductData.rawVariants || [];

    if (rawVariants.length > 0) {
      // Check if there is an exact or best matching variant
      const proposed = { ...selectedVariants, [triggerGroup]: triggerValue };

      let exact = rawVariants.find(v => {
        return v.attributeValues?.every(av => {
          const g = av.attribute?.displayName || av.attribute?.name;
          const val = av.displayValue || av.value;
          return proposed[g] === undefined || proposed[g] === val;
        });
      });

      // If no exact match with other current choices, pick the first variant matching this option
      if (!exact) {
        exact = rawVariants.find(v => {
          return v.attributeValues?.some(av => {
            const g = av.attribute?.displayName || av.attribute?.name;
            const val = av.displayValue || av.value;
            return g === triggerGroup && val === triggerValue;
          });
        }) || rawVariants[0];
      }

      // Synchronize all attributes to the selected variant
      if (exact && exact.attributeValues) {
        exact.attributeValues.forEach(av => {
          const g = av.attribute?.displayName || av.attribute?.name;
          selectedVariants[g] = av.displayValue || av.value;
        });
        currentSelectedVariant = exact;
      } else {
        selectedVariants[triggerGroup] = triggerValue;
      }

      // Update variant buttons & labels in DOM
      if (variantsEl) {
        for (const [grp, val] of Object.entries(selectedVariants)) {
          variantsEl.querySelectorAll(`.pdp-variant-btn[data-group="${grp}"]`).forEach(btn => {
            btn.classList.toggle('active', btn.dataset.value === val);
          });
          const lbl = document.getElementById(`varLabel-${grp.replace(/\s+/g, '-')}`);
          if (lbl) lbl.textContent = val;
        }
      }

      // Update color button in DOM if applicable
      if (colorsEl && selectedVariants['Color']) {
        const curCol = selectedVariants['Color'];
        colorsEl.querySelectorAll('.pdp-color-btn').forEach(btn => {
          const nameSpan = btn.querySelector('.pdp-color-btn__name');
          const isAct = nameSpan && nameSpan.textContent.trim() === curCol;
          btn.classList.toggle('active', isAct);
        });
        if (colorLbl) colorLbl.textContent = curCol;
      }

      // Update price and availability
      const effectivePrice = (currentSelectedVariant && currentSelectedVariant.priceOverride)
        ? parseFloat(currentSelectedVariant.priceOverride)
        : (currentProductData.originalPrice || currentProductData.salePrice);
      const isAvail = currentSelectedVariant
        ? currentSelectedVariant.availability === 'AVAILABLE'
        : true;

      updatePriceAndDetails(effectivePrice, isAvail);

      // If variant has an image, show it
      if (currentSelectedVariant?.images && currentSelectedVariant.images.length > 0 && mainImg) {
        mainImg.innerHTML = `<img src="${currentSelectedVariant.images[0].imageUrl}" alt="${currentProductData.name}" class="pdp-gallery__img" />`;
      }
    } else {
      // Fallback without raw variants
      selectedVariants[triggerGroup] = triggerValue;
      const lbl = document.getElementById(`varLabel-${triggerGroup.replace(/\s+/g, '-')}`);
      if (lbl) lbl.textContent = triggerValue;
      if (variantsEl) {
        variantsEl.querySelectorAll(`.pdp-variant-btn[data-group="${triggerGroup}"]`).forEach(b => {
          b.classList.toggle('active', b.dataset.value === triggerValue);
        });
      }
    }
  }

  // ─── Main Render Function ─────────────────────────────────────────────────
  function renderProduct(product) {
    if (!product) return;
    currentProductData = product;

    // Initialize default variant if present
    if (product.rawVariants && product.rawVariants.length > 0) {
      currentSelectedVariant = product.rawVariants[0];
      currentSelectedVariant.attributeValues?.forEach(av => {
        const g = av.attribute?.displayName || av.attribute?.name;
        selectedVariants[g] = av.displayValue || av.value;
      });
      if (currentSelectedVariant.priceOverride) {
        const rawOverride = parseFloat(currentSelectedVariant.priceOverride);
        product.basePrice = rawOverride;
        product.originalPrice = rawOverride;
        product.salePrice = (product.discount && product.discount > 0)
          ? Math.round(rawOverride * (1 - product.discount / 100))
          : rawOverride;
      }
      product.availability = currentSelectedVariant.availability;
    }

    const isAvailable = product.availability ? product.availability === 'AVAILABLE' : true;

    // Title / brand / tagline
    titleEl   && (titleEl.textContent   = product.name);
    taglineEl && (taglineEl.textContent = product.tagline || '');
    brandEl   && (brandEl.textContent   = product.brand);

    // Rating
    if (ratingEl) {
      ratingEl.innerHTML = `
        <span class="pdp-info__rating-badge" title="Rating">
          ${starsSVG(product.rating || 0)}
          <strong>${product.rating || 0}</strong>
        </span>
        <span class="pdp-info__rating-sep"></span>
        <span class="pdp-info__rating-count">${(product.reviews || 0).toLocaleString()} ratings</span>`;
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

    // Render Free Gifts Banner
    const freeGiftsBanner = document.getElementById('pdpFreeGiftsBanner');
    if (freeGiftsBanner) {
      const gifts = product.gifts || [];
      if (gifts.length > 0) {
        freeGiftsBanner.style.display = 'block';
        freeGiftsBanner.innerHTML = `
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom: 8px;">
            <div style="display:flex; align-items:center; gap: 8px;">
              <span style="font-size: 20px;">🎁</span>
              <div>
                <strong style="color: #831843; font-size: 14px;">Special Promotional Offer: Free Gift${gifts.length > 1 ? 's' : ''} Included!</strong>
                <div style="font-size: 11.5px; color: #9d174d;">You will receive this store item 100% free with your purchase.</div>
              </div>
            </div>
            <span class="badge badge--success" style="font-size: 11px; font-weight: 700; background: #059669; color: white;">FREE GIFT</span>
          </div>
          <div style="display:flex; flex-direction:column; gap: 8px; margin-top: 6px;">
            ${gifts.map(g => `
              <div style="display:flex; align-items:center; justify-content:space-between; background: rgba(255,255,255,0.9); border-radius: 8px; padding: 8px 12px; border: 1px solid #fbcfe8;">
                <div style="display:flex; align-items:center; gap: 10px;">
                  ${g.imageUrl ? `<img src="${g.imageUrl}" style="width: 38px; height: 38px; object-fit: cover; border-radius: 6px; border: 1px solid #f472b6;" alt="${g.name}"/>` : `<span style="font-size: 20px;">🎁</span>`}
                  <div>
                    <strong style="color: #1e293b; font-size: 13px;">${g.name}</strong>
                    <div style="font-size: 11px; color: #64748b;">${g.brand ? `${g.brand} &bull; ` : ''}Store Value: <span style="text-decoration: line-through;">${fmt(g.price)}</span> <strong style="color: #059669; margin-left: 4px;">₹0 Free</strong></div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        `;
      } else {
        freeGiftsBanner.style.display = 'none';
        freeGiftsBanner.innerHTML = '';
      }
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
      function getVariantAttrMap(variant) {
        const map = {};
        if (variant && Array.isArray(variant.attributeValues)) {
          variant.attributeValues.forEach(av => {
            const grp = av.attribute?.displayName || av.attribute?.name || 'Option';
            const val = av.displayValue || av.value;
            map[grp] = val;
          });
        }
        return map;
      }

      // Initialize selectedVariants strictly from a valid variant if rawVariants exist
      selectedVariants = {};
      if (product.rawVariants && product.rawVariants.length > 0) {
        const defaultVar = product.rawVariants.find(v => v.availability === 'AVAILABLE') || product.rawVariants[0];
        const defaultMap = getVariantAttrMap(defaultVar);
        product.variants.forEach(g => {
          selectedVariants[g.group] = defaultMap[g.group] || g.options[0];
        });
      } else {
        product.variants.forEach(g => {
          selectedVariants[g.group] = g.options[0];
        });
      }

      variantsEl.innerHTML = product.variants.map(group => `
        <div class="pdp-variant-group" data-group="${group.group}">
          <p class="pdp-variant-group__label">
            ${group.group}: <span id="varLabel-${group.group.replace(/\s+/g,'-')}">${selectedVariants[group.group] || group.options[0]}</span>
          </p>
          <div class="pdp-variant-group__options">
            ${group.options.map(opt => `
              <button type="button" class="pdp-variant-btn${selectedVariants[group.group] === opt ? ' active' : ''}"
                data-group="${group.group}" data-value="${opt}">
                ${opt}
              </button>`).join('')}
          </div>
        </div>`
      ).join('');

      function findMatchingVariant() {
        if (!product.rawVariants || !product.rawVariants.length) return null;

        const keys = Object.keys(selectedVariants);
        if (keys.length === 0) return null;

        // Strict exact match across all selected attribute groups
        return product.rawVariants.find(v => {
          if (!v.attributeValues || !v.attributeValues.length) return false;
          const vMap = getVariantAttrMap(v);
          return keys.every(grp => vMap[grp] === selectedVariants[grp]);
        }) || null;
      }

      function updateVariantUI() {
        product.variants.forEach(group => {
          const groupName = group.group;
          const curVal = selectedVariants[groupName];

          const lbl = document.getElementById(`varLabel-${groupName.replace(/\s+/g,'-')}`);
          if (lbl && curVal) lbl.textContent = curVal;

          const btns = variantsEl.querySelectorAll(`.pdp-variant-btn[data-group="${groupName}"]`);
          btns.forEach(btn => {
            const optVal = btn.dataset.value;
            const isSelected = (optVal === curVal);
            btn.classList.toggle('active', isSelected);

            if (product.rawVariants && product.rawVariants.length > 0) {
              if (isSelected) {
                btn.classList.remove('pdp-variant-btn--incompatible');
                btn.removeAttribute('title');
              } else {
                // Check if this option is directly compatible with other current selections
                const testSelection = { ...selectedVariants, [groupName]: optVal };
                const isDirectlyCompatible = product.rawVariants.some(v => {
                  if (!v.attributeValues || !v.attributeValues.length) return false;
                  const vMap = getVariantAttrMap(v);
                  return Object.keys(testSelection).every(g => vMap[g] === testSelection[g]);
                });

                if (!isDirectlyCompatible) {
                  btn.classList.add('pdp-variant-btn--incompatible');
                  btn.setAttribute('title', `Click to switch configuration to ${optVal}`);
                } else {
                  btn.classList.remove('pdp-variant-btn--incompatible');
                  btn.removeAttribute('title');
                }
              }
            }
          });
        });
      }

      function selectOption(targetGroup, targetValue) {
        if (product.rawVariants && product.rawVariants.length > 0) {
          const candidateSelection = { ...selectedVariants, [targetGroup]: targetValue };
          const directMatch = product.rawVariants.find(v => {
            if (!v.attributeValues || !v.attributeValues.length) return false;
            const vMap = getVariantAttrMap(v);
            return Object.keys(candidateSelection).every(g => vMap[g] === candidateSelection[g]);
          });

          if (directMatch) {
            selectedVariants[targetGroup] = targetValue;
          } else {
            // Find variants containing targetGroup === targetValue and pick best match
            const candidates = product.rawVariants.filter(v => {
              if (!v.attributeValues || !v.attributeValues.length) return false;
              const vMap = getVariantAttrMap(v);
              return vMap[targetGroup] === targetValue;
            });

            if (candidates.length > 0) {
              let bestVariant = candidates[0];
              let bestScore = -1;

              candidates.forEach(v => {
                const vMap = getVariantAttrMap(v);
                let score = 0;
                Object.keys(selectedVariants).forEach(g => {
                  if (g !== targetGroup && vMap[g] === selectedVariants[g]) {
                    score += 10;
                  }
                });
                if (v.availability === 'AVAILABLE') score += 1;
                if (score > bestScore) {
                  bestScore = score;
                  bestVariant = v;
                }
              });

              // Adopt attributes from the best variant to ensure a valid existing combination
              const bestMap = getVariantAttrMap(bestVariant);
              product.variants.forEach(g => {
                if (bestMap[g.group]) {
                  selectedVariants[g.group] = bestMap[g.group];
                }
              });
              selectedVariants[targetGroup] = targetValue;
            } else {
              selectedVariants[targetGroup] = targetValue;
            }
          }
        } else {
          selectedVariants[targetGroup] = targetValue;
        }

        updateVariantUI();
        applySelectedVariant();
      }

      function applySelectedVariant() {
        const matched = findMatchingVariant();
        const basePrice = product.basePrice !== undefined ? product.basePrice : product.salePrice;

        let activePrice = basePrice;
        let isVariantAvailable = (product.availability ? product.availability === 'AVAILABLE' : true);
        let matchedVariantId = null;

        if (product.rawVariants && product.rawVariants.length > 0) {
          if (matched) {
            matchedVariantId = matched.id;
            if (matched.priceOverride !== null && matched.priceOverride !== undefined && matched.priceOverride !== '') {
              const override = parseFloat(matched.priceOverride);
              if (!isNaN(override) && override > 0) {
                activePrice = override;
              }
            }
            if (matched.availability) {
              isVariantAvailable = (matched.availability === 'AVAILABLE');
            }
          } else {
            // Strict: nonexistent combination is unavailable
            isVariantAvailable = false;
          }
        }

        currentProductData.activePrice = activePrice;
        currentProductData.selectedVariantId = matchedVariantId;
        currentProductData.isVariantAvailable = isVariantAvailable;

        // If combination does not exist
        if (product.rawVariants && product.rawVariants.length > 0 && !matched) {
          if (priceSale) priceSale.textContent = 'Unavailable';
          if (barPrice) barPrice.textContent = 'Unavailable';
          if (priceOrig) priceOrig.textContent = '';
          if (priceDis) priceDis.textContent = '';
          if (priceSave) priceSave.textContent = '';
          if (emiNote) emiNote.innerHTML = '';
          if (barEmi) barEmi.textContent = '';

          if (pdpBadge) {
            pdpBadge.textContent = 'Unavailable';
            pdpBadge.style.backgroundColor = 'var(--color-primary-700)';
          }

          document.querySelectorAll('[data-action="buy-now"]').forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
            const label = btn.querySelector('.pdp-buy-bar__buy-label');
            if (label) label.textContent = 'Unavailable';
          });

          document.querySelectorAll('[data-action="add-cart"]').forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
          });
          return;
        }

        // Update displayed prices
        const offer = (currentProductData && currentProductData.discount) || 0;
        const origPrice = activePrice;
        const finalSalePrice = offer > 0 ? Math.round(activePrice * (1 - offer / 100)) : activePrice;
        const save = origPrice - finalSalePrice;

        if (priceSale) priceSale.textContent = fmt(finalSalePrice);
        if (barPrice) barPrice.textContent = fmt(finalSalePrice);
        if (priceOrig) priceOrig.textContent = save > 0 ? fmt(origPrice) : '';
        if (priceDis) priceDis.textContent = offer > 0 ? `${offer}% off` : '';
        if (priceSave) priceSave.textContent = save > 0 ? `Save ${fmt(save)}` : '';


        // Update badge
        if (pdpBadge) {
          if (!isVariantAvailable) {
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

        // Update action buttons (Buy Now, Add to Cart)
        document.querySelectorAll('[data-action="buy-now"]').forEach(btn => {
          btn.disabled = !isVariantAvailable;
          btn.style.opacity = isVariantAvailable ? '1' : '0.6';
          btn.style.cursor = isVariantAvailable ? 'pointer' : 'not-allowed';
          const label = btn.querySelector('.pdp-buy-bar__buy-label');
          if (label) label.textContent = isVariantAvailable ? 'Buy Now' : 'Out of Stock';
        });

        document.querySelectorAll('[data-action="add-cart"]').forEach(btn => {
          btn.disabled = !isVariantAvailable;
          btn.style.opacity = isVariantAvailable ? '1' : '0.6';
          btn.style.cursor = isVariantAvailable ? 'pointer' : 'not-allowed';
        });
      }

      variantsEl.querySelectorAll('.pdp-variant-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const group = btn.dataset.group;
          const value = btn.dataset.value;
          selectOption(group, value);
        });
      });

      updateVariantUI();
      applySelectedVariant();
    } else if (variantsEl) {
      variantsEl.innerHTML = '';
    }

    // ─── Colors ─────────────────────────────────────────────────────────────
    if (colorsEl && product.colors && product.colors.length > 1) {
      const parentColorSec = colorsEl.closest('.pdp-colors');
      if (parentColorSec) parentColorSec.style.display = '';

      const currentColorVal = selectedVariants['Color'] || product.colors[0].label;
      if (colorLbl) colorLbl.textContent = currentColorVal;

      colorsEl.innerHTML = product.colors.map((c, i) => `
        <button class="pdp-color-btn${c.label === currentColorVal ? ' active' : ''}"
          data-idx="${i}" data-color="${c.hex}" data-label="${c.label}" aria-label="${c.label}">
          <span class="pdp-color-btn__swatch" style="background-color:${c.hex};"></span>
          <span class="pdp-color-btn__name">${c.label}</span>
        </button>`
      ).join('');

      colorsEl.querySelectorAll('.pdp-color-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const colLabel = btn.dataset.label || btn.querySelector('.pdp-color-btn__name')?.textContent.trim();
          handleVariantSelection('Color', colLabel);
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

    // ─── Description ────────────────────────────────────────────────────────
    function updateDescToggleUI(expanded) {
      if (!descToggle) return;
      descToggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      descToggle.innerHTML = expanded
        ? `Read Less <svg class="pdp-desc-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>`
        : `Read More <svg class="pdp-desc-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>`;
    }

    if (descBody && product.description) {
      const bullets = formatDescriptionToBullets(product.description);
      if (bullets.length > 0) {
        descBody.innerHTML = `
          <ul class="pdp-description__list">
            ${bullets.map(b => `
              <li class="pdp-description__item">
                <span class="pdp-description__dot" aria-hidden="true"></span>
                <span class="pdp-description__text">${escapeHtml(b)}</span>
              </li>`).join('')}
          </ul>`;
      } else {
        descBody.textContent = product.description;
      }

      // Temporarily expand to measure total height
      descBody.classList.remove('pdp-description__body--collapsed');
      descBody.classList.remove('pdp-description__body--expanded');
      descBody.style.maxHeight = 'none';

      const scrollHeight = descBody.scrollHeight;
      descBody.style.maxHeight = '';

      // If description fits comfortably in 2 bullet items (approx <= 88px) or has <= 2 bullets, hide toggle
      if (bullets.length <= 2 && scrollHeight <= 88) {
        descBody.classList.remove('pdp-description__body--collapsed');
        descBody.classList.remove('pdp-description__body--expanded');
        if (descToggle) descToggle.style.display = 'none';
      } else {
        descBody.classList.add('pdp-description__body--collapsed');
        descBody.classList.remove('pdp-description__body--expanded');
        if (descToggle) {
          descToggle.classList.remove('expanded');
          descToggle.style.display = 'inline-flex';
          updateDescToggleUI(false);
        }
      }
    } else {
      if (descBody) descBody.innerHTML = '';
      if (descToggle) descToggle.style.display = 'none';
    }

    if (descToggle) {
      descToggle.onclick = () => {
        const isCurrentlyExpanded = descBody.classList.contains('pdp-description__body--expanded');
        const willExpand = !isCurrentlyExpanded;
        descToggle.classList.toggle('expanded', willExpand);
        descBody.classList.toggle('pdp-description__body--collapsed', !willExpand);
        descBody.classList.toggle('pdp-description__body--expanded', willExpand);
        updateDescToggleUI(willExpand);
      };
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
            <p class="pdp-delivery__note">Kishor Enterprises, All Andhra Road, Pathapatnam, Srikakulam(dist), AP — 532213 <br>— Ready same day</p>
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

    // ─── Related products carousel ──────────────────────────────────────────
    loadRelatedProducts(product);

    // ─── Render Reviews ─────────────────────────────────────────────────────
    renderReviews(product);
  }

  // ─── Related Products ─────────────────────────────────────────────────────
  async function loadRelatedProducts(currentProduct) {
    if (!relTrack) return;

    let cat = currentProduct.relatedCategory || currentProduct.category;
    if (typeof cat === 'object' && cat !== null) {
      cat = cat.slug || cat.name || cat.id || '';
    }
    if (!cat) return;

    const SLUG_ALIASES = { mobile: 'mobiles', tv: 'tvs', ac: 'acs' };
    const normalizedCat = SLUG_ALIASES[cat.toLowerCase()] || cat;

    try {
      const res = await fetch(`/api/products/category/${encodeURIComponent(normalizedCat)}`);
      const json = await res.json();
      
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        const others = json.data.filter(p => p.slug !== currentProduct.slug && p.id !== currentProduct.dbId && p.id !== currentProduct.id);
        
        if (others.length > 0) {
          renderRelatedTrack(others.map(p => {
            const rawPrice = parseFloat(p.price) || 0;
            const offerVal = (p.offer !== undefined && p.offer !== null && !isNaN(parseFloat(p.offer))) ? parseFloat(p.offer) : 0;
            const hasOffer = offerVal > 0;
            const salePrice = hasOffer ? Math.round(rawPrice * (1 - offerVal / 100)) : rawPrice;
            const originalPrice = hasOffer ? rawPrice : ((p.originalPrice && p.originalPrice > rawPrice) ? p.originalPrice : rawPrice);
            const discount = hasOffer ? offerVal : (p.discount || 0);

            const primaryImg = p.productImages?.find(img => img.isPrimary)?.imageUrl
              || p.productImages?.[0]?.imageUrl
              || p.imageUrl
              || '';

            const isAvailable = p.availability === 'AVAILABLE';
            const badgeText = isAvailable
              ? (hasOffer ? `${offerVal}% OFF` : 'In Stock')
              : 'Out of Stock';
            const badgeType = isAvailable
              ? (hasOffer ? 'accent' : 'success')
              : 'primary';

            return {
              id: p.slug || p.id,
              brand: p.brand,
              name: p.name,
              originalPrice,
              salePrice,
              discount,
              imageUrl: primaryImg,
              badge: badgeText,
              badgeType,
              gifts: (p.giftsGiven || []).map(g => ({
                id: g.giftProduct?.id,
                name: g.giftProduct?.name,
                brand: g.giftProduct?.brand
              }))
            };
          }));
          return;
        }
      }
    } catch (err) {
      console.error('Failed to load related products from API:', err);
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
    relTrack.innerHTML = products.map(p => {
      const hasOffer = (p.discount && p.discount > 0) || (p.originalPrice && p.originalPrice > p.salePrice);
      const origPrice = p.originalPrice || (hasOffer ? Math.round(p.salePrice / (1 - p.discount / 100)) : null);

      return `
      <article class="plp-card" role="listitem" style="width:200px; flex-shrink:0;">
        <div class="plp-card__image-wrap">
          ${p.badge ? `<span class="plp-card__badge plp-card__badge--${p.badgeType || 'primary'}">${escapeHtml(p.badge)}</span>` : ''}
          <div class="plp-card__image-placeholder" aria-hidden="true">
            ${p.imageUrl
              ? `<img src="${p.imageUrl}" alt="${escapeHtml(p.brand || '')} ${escapeHtml(p.name || '')}" class="plp-card__img" loading="lazy" />`
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
          <p class="plp-card__brand">${escapeHtml(p.brand || '')}</p>
          <h3 class="plp-card__name">${escapeHtml(p.name || '')}</h3>
          <div class="plp-card__price">
            <span class="plp-card__price-sale">₹${Number(p.salePrice).toLocaleString('en-IN')}</span>
            ${(origPrice && origPrice > p.salePrice)
              ? `<span class="plp-card__price-original">₹${Number(origPrice).toLocaleString('en-IN')}</span>`
              : ''}
            ${(p.discount && p.discount > 0)
              ? `<span class="plp-card__price-discount">${p.discount}% off</span>`
              : ''}
          </div>
          ${(p.gifts && p.gifts.length > 0) ? `
            <div style="margin-top: 6px;">
              <span style="display:inline-flex; align-items:center; gap:4px; font-size:10px; font-weight:600; color:#9d174d; background:#fdf2f8; border:1px solid #fbcfe8; border-radius:4px; padding:2px 6px;">
                🎁 Free Gift${p.gifts.length > 1 ? ` (${p.gifts.length})` : ''}
              </span>
            </div>
          ` : ''}
        </div>
        <div class="plp-card__footer">
          <a href="/product/${p.id}" class="btn btn--primary plp-card__cta">
            View Details
          </a>
        </div>
      </article>`;
    }).join('');

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

  // ─── Interaction Tracking ────────────────────────────────────────────────
  // Records a PRODUCT_VIEW when the page loads.
  // Uses sessionStorage to generate a stable pseudo-anon ID for guest dedup.
  // The server silently skips a duplicate view from the same identity within 1 hour.

  function getSessionId() {
    let sid = sessionStorage.getItem('_ks_sid');
    if (!sid) {
      sid = 'sid_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem('_ks_sid', sid);
    }
    return sid;
  }

  function recordView(productId) {
    if (!productId) return;
    fetch(`/api/products/${encodeURIComponent(productId)}/interaction`, {
      method:    'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-session-id': getSessionId(),
      },
      body:      JSON.stringify({ type: 'PRODUCT_VIEW' }),
      keepalive: true,
    }).catch(() => { /* best-effort — never block the UI */ });
  }

  // ─── Fetch Product from Database or Load Static ───────────────────────────
  async function initProduct() {
    // 1. First attempt to fetch from backend database API (/api/products/:identifier)
    try {
      if (titleEl) titleEl.textContent = 'Loading product details…';
      const res = await fetch(`/api/products/${encodeURIComponent(rawId)}`);
      if (res.ok) {
        const json = await res.json();

        if (json.success && json.data) {
          const p = json.data;
          const primaryImg = p.productImages?.find(img => img.isPrimary)?.imageUrl
            || p.productImages?.[0]?.imageUrl
            || '';
          const allImages = p.productImages?.map(img => img.imageUrl) || [];
          const price = parseFloat(p.price) || 0;
          const isAvailable = p.availability === 'AVAILABLE';

          // Dynamically extract variant groups and options from database
          const rawVariants = Array.isArray(p.variants) ? p.variants : [];
          const parsedVariants = [];

          if (rawVariants.length > 0) {
            const groupMap = new Map();
            rawVariants.forEach(variant => {
              if (Array.isArray(variant.attributeValues)) {
                variant.attributeValues.forEach(av => {
                  const groupName = av.attribute?.displayName || av.attribute?.name || 'Option';
                  const val = av.displayValue || av.value;
                  if (!groupMap.has(groupName)) {
                    groupMap.set(groupName, new Set());
                  }
                  groupMap.get(groupName).add(val);
                });
              }
            });

            groupMap.forEach((valsSet, groupName) => {
              parsedVariants.push({
                group: groupName,
                options: Array.from(valsSet)
              });
            });
          }

          const offer = (p.offer && parseFloat(p.offer) > 0) ? parseFloat(p.offer) : 0;
          const originalPrice = price;
          const salePrice = offer > 0 ? Math.round(price * (1 - offer / 100)) : price;

          const gifts = (p.giftsGiven || []).map(g => ({
            id: g.giftProduct?.id,
            name: g.giftProduct?.name,
            brand: g.giftProduct?.brand,
            price: parseFloat(g.giftProduct?.price) || 0,
            slug: g.giftProduct?.slug,
            imageUrl: g.giftProduct?.productImages?.find(img => img.isPrimary)?.imageUrl || g.giftProduct?.productImages?.[0]?.imageUrl || ''
          }));

          const backendProduct = {
            id: p.slug || p.id,
            slug: p.slug,
            dbId: p.id,
            category: p.category ? p.category.name : 'mobiles',
            brand: p.brand,
            name: p.name,
            tagline: `${p.brand} Official Product · 100% Genuine`,
            originalPrice: originalPrice,
            salePrice: salePrice,
            basePrice: price,
            discount: offer,
            gifts: gifts,
            rating: parseFloat(p.rating) || 0,
            reviews: p.reviews || 0,
            productReviews: p.productReviews || [],
            availability: p.availability,
            imageUrl: primaryImg,
            images: allImages.length ? allImages : [primaryImg],
            colors: [],
            variants: parsedVariants,
            rawVariants: rawVariants,
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
                  ['Store Pickup', 'Available at Kishor Enterprises, Pathapatnam'],
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
            relatedCategory: p.category ? p.category.name : 'mobiles',
          };

          renderProduct(backendProduct);

          // Record PRODUCT_VIEW interaction — uses the DB id for accurate tracking
          recordView(p.slug || p.id);
          return;
        }
      }
    } catch (err) {
      console.warn('Backend product fetch failed, checking static catalogue fallback...', err);
    }

    // 2. Fallback to existing static demo catalogue (TV 301, AC 401, etc.)
    if (numericId && window.productCatalogue && window.productCatalogue[numericId]) {
      const staticProd = window.productCatalogue[numericId];
      renderProduct(staticProd);
      return;
    }

    // 3. Not found
    if (titleEl) titleEl.textContent = 'Product Not Found';
    if (taglineEl) taglineEl.textContent = 'The product you are looking for is currently unavailable or does not exist.';
  }

  // ─── Render & Submit Reviews ──────────────────────────────────────────────
  function renderReviews(product) {
    const listEl = document.getElementById('pdpReviewsList');
    if (listEl && product.productReviews) {
      if (product.productReviews.length === 0) {
        listEl.innerHTML = '<p class="pdp-reviews__empty">No reviews yet. Be the first to review!</p>';
      } else {
        listEl.innerHTML = product.productReviews.map(review => `
          <div class="pdp-review-card">
            <div class="pdp-review-card__header">
              <div class="pdp-review-card__avatar">${review.user.username ? review.user.username.charAt(0).toUpperCase() : 'U'}</div>
              <div class="pdp-review-card__meta">
                <p class="pdp-review-card__name">${review.user.username || 'User'}</p>
                <div class="pdp-review-card__stars">${starsSVG(review.rating)}</div>
              </div>
            </div>
            ${review.comment ? `<p class="pdp-review-card__comment">${review.comment}</p>` : ''}
          </div>
        `).join('');
      }
    }
  }

  // Handle Review Submission
  const submitStars = document.querySelectorAll('.pdp-star-icon-interactive');
  const submitBtn = document.getElementById('pdpSubmitReviewBtn');
  const submitComment = document.getElementById('pdpSubmitComment');
  let currentRating = 0;

  if (submitStars.length > 0) {
    submitStars.forEach(star => {
      const getHoverRating = (e, star) => {
        return parseInt(star.dataset.star, 10);
      };

      star.addEventListener('click', (e) => {
        currentRating = getHoverRating(e, star);
        updateInteractiveStars(currentRating);
      });
      star.addEventListener('mousemove', (e) => {
        updateInteractiveStars(getHoverRating(e, star), true);
      });
      star.addEventListener('mouseleave', () => {
        updateInteractiveStars(currentRating);
      });
    });
  }

  function updateInteractiveStars(rating, hover = false) {
    const textVal = document.getElementById('pdpHoverRatingVal');
    if (textVal) textVal.textContent = rating || '0';
    
    submitStars.forEach((star, index) => {
      const starNumber = index + 1;
      if (rating >= starNumber) {
        star.style.fill = 'var(--color-warning-500)';
      } else if (rating > index) {
        const percent = Math.round((rating - index) * 100);
        const stop1 = document.getElementById('dynamicStarStop1');
        const stop2 = document.getElementById('dynamicStarStop2');
        if (stop1 && stop2) {
          stop1.setAttribute('offset', `${percent}%`);
          stop2.setAttribute('offset', `${percent}%`);
        }
        star.style.fill = 'url(#dynamicStarGradient)';
      } else {
        star.style.fill = 'var(--gray-300)';
      }
      star.style.transform = hover && (rating > index && rating <= starNumber) ? 'scale(1.1)' : 'scale(1)';
    });
  }

  if (submitBtn) {
    submitBtn.addEventListener('click', async () => {
      if (currentRating === 0) {
        showRightToast('Please select a star rating.');
        return;
      }
      try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
        const res = await fetch(`/api/products/${rawId}/rate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            rating: currentRating,
            comment: submitComment ? submitComment.value : ''
          }),
          credentials: 'same-origin'
        });
        if (res.status === 401) {
          showRightToast('Please login to rate this product.');
          setTimeout(() => window.location.href = '/profile', 1500);
          return;
        }
        const json = await res.json();
        if (json.success) {
          showRightToast('Review submitted successfully!');
          // Clear box
          currentRating = 0;
          updateInteractiveStars(0);
          if (submitComment) submitComment.value = '';
          // Optionally, reload page to fetch fresh reviews
          setTimeout(() => window.location.reload(), 1500);
        } else {
          showRightToast(json.message || 'Failed to submit review.');
        }
      } catch (error) {
        console.error('Submit review error:', error);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Review';
      }
    });
  }

  // ─── Buy Now + Add to Cart ────────────────────────────────────────────────
  document.querySelectorAll('[data-action="buy-now"]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.disabled || !currentProductData || currentProductData.isVariantAvailable === false) {
        return;
      }
      if (currentProductData) {
        const activePrice = currentProductData.activePrice || currentProductData.salePrice || currentProductData.originalPrice || currentProductData.price;
        const variantDesc = Object.entries(selectedVariants).map(([k, v]) => `${k}: ${v}`).join(', ') || '1 Year Official Warranty';
        const itemToCheckout = {
          id: currentProductData.slug || currentProductData.id || currentProductData.dbId,
          dbId: currentProductData.dbId || currentProductData.id,
          productId: currentProductData.dbId || currentProductData.id,
          variantId: currentProductData.selectedVariantId || null,
          slug: currentProductData.slug,
          name: currentProductData.name,
          brand: currentProductData.brand,
          price: activePrice,
          originalPrice: currentProductData.originalPrice || activePrice,
          imageUrl: currentProductData.imageUrl || (currentProductData.images && currentProductData.images[0]) || '',
          quantity: 1,
          variantDescription: variantDesc,
        };
        try {
          localStorage.setItem('ks_checkout_item', JSON.stringify(itemToCheckout));
        } catch (e) { }
      }
      window.location.href = '/checkout';
    });
  });

  document.querySelectorAll('[data-action="add-cart"]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.disabled || !currentProductData || currentProductData.isVariantAvailable === false) {
        return;
      }
      if (currentProductData) {
        const activePrice = currentProductData.activePrice || currentProductData.salePrice || currentProductData.originalPrice || currentProductData.price;
        const variantDesc = Object.entries(selectedVariants).map(([k, v]) => `${k}: ${v}`).join(', ') || '1 Year Official Warranty';
        const itemToCart = {
          id: currentProductData.slug || currentProductData.id || currentProductData.dbId,
          dbId: currentProductData.dbId || currentProductData.id,
          productId: currentProductData.dbId || currentProductData.id,
          variantId: currentProductData.selectedVariantId || null,
          slug: currentProductData.slug,
          name: currentProductData.name,
          brand: currentProductData.brand,
          price: activePrice,
          originalPrice: currentProductData.originalPrice || activePrice,
          imageUrl: currentProductData.imageUrl || (currentProductData.images && currentProductData.images[0]) || '',
          quantity: 1,
          variantDescription: variantDesc,
        };
        try {
          let cart = [];
          const existing = localStorage.getItem('ks_cart');
          if (existing) cart = JSON.parse(existing);
          const cartKey = itemToCart.variantId ? `${itemToCart.id}-${itemToCart.variantId}` : itemToCart.id;
          const existingIdx = cart.findIndex(c => (c.variantId ? `${c.id}-${c.variantId}` : c.id) === cartKey);
          if (existingIdx >= 0) cart[existingIdx].quantity += 1;
          else cart.push(itemToCart);
          localStorage.setItem('ks_cart', JSON.stringify(cart));
        } catch (e) { }

        // Trigger interaction recording for CART_ADD
        try {
          fetch(`/api/products/${encodeURIComponent(currentProductData.slug || currentProductData.id)}/interaction`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-session-id': getSessionId() },
            body: JSON.stringify({ type: 'CART_ADD' }),
            keepalive: true,
          }).catch(() => {});
        } catch (_) {}

        // Temporary button confirmation feedback
        const label = btn.querySelector('.pdp-buy-bar__cart-label');
        const origText = label ? label.textContent : 'Add to Cart';
        if (label) label.textContent = 'Added ✓';
        setTimeout(() => { if (label) label.textContent = origText; }, 2000);
        showRightToast(`Added ${currentProductData.name} (${variantDesc}) to cart!`);
      }
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
