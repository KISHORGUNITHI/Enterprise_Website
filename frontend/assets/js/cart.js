/**
 * cart.js — Kishor Mobiles Cart Page Controller
 *
 * Implements real database-backed shopping cart management:
 * - Hydrates items from GET /api/cart
 * - Optimistic & debounced quantity updates via PUT /api/cart/items/:id (instant UI response)
 * - Item removal via DELETE /api/cart/items/:id
 * - Clear all items via DELETE /api/cart/clear
 * - Dynamic checkbox selection and real-time order total recalculation
 * - Synchronizes with localStorage and header badges via 'cart:updated' event
 * - Proceeds to checkout with selected items
 */

(function () {
  'use strict';

  // ═════════════════════════════════════════════════════════════════════════
  // 1. STATE & DOM REFERENCES
  // ═════════════════════════════════════════════════════════════════════════

  let cartData = {
    items: [],
    summary: {
      itemsCount: 0,
      totalQuantity: 0,
      totalMRP: 0,
      subtotal: 0,
      discountAmount: 0,
      standardDeliveryFee: 80,
      freeDeliverySavings: 80,
      deliveryFee: 0,
      totalAmount: 0,
    },
  };

  const selectedItemIds = new Set();
  const pendingQuantityTimers = {};
  let isAuthenticated = false;

  // DOM Elements
  const cartTopSummaryBar = document.getElementById('cartTopSummaryBar');
  const cartTopSubtotalWrap = document.getElementById('cartTopSubtotalWrap');
  const cartTopSummaryCta = document.getElementById('cartTopSummaryCta');
  const cartControlsBar = document.getElementById('cartControlsBar');
  const cartHeaderCountBadge = document.getElementById('cartHeaderCountBadge');
  const cartTopSubtotal = document.getElementById('cartTopSubtotal');
  const topProceedToBuyBtn = document.getElementById('topProceedToBuyBtn');
  const topProceedBtnText = document.getElementById('topProceedBtnText');
  const clearAllCartBtn = document.getElementById('clearAllCartBtn');

  const selectAllCheckbox = document.getElementById('selectAllCheckbox');
  const selectAllText = document.getElementById('selectAllText');

  const cartSkeletons = document.getElementById('cartSkeletons');
  const cartEmptyState = document.getElementById('cartEmptyState');
  const cartItemsList = document.getElementById('cartItemsList');

  const cartBottomSubtotalRow = document.getElementById('cartBottomSubtotalRow');
  const cartBottomQty = document.getElementById('cartBottomQty');
  const cartBottomAmount = document.getElementById('cartBottomAmount');

  // Summary Sidebar Elements
  const summaryItemsCount = document.getElementById('summaryItemsCount');
  const summaryItemsSubtotal = document.getElementById('summaryItemsSubtotal');
  const summaryDeliveryFee = document.getElementById('summaryDeliveryFee');
  const summaryGrossTotal = document.getElementById('summaryGrossTotal');
  const summaryFreeDeliveryRow = document.getElementById('summaryFreeDeliveryRow');
  const summaryFreeDeliveryDiscount = document.getElementById('summaryFreeDeliveryDiscount');
  const summaryOrderTotal = document.getElementById('summaryOrderTotal');
  const cartSavingsCallout = document.getElementById('cartSavingsCallout');
  const summarySavingsAmount = document.getElementById('summarySavingsAmount');
  const sidebarProceedToBuyBtn = document.getElementById('sidebarProceedToBuyBtn');
  const sidebarProceedBtnText = document.getElementById('sidebarProceedBtnText');

  // Mobile Sticky Bottom Bar Elements
  const cartMobileBottomBar = document.getElementById('cartMobileBottomBar');
  const mobileBottomTotal = document.getElementById('mobileBottomTotal');
  const mobileProceedToBuyBtn = document.getElementById('mobileProceedToBuyBtn');
  const mobileProceedBtnText = document.getElementById('mobileProceedBtnText');

  // Toast Element
  const cartToast = document.getElementById('cartToast');
  const cartToastMsg = document.getElementById('cartToastMsg');
  const cartToastClose = document.getElementById('cartToastClose');

  // ═════════════════════════════════════════════════════════════════════════
  // 2. UTILITIES & FORMATTING
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * Currency formatter with Indian Rupee symbol and two decimal places
   * e.g. ₹39,999.00
   */
  function fmt(val) {
    const num = Number(val) || 0;
    return '₹' + num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  /**
   * HTML escape helper to prevent XSS
   */
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Get headers with Authorization token and JSON accept
   */
  function getAuthHeaders(extraHeaders = {}) {
    const headers = { 'Accept': 'application/json', ...extraHeaders };
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (_) {}
    return headers;
  }

  /**
   * Calculate dynamic estimated delivery date (3 calendar days from today)
   */
  function getEstimatedDeliveryDate() {
    const target = new Date();
    target.setDate(target.getDate() + 3);
    const options = { weekday: 'short', day: 'numeric', month: 'short' };
    return target.toLocaleDateString('en-IN', options);
  }

  /**
   * Show toast alert banner
   */
  let toastTimer = null;
  function showToast(message, type = 'info') {
    if (!cartToast || !cartToastMsg) return;
    cartToastMsg.textContent = message;
    cartToast.className = `cart-toast cart-toast--${type}`;
    cartToast.removeAttribute('hidden');
    cartToast.style.display = 'flex';

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      cartToast.setAttribute('hidden', '');
      cartToast.style.display = 'none';
    }, 4500);
  }

  if (cartToastClose) {
    cartToastClose.addEventListener('click', () => {
      cartToast.setAttribute('hidden', '');
      cartToast.style.display = 'none';
    });
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 3. CART INITIALIZATION
  // ═════════════════════════════════════════════════════════════════════════

  async function initCart() {
    // Show skeletons initially
    if (cartSkeletons) {
      cartSkeletons.removeAttribute('hidden');
      cartSkeletons.style.display = 'flex';
    }
    if (cartEmptyState) {
      cartEmptyState.setAttribute('hidden', '');
      cartEmptyState.style.display = 'none';
    }
    if (cartItemsList) {
      cartItemsList.setAttribute('hidden', '');
      cartItemsList.style.display = 'none';
    }

    // Attach delegated events once
    setupCartContainerListeners();

    // Fetch authenticated user's cart from backend
    try {
      const response = await fetch('/api/cart', {
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      if (response.status === 401) {
        // User not authenticated
        isAuthenticated = false;
        handleUnauthenticatedCart();
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to load cart (HTTP ${response.status})`);
      }

      const json = await response.json();
      isAuthenticated = true;

      if (json.success && json.data && Array.isArray(json.data.items) && json.data.items.length > 0) {
        cartData = json.data;

        // Initialize all items as selected by default
        selectedItemIds.clear();
        cartData.items.forEach((item) => selectedItemIds.add(item.id));

        // Sync local storage mirror for global navbar badge
        syncLocalStorageMirror();

        // Render UI
        renderCart();
      } else {
        renderEmptyCart();
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
      // Fallback: check localStorage for guest items
      handleUnauthenticatedCart();
    }
  }

  /**
   * Handle cart view when unauthenticated
   */
  function handleUnauthenticatedCart() {
    try {
      const raw = localStorage.getItem('ks_cart');
      if (raw) {
        const localItems = JSON.parse(raw);
        if (Array.isArray(localItems) && localItems.length > 0) {
          let subtotal = 0;
          let totalMRP = 0;
          let totalQty = 0;

          const items = localItems.map((it, idx) => {
            const qty = parseInt(it.quantity, 10) || 1;
            const price = Number(it.price) || 0;
            const origPrice = Number(it.originalPrice) || price;
            const lineTotal = price * qty;
            const lineMRP = origPrice * qty;
            const discountPct = (origPrice > price) ? Math.round(((origPrice - price) / origPrice) * 100) : 0;

            subtotal += lineTotal;
            totalMRP += lineMRP;
            totalQty += qty;

            const itemId = it.id || `local-${idx}`;
            selectedItemIds.add(itemId);

            return {
              id: itemId,
              productId: it.productId || it.dbId || it.id,
              variantId: it.variantId || null,
              quantity: qty,
              unitPrice: price,
              originalPrice: origPrice,
              discountPct,
              lineTotal,
              lineMRP,
              lineSavings: Math.max(0, lineMRP - lineTotal),
              product: {
                id: it.productId || it.id,
                name: it.name || 'Mobile Product',
                slug: it.slug || it.id,
                brand: it.brand || '',
                basePrice: price,
                availability: 'AVAILABLE',
                stock: 10,
                image: it.imageUrl || it.image || '/assets/images/placeholder.png',
                gifts: it.gifts || [],
              },
              variant: it.variantDescription ? { description: it.variantDescription } : null,
            };
          });

          cartData = {
            items,
            summary: {
              itemsCount: items.length,
              totalQuantity: totalQty,
              totalMRP,
              subtotal,
              discountAmount: Math.max(0, totalMRP - subtotal),
              standardDeliveryFee: subtotal > 0 ? 80 : 0,
              freeDeliverySavings: subtotal > 0 ? 80 : 0,
              deliveryFee: 0,
              totalAmount: subtotal,
            },
          };

          renderCart();
          showToast('Sign in to sync your cart across devices and proceed to checkout.', 'info');
          return;
        }
      }
    } catch (_) {}

    renderEmptyCart();
  }

  /**
   * Sync localStorage with current cart items so site-wide badges update
   */
  function syncLocalStorageMirror() {
    try {
      const mirror = cartData.items.map((it) => ({
        id: it.product.slug || it.productId || it.id,
        dbId: it.productId,
        productId: it.productId,
        variantId: it.variantId || null,
        name: it.product.name,
        price: it.unitPrice,
        originalPrice: it.originalPrice,
        imageUrl: it.product.image,
        quantity: it.quantity,
        variantDescription: it.variant ? it.variant.description : '',
        gifts: it.gifts || [],
      }));

      localStorage.setItem('ks_cart', JSON.stringify(mirror));
      document.dispatchEvent(new Event('cart:updated'));
    } catch (_) {}
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 4. RENDERING & UI UPDATES
  // ═════════════════════════════════════════════════════════════════════════

  function renderEmptyCart() {
    // Strictly hide skeletons, product list, controls bar, and delete all icon
    if (cartSkeletons) {
      cartSkeletons.setAttribute('hidden', '');
      cartSkeletons.style.display = 'none';
    }
    if (cartItemsList) {
      cartItemsList.setAttribute('hidden', '');
      cartItemsList.style.display = 'none';
    }
    if (cartControlsBar) {
      cartControlsBar.setAttribute('hidden', '');
      cartControlsBar.style.display = 'none';
    }
    if (clearAllCartBtn) {
      clearAllCartBtn.style.display = 'none';
    }
    if (cartBottomSubtotalRow) {
      cartBottomSubtotalRow.setAttribute('hidden', '');
      cartBottomSubtotalRow.style.display = 'none';
    }
    if (cartTopSubtotalWrap) {
      cartTopSubtotalWrap.style.display = 'none';
    }
    if (cartTopSummaryCta) {
      cartTopSummaryCta.style.display = 'none';
    }

    // Show empty state cleanly
    if (cartEmptyState) {
      cartEmptyState.removeAttribute('hidden');
      cartEmptyState.style.display = 'flex';
    }

    // Update Top Summary
    if (cartHeaderCountBadge) cartHeaderCountBadge.textContent = '(0 items)';
    if (cartTopSubtotal) cartTopSubtotal.textContent = fmt(0);
    if (topProceedToBuyBtn) topProceedToBuyBtn.disabled = true;
    if (topProceedBtnText) topProceedBtnText.textContent = 'Proceed to Buy (0 items)';

    // Update Sidebar
    if (summaryItemsCount) summaryItemsCount.textContent = '0';
    if (summaryItemsSubtotal) summaryItemsSubtotal.textContent = fmt(0);
    if (summaryGrossTotal) summaryGrossTotal.textContent = fmt(0);
    if (summaryFreeDeliveryDiscount) summaryFreeDeliveryDiscount.textContent = '-₹0.00';
    if (summaryOrderTotal) summaryOrderTotal.textContent = fmt(0);
    if (sidebarProceedToBuyBtn) sidebarProceedToBuyBtn.disabled = true;
    if (sidebarProceedBtnText) sidebarProceedBtnText.textContent = 'Proceed to Buy (0 items)';
    if (cartSavingsCallout) {
      cartSavingsCallout.setAttribute('hidden', '');
      cartSavingsCallout.style.display = 'none';
    }

    // Update Mobile Bottom Bar
    if (mobileBottomTotal) mobileBottomTotal.textContent = fmt(0);
    if (mobileProceedToBuyBtn) mobileProceedToBuyBtn.disabled = true;
    if (mobileProceedBtnText) mobileProceedBtnText.textContent = 'Proceed to Buy (0 items)';
    if (cartMobileBottomBar) cartMobileBottomBar.style.display = 'none';

    // Clear local storage mirror
    try {
      localStorage.removeItem('ks_cart');
      document.dispatchEvent(new Event('cart:updated'));
    } catch (_) {}
  }

  function renderCart() {
    if (!cartData.items || cartData.items.length === 0) {
      renderEmptyCart();
      return;
    }

    // Strictly hide skeletons and empty state
    if (cartSkeletons) {
      cartSkeletons.setAttribute('hidden', '');
      cartSkeletons.style.display = 'none';
    }
    if (cartEmptyState) {
      cartEmptyState.setAttribute('hidden', '');
      cartEmptyState.style.display = 'none';
    }

    // Show active items list, controls bar, and delete icon
    if (cartControlsBar) {
      cartControlsBar.removeAttribute('hidden');
      cartControlsBar.style.display = 'flex';
    }
    if (clearAllCartBtn) {
      clearAllCartBtn.style.display = 'inline-flex';
    }
    if (cartTopSubtotalWrap) {
      cartTopSubtotalWrap.style.display = 'flex';
    }
    if (cartTopSummaryCta) {
      cartTopSummaryCta.style.display = 'block';
    }
    if (cartItemsList) {
      cartItemsList.removeAttribute('hidden');
      cartItemsList.style.display = 'flex';
    }
    if (cartBottomSubtotalRow) {
      cartBottomSubtotalRow.removeAttribute('hidden');
      cartBottomSubtotalRow.style.display = 'block';
    }

    const deliveryDateStr = getEstimatedDeliveryDate();

    // Render items list (Amazon / Flipkart Clean Style)
    cartItemsList.innerHTML = cartData.items.map((item) => {
      const isSelected = selectedItemIds.has(item.id);
      const isAvailable = item.product.availability === 'AVAILABLE';
      const variantDesc = item.variant && item.variant.description ? item.variant.description : '';
      const hasDiscount = item.discountPct > 0 && item.originalPrice > item.unitPrice;
      const productSlugOrId = item.product.slug || item.productId || item.product.id;
      const productUrl = `/product/${encodeURIComponent(productSlugOrId)}`;

      const giftBadgeHtml = item.gifts && item.gifts.length > 0 ? `
        <div class="cart-item-gifts-row">
          ${item.gifts.map((g) => `
            <span class="cart-item-gift-pill" title="Free gift: ${escapeHtml(g.name)}">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>
              Free Gift: ${escapeHtml(g.name)}
            </span>
          `).join('')}
        </div>
      ` : '';

      return `
        <article class="cart-item-card ${isSelected ? '' : 'cart-item-card--unselected'}" data-item-id="${item.id}" data-product-id="${item.productId}" data-product-url="${productUrl}">
          <!-- Checkbox Selection -->
          <div class="cart-item-card__select">
            <input type="checkbox" class="custom-cart-checkbox cart-item-checkbox" data-item-id="${item.id}" ${isSelected ? 'checked' : ''} aria-label="Select ${escapeHtml(item.product.name)}" />
          </div>

          <!-- Product Thumbnail -->
          <div class="cart-item-card__thumb">
            <a href="${productUrl}" class="cart-item-thumb-link" aria-label="${escapeHtml(item.product.name)}">
              <img src="${item.product.image || '/assets/images/placeholder.png'}"
                   alt="${escapeHtml(item.product.name)}"
                   loading="lazy"
                   onerror="this.onerror=null;this.src='/assets/images/placeholder.png';" />
            </a>
          </div>

          <!-- Product Info & Actions -->
          <div class="cart-item-card__content">
            <div class="cart-item-card__header">
              <h3 class="cart-item-title">
                <a href="${productUrl}">
                  ${escapeHtml(item.product.name)}
                  ${variantDesc ? `<span class="cart-item-variant">(${escapeHtml(variantDesc)})</span>` : ''}
                </a>
              </h3>
            </div>

            <!-- Price Row -->
            <div class="cart-item-pricing">
              <span class="cart-item-price-current">${fmt(item.unitPrice)}</span>
              ${hasDiscount ? `
                <span class="cart-item-price-mrp">M.R.P.: <span class="strikethrough">${fmt(item.originalPrice)}</span></span>
                <span class="cart-item-discount-pct">-${item.discountPct}%</span>
              ` : ''}
            </div>

            <!-- Stock Status -->
            <div class="cart-item-stock-row">
              ${isAvailable ? `
                <span class="cart-stock-status cart-stock--in">In stock</span>
              ` : `
                <span class="cart-stock-status cart-stock--out">Currently out of stock</span>
              `}
            </div>

            <!-- Free Delivery Info -->
            <div class="cart-item-delivery">
              <span class="cart-delivery-label">FREE delivery </span>
              <strong class="cart-delivery-date">${deliveryDateStr}</strong>
            </div>

            <!-- Free Gift Pill (if applicable) -->
            ${giftBadgeHtml}

            <!-- Action Controls Row: Stepper + Delete -->
            <div class="cart-item-actions">
              <!-- Stepper Pill -->
              <div class="cart-qty-stepper" role="group" aria-label="Quantity for ${escapeHtml(item.product.name)}">
                <button type="button" class="cart-qty-btn cart-qty-btn--minus" data-action="decrement" data-item-id="${item.id}" aria-label="Decrease quantity">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </button>
                <span class="cart-qty-val" id="qty-val-${item.id}" aria-live="polite">${item.quantity}</span>
                <button type="button" class="cart-qty-btn cart-qty-btn--plus" data-action="increment" data-item-id="${item.id}" aria-label="Increase quantity">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </button>
              </div>

              <!-- Delete Action Button -->
              <button type="button" class="cart-action-btn cart-action-btn--delete" data-action="delete" data-item-id="${item.id}" aria-label="Delete ${escapeHtml(item.product.name)}">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                <span>Delete</span>
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Recalculate totals according to current selection
    updateSelectionTotals();
  }

  /**
   * Recalculates subtotal and order totals based on selected items
   */
  function updateSelectionTotals() {
    const selectedItems = cartData.items.filter((it) => selectedItemIds.has(it.id));
    const allSelected = cartData.items.length > 0 && selectedItemIds.size === cartData.items.length;
    const noneSelected = selectedItemIds.size === 0;

    // Update Select All Checkbox state
    if (selectAllCheckbox) {
      selectAllCheckbox.checked = allSelected;
      selectAllCheckbox.indeterminate = !allSelected && !noneSelected;
    }
    if (selectAllText) {
      selectAllText.textContent = allSelected ? 'Deselect all items' : 'Select all items';
    }

    // Compute totals for selected items
    let selectedQty = 0;
    let selectedSubtotal = 0;
    let selectedMRP = 0;

    for (const item of selectedItems) {
      selectedQty += item.quantity;
      selectedSubtotal += item.lineTotal;
      selectedMRP += (item.originalPrice || item.unitPrice) * item.quantity;
    }

    const deliveryFee = 0;
    const standardDeliveryFee = selectedSubtotal > 0 ? 80 : 0;
    const freeDeliverySavings = selectedSubtotal > 0 ? 80 : 0;
    const grossTotal = selectedSubtotal + standardDeliveryFee;
    const orderTotal = selectedSubtotal + deliveryFee;
    const totalSavings = Math.max(0, selectedMRP - selectedSubtotal);

    const itemsCountLabel = `${selectedQty} item${selectedQty === 1 ? '' : 's'}`;
    const proceedText = `Proceed to Buy (${itemsCountLabel})`;

    // 1. Update Top Summary Bar
    const totalCartUnits = cartData.items.reduce((sum, it) => sum + (it.quantity || 1), 0);
    if (cartHeaderCountBadge) {
      cartHeaderCountBadge.textContent = `(${totalCartUnits} item${totalCartUnits === 1 ? '' : 's'})`;
    }
    if (cartTopSubtotal) cartTopSubtotal.textContent = fmt(orderTotal);
    if (topProceedToBuyBtn) topProceedToBuyBtn.disabled = selectedQty === 0;
    if (topProceedBtnText) topProceedBtnText.textContent = proceedText;

    // 2. Update Bottom Subtotal row on desktop
    if (cartBottomQty) cartBottomQty.textContent = itemsCountLabel;
    if (cartBottomAmount) cartBottomAmount.textContent = fmt(orderTotal);

    // 3. Update Sidebar Summary Card
    if (summaryItemsCount) summaryItemsCount.textContent = String(selectedQty);
    if (summaryItemsSubtotal) summaryItemsSubtotal.textContent = fmt(selectedSubtotal);
    if (summaryDeliveryFee) summaryDeliveryFee.textContent = standardDeliveryFee > 0 ? fmt(standardDeliveryFee) : 'FREE';
    if (summaryGrossTotal) summaryGrossTotal.textContent = fmt(grossTotal);
    if (summaryFreeDeliveryDiscount) summaryFreeDeliveryDiscount.textContent = `-${fmt(freeDeliverySavings)}`;
    if (summaryOrderTotal) summaryOrderTotal.textContent = fmt(orderTotal);

    if (summaryFreeDeliveryRow) {
      summaryFreeDeliveryRow.style.display = standardDeliveryFee > 0 ? 'flex' : 'none';
    }

    if (totalSavings > 0) {
      if (cartSavingsCallout) {
        cartSavingsCallout.removeAttribute('hidden');
        cartSavingsCallout.style.display = 'flex';
      }
      if (summarySavingsAmount) summarySavingsAmount.textContent = fmt(totalSavings);
    } else {
      if (cartSavingsCallout) {
        cartSavingsCallout.setAttribute('hidden', '');
        cartSavingsCallout.style.display = 'none';
      }
    }

    if (sidebarProceedToBuyBtn) sidebarProceedToBuyBtn.disabled = selectedQty === 0;
    if (sidebarProceedBtnText) sidebarProceedBtnText.textContent = proceedText;

    // 4. Update Mobile Bottom Bar
    if (mobileBottomTotal) mobileBottomTotal.textContent = fmt(orderTotal);
    if (mobileProceedToBuyBtn) mobileProceedToBuyBtn.disabled = selectedQty === 0;
    if (mobileProceedBtnText) mobileProceedBtnText.textContent = proceedText;
    if (cartMobileBottomBar) {
      cartMobileBottomBar.style.display = cartData.items.length > 0 ? 'flex' : 'none';
    }
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 5. EVENT HANDLERS & PRODUCT ACTIONS
  // ═════════════════════════════════════════════════════════════════════════

  let isListenersAttached = false;
  function setupCartContainerListeners() {
    if (isListenersAttached) return;
    isListenersAttached = true;

    if (cartItemsList) {
      // Event delegation for Stepper and Delete buttons (Instant, no dropped clicks!)
      cartItemsList.addEventListener('click', (e) => {
        const actionBtn = e.target.closest('[data-action]');
        if (actionBtn) {
          const action = actionBtn.getAttribute('data-action');
          const itemId = actionBtn.getAttribute('data-item-id');
          if (!itemId) return;

          if (action === 'increment') {
            handleQuantityChange(itemId, 1);
          } else if (action === 'decrement') {
            handleQuantityChange(itemId, -1);
          } else if (action === 'delete') {
            handleDeleteItem(itemId);
          }
          return;
        }

        // If user touched or clicked the product card outside of interactive controls, redirect to actual product page
        if (e.target.closest('.custom-cart-checkbox') ||
            e.target.closest('.cart-qty-stepper') ||
            e.target.closest('.cart-action-btn') ||
            e.target.closest('a')) {
          return;
        }

        const card = e.target.closest('.cart-item-card');
        if (card) {
          const productUrl = card.getAttribute('data-product-url');
          if (productUrl) {
            window.location.href = productUrl;
          }
        }
      });

      // Event delegation for Checkboxes
      cartItemsList.addEventListener('change', (e) => {
        if (e.target.classList.contains('cart-item-checkbox')) {
          const itemId = e.target.getAttribute('data-item-id');
          const card = document.querySelector(`.cart-item-card[data-item-id="${itemId}"]`);
          if (e.target.checked) {
            selectedItemIds.add(itemId);
            card && card.classList.remove('cart-item-card--unselected');
          } else {
            selectedItemIds.delete(itemId);
            card && card.classList.add('cart-item-card--unselected');
          }
          updateSelectionTotals();
        }
      });
    }
  }

  // Master Select All / Deselect All
  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      cartData.items.forEach((item) => {
        const card = document.querySelector(`.cart-item-card[data-item-id="${item.id}"]`);
        const itemChk = document.querySelector(`.cart-item-checkbox[data-item-id="${item.id}"]`);

        if (isChecked) {
          selectedItemIds.add(item.id);
          card && card.classList.remove('cart-item-card--unselected');
          if (itemChk) itemChk.checked = true;
        } else {
          selectedItemIds.delete(item.id);
          card && card.classList.add('cart-item-card--unselected');
          if (itemChk) itemChk.checked = false;
        }
      });

      updateSelectionTotals();
    });
  }

  // Clear All Cart Button (Trash icon in header)
  if (clearAllCartBtn) {
    clearAllCartBtn.addEventListener('click', async () => {
      if (!cartData.items || cartData.items.length === 0) return;
      if (!confirm('Are you sure you want to clear your entire cart?')) return;

      cartData.items = [];
      selectedItemIds.clear();
      renderEmptyCart();
      showToast('All items removed from your cart.', 'info');

      if (!isAuthenticated) return;

      try {
        await fetch('/api/cart/clear', {
          method: 'DELETE',
          headers: getAuthHeaders(),
          credentials: 'include',
        });
      } catch (err) {
        console.warn('Clear cart server error:', err);
      }
    });
  }

  /**
   * Update Quantity (Instant Optimistic UI with Debounced Server Sync)
   * Never drops clicks and never requires double clicking!
   */
  function handleQuantityChange(itemId, delta) {
    const item = cartData.items.find((it) => it.id === itemId);
    if (!item) return;

    const newQty = item.quantity + delta;

    if (newQty <= 0) {
      handleDeleteItem(itemId);
      return;
    }

    // 1. Immediately update local item state
    item.quantity = newQty;
    item.lineTotal = item.unitPrice * newQty;
    item.lineMRP = (item.originalPrice || item.unitPrice) * newQty;
    item.lineSavings = Math.max(0, item.lineMRP - item.lineTotal);

    // 2. Immediately update DOM counter
    const qtySpan = document.getElementById(`qty-val-${itemId}`);
    if (qtySpan) {
      qtySpan.textContent = String(newQty);
    }

    // 3. Immediately update totals and header badges
    updateSelectionTotals();
    syncLocalStorageMirror();

    if (!isAuthenticated) return;

    // 4. Debounced Server Sync (300ms)
    if (pendingQuantityTimers[itemId]) {
      clearTimeout(pendingQuantityTimers[itemId]);
    }

    pendingQuantityTimers[itemId] = setTimeout(async () => {
      delete pendingQuantityTimers[itemId];
      try {
        const res = await fetch(`/api/cart/items/${encodeURIComponent(itemId)}`, {
          method: 'PUT',
          headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
          credentials: 'include',
          body: JSON.stringify({ quantity: item.quantity }),
        });

        if (!res.ok) {
          throw new Error('Failed to update quantity on server');
        }
      } catch (err) {
        console.error('Quantity sync failed:', err);
        showToast('Could not sync quantity. Refreshing...', 'error');
        await initCart();
      }
    }, 300);
  }

  /**
   * Delete Item from Cart
   */
  async function handleDeleteItem(itemId) {
    const item = cartData.items.find((it) => it.id === itemId);
    const itemName = item ? item.product.name : 'Item';

    // Cancel any pending debounced sync
    if (pendingQuantityTimers[itemId]) {
      clearTimeout(pendingQuantityTimers[itemId]);
      delete pendingQuantityTimers[itemId];
    }

    // Remove from local memory
    cartData.items = cartData.items.filter((it) => it.id !== itemId);
    selectedItemIds.delete(itemId);

    // Animate DOM card removal
    const card = document.querySelector(`.cart-item-card[data-item-id="${itemId}"]`);
    if (card) {
      card.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
      card.style.opacity = '0';
      card.style.transform = 'translateY(-10px)';
      setTimeout(() => {
        card.remove();
        if (cartData.items.length === 0) {
          renderEmptyCart();
        } else {
          updateSelectionTotals();
        }
      }, 200);
    } else {
      if (cartData.items.length === 0) {
        renderEmptyCart();
      } else {
        updateSelectionTotals();
      }
    }

    syncLocalStorageMirror();
    showToast(`Removed "${itemName}" from your cart.`, 'success');

    if (!isAuthenticated) return;

    // Send delete request to server
    try {
      await fetch(`/api/cart/items/${encodeURIComponent(itemId)}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
    } catch (err) {
      console.warn('Backend cart item delete error:', err);
    }
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 6. CHECKOUT ACTION (PROCEED TO BUY)
  // ═════════════════════════════════════════════════════════════════════════

  function proceedToCheckout() {
    const selectedItems = cartData.items.filter((it) => selectedItemIds.has(it.id));

    if (selectedItems.length === 0) {
      showToast('Please select at least one item to proceed to checkout.', 'error');
      return;
    }

    // Format selected items for checkout bridge
    const checkoutItems = selectedItems.map((it) => ({
      id: it.product.slug || it.productId || it.id,
      dbId: it.productId,
      productId: it.productId,
      variantId: it.variantId || null,
      name: it.product.name,
      brand: it.product.brand || '',
      price: it.unitPrice,
      originalPrice: it.originalPrice || it.unitPrice,
      imageUrl: it.product.image,
      quantity: it.quantity,
      variantDescription: it.variant ? it.variant.description : '',
      gifts: it.gifts || [],
    }));

    try {
      // Store selected items for checkout page
      localStorage.setItem('ks_checkout_item', JSON.stringify(checkoutItems));
      localStorage.setItem('ks_cart', JSON.stringify(checkoutItems));
    } catch (_) {}

    // If unauthenticated, trigger auth modal or redirect to login with return route
    if (!isAuthenticated) {
      if (typeof window.showLoginRequiredModal === 'function') {
        window.showLoginRequiredModal('/checkout');
      } else {
        window.location.href = `/login?pendingRoute=${encodeURIComponent('/checkout')}`;
      }
      return;
    }

    // Navigate to checkout
    window.location.href = '/checkout';
  }

  // Bind all Proceed to Buy triggers
  if (topProceedToBuyBtn) topProceedToBuyBtn.addEventListener('click', proceedToCheckout);
  if (sidebarProceedToBuyBtn) sidebarProceedToBuyBtn.addEventListener('click', proceedToCheckout);
  if (mobileProceedToBuyBtn) mobileProceedToBuyBtn.addEventListener('click', proceedToCheckout);

  // Chevron toggle in mobile bottom bar scrolls to order summary
  const mobileBarInfo = document.querySelector('.cart-mobile-bottom-bar__info');
  if (mobileBarInfo) {
    mobileBarInfo.addEventListener('click', () => {
      const summary = document.getElementById('cartSummarySidebar');
      if (summary) {
        summary.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 7. INITIALIZE ON DOM READY
  // ═════════════════════════════════════════════════════════════════════════

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCart);
  } else {
    initCart();
  }

})();
