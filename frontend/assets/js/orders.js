/**
 * orders.js — Orders page interactions.
 * Filter chips, search, order card rendering, detail drawer, timeline.
 */

(function () {
  'use strict';

  let orders = window.ordersData || [];
  const listEl = document.getElementById('ordersList');
  const countEl = document.getElementById('ordersCount');
  const searchEl = document.getElementById('ordersSearch');
  const overlay = document.getElementById('ordersOverlay');
  const drawer = document.getElementById('ordersDrawer');
  const closeBtn = document.getElementById('ordersDrawerClose');

  let activeFilter = 'all';
  let searchQuery = '';

  function formatISTDateTime(dateStr) {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }) + ' IST';
    } catch (e) {
      return dateStr;
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ─── Fetch real user orders from API ───────────────────────────────────────
  async function fetchRealOrders() {
    try {
      const headers = { Accept: 'application/json' };
      const token = localStorage.getItem('authToken');
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/orders', {
        headers,
        credentials: 'same-origin',
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const apiOrders = json.data.map(dbOrder => {
            const firstItem = dbOrder.items?.[0] || {};
            const itemCount = dbOrder.items?.length || 1;
            const extraItemsText = itemCount > 1 ? ` + ${itemCount - 1} more item${itemCount > 2 ? 's' : ''}` : '';
            const statusKey = (dbOrder.status || 'PROCESSING').toLowerCase();
            const dateStr = new Date(dbOrder.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            });

            const primaryImg = firstItem.product?.productImages?.find(img => img.isPrimary)?.imageUrl
              || firstItem.product?.productImages?.[0]?.imageUrl
              || '';

            return {
              id: dbOrder.shortId || dbOrder.id,
              dbId: dbOrder.id,
              date: dateStr,
              createdAt: dbOrder.createdAt,
              status: statusKey,
              price: Number(dbOrder.totalAmount),
              deliveryDate: dbOrder.deliveryDate || '3-5 Business Days',
              address: dbOrder.shippingAddress || 'Registered Address',
              cancelReason: dbOrder.cancelReason || null,
              cancelledBy: dbOrder.cancelledBy || null,
              cancelledAt: dbOrder.cancelledAt || null,
              product: {
                id: firstItem.productId,
                name: (firstItem.productName || 'Electronics Item') + extraItemsText,
                variant: firstItem.variantDescription || 'Standard Warranty',
                color: '#1e3d8f',
                imageUrl: primaryImg,
              },
              items: (dbOrder.items || []).map(i => ({
                id: i.id,
                productId: i.productId,
                name: i.productName || 'Product',
                variant: i.variantDescription || 'Standard Warranty',
                quantity: i.quantity || 1,
                unitPrice: Number(i.unitPrice),
                review: i.review || null
              })),
              timeline: buildTimeline(statusKey, dbOrder.createdAt, dbOrder.cancelledAt)
            };
          });

          // Prepend real orders
          orders = [...apiOrders, ...(window.ordersData || [])];
          render();
        }
      }
    } catch (e) {
      console.warn('Could not fetch orders from API:', e);
    }
  }

  // ─── Status config ────────────────────────────────────────────────────────
  const STATUS = {
    processing: { label: 'Processing', dot: '#eab308' },
    confirmed: { label: 'Confirmed', dot: '#3b82f6' },
    out_for_delivery: { label: 'Out for Delivery', dot: '#f97316' },
    delivered: { label: 'Delivered', dot: '#22c55e' },
    cancelled: { label: 'Cancelled', dot: '#ef4444' },
  };

  // ─── Format price ─────────────────────────────────────────────────────────
  function fmt(n) {
    return '₹' + Number(n).toLocaleString('en-IN');
  }

  // ─── Product placeholder & Image renderer ───────────────────────────────
  function placeholder(color, size = 88) {
    return `<svg viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="var(--color-bg-tertiary)"/>
      <rect x="${size * .18}" y="${size * .15}" width="${size * .64}" height="${size * .7}" rx="${size * .07}" fill="${color}18" stroke="${color}40" stroke-width="1.2"/>
      <rect x="${size * .28}" y="${size * .27}" width="${size * .44}" height="${size * .48}" rx="${size * .04}" fill="${color}0a"/>
      <rect x="${size * .33}" y="${size * .36}" width="${size * .34}" height="${size * .04}" rx="${size * .02}" fill="${color}50"/>
      <rect x="${size * .33}" y="${size * .46}" width="${size * .24}" height="${size * .03}" rx="${size * .015}" fill="${color}30"/>
    </svg>`;
  }

  function renderProductImage(product, size = 88, isDrawer = false) {
    if (product && product.imageUrl) {
      return `<img src="${product.imageUrl}" alt="${product.name || 'Product'}" class="${isDrawer ? 'drawer-product__img' : 'order-card__img'}" loading="lazy" />`;
    }
    return placeholder(product?.color || '#1e3d8f', size);
  }

  // ─── Status badge HTML ────────────────────────────────────────────────────
  function statusBadge(status) {
    const s = STATUS[status] || STATUS.processing;
    return `<span class="order-status order-status--${status}">
      <span class="order-status__dot" style="background:${s.dot};"></span>
      ${s.label}
    </span>`;
  }

  // ─── Build Timeline ───────────────────────────────────────────────────────
  function buildTimeline(status, createdAt, cancelledAt) {
    const d = new Date(createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const st = (status || '').toLowerCase();
    
    if (st === 'cancelled') {
      const cancelDate = cancelledAt ? new Date(cancelledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
      return [
        { label: 'Order Placed', date: d, done: true },
        { label: 'Cancelled', date: cancelDate, done: true }
      ];
    }
    
    return [
      { label: 'Order Placed', date: d, done: true },
      { label: 'Processing', date: '', done: ['processing', 'confirmed', 'out_for_delivery', 'delivered'].includes(st) },
      { label: 'Confirmed', date: '', done: ['confirmed', 'out_for_delivery', 'delivered'].includes(st) },
      { label: 'Out for Delivery', date: '', done: ['out_for_delivery', 'delivered'].includes(st) },
      { label: 'Delivered', date: '', done: st === 'delivered' }
    ];
  }

  // ─── Fetch API ────────────────────────────────────────────────────────────
  async function fetchOrders() {
    if (listEl) {
      listEl.innerHTML = `<div style="text-align:center; padding: 2rem;">Loading your orders...</div>`;
    }
    
    try {
      const response = await fetch('/api/orders', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        credentials: 'same-origin' // Uses HTTP-only cookie automatically
      });
      
      if (response.status === 401) {
        window.location.href = '/home'; // Redirect if not logged in
        return;
      }
      
      if (!response.ok) throw new Error('Failed to fetch orders');
      
      const result = await response.json();
      if (result.success && result.data) {
        orders = result.data.map(o => ({
          id: o.shortId || o.id,
          date: new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
          createdAt: o.createdAt,
          status: o.status.toLowerCase(),
          deliveryDate: o.deliveryDate || 'Pending',
          price: o.totalAmount,
          address: o.shippingAddress,
          cancelReason: o.cancelReason || null,
          cancelledBy: o.cancelledBy || null,
          cancelledAt: o.cancelledAt || null,
          product: {
            name: o.items?.[0]?.productName || 'Order Items',
            variant: o.items?.[0]?.variantDescription || '',
            color: '#3b82f6'
          },
          timeline: buildTimeline(o.status, o.createdAt, o.cancelledAt)
        }));
        render();
      }
    } catch (error) {
      console.error(error);
      if (listEl) {
        listEl.innerHTML = `<div style="text-align:center; padding: 2rem; color: var(--color-danger-500);">Failed to load orders.</div>`;
      }
    }
  }

  // ─── Render cards ─────────────────────────────────────────────────────────
  function getFiltered() {
    return orders.filter(o => {
      const matchFilter = activeFilter === 'all' || o.status === activeFilter;
      const q = searchQuery.toLowerCase();
      const matchSearch = !q
        || o.product.name.toLowerCase().includes(q)
        || o.id.toLowerCase().includes(q);
      return matchFilter && matchSearch;
    });
  }

  function render() {
    if (!listEl) return;
    const filtered = getFiltered();
    if (countEl) countEl.textContent = `${filtered.length} order${filtered.length !== 1 ? 's' : ''}`;

    if (filtered.length === 0) {
      listEl.innerHTML = `
        <div class="orders-empty">
          <div class="orders-empty__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
              <rect x="9" y="3" width="6" height="4" rx="2"/>
              <path d="M9 12h6M9 16h4"/>
            </svg>
          </div>
          <h3 class="orders-empty__title">No Orders Found</h3>
          <p class="orders-empty__desc">${searchQuery ? 'No orders match your search.' : "Looks like you haven't placed any orders yet."}</p>
          <a href="/home" class="btn btn--primary">Continue Shopping</a>
        </div>`;
      return;
    }

    listEl.innerHTML = filtered.map(o => `
      <article class="order-card" data-id="${o.id}" aria-label="Order ${o.id}">
        <div class="order-card__header">
          <div class="order-card__meta">
            <span class="order-card__id">Order # ${o.id}</span>
            <span class="order-card__date">Placed on ${o.date}</span>
          </div>
          ${statusBadge(o.status)}
        </div>
        <div class="order-card__body">
          <div class="order-card__image" aria-hidden="true">
            ${renderProductImage(o.product, 88, false)}
          </div>
          <div class="order-card__info">
            <h3 class="order-card__product-name">${o.product.name}</h3>
            <p class="order-card__variant">${o.product.variant}</p>
            <p class="order-card__price">${fmt(o.price)}</p>
            <p class="order-card__delivery">
              ${o.status === 'delivered'
        ? `<strong>Delivered</strong> on ${o.deliveryDate}`
        : o.status === 'cancelled'
          ? 'Order Cancelled'
          : `<strong>Expected</strong> by ${o.deliveryDate}`}
            </p>
          </div>
          <div class="order-card__action">
            <button class="order-card__view-btn" data-view="${o.id}">
              View Details
            </button>
          </div>
        </div>
      </article>`
    ).join('');

    // Bind view buttons
    listEl.querySelectorAll('[data-view]').forEach(btn => {
      btn.addEventListener('click', () => openDrawer(btn.dataset.view));
    });
  }

  // ─── Filter chips ─────────────────────────────────────────────────────────
  document.querySelectorAll('.orders-filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.orders-filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeFilter = chip.dataset.filter;
      render();
    });
  });

  // ─── Search ───────────────────────────────────────────────────────────────
  searchEl && searchEl.addEventListener('input', () => {
    searchQuery = searchEl.value.trim();
    render();
  });

  // ─── Drawer open / close ──────────────────────────────────────────────────
  function openDrawer(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order || !drawer) return;

    populateDrawer(order);
    overlay && overlay.classList.add('open');
    drawer.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Focus trap
    const firstFocus = drawer.querySelector('button, a');
    firstFocus && firstFocus.focus();
  }

  function closeDrawer() {
    overlay && overlay.classList.remove('open');
    drawer && drawer.classList.remove('open');
    document.body.style.overflow = '';
  }

  closeBtn && closeBtn.addEventListener('click', closeDrawer);
  overlay && overlay.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });

  // ─── Populate drawer ──────────────────────────────────────────────────────
  function populateDrawer(o) {
    const body = document.getElementById('ordersDrawerBody');
    if (!body) return;

    // Determine current timeline step
    const lastDoneIdx = o.timeline.reduce((acc, step, i) => step.done ? i : acc, -1);

    body.innerHTML = `
      <!-- Product -->
      <div class="drawer-product">
        <div class="drawer-product__image" aria-hidden="true">
          ${renderProductImage(o.product, 80, true)}
        </div>
        <div>
          <p class="drawer-product__name">${o.product.name}</p>
          <p class="drawer-product__variant">${o.product.variant}</p>
          <p class="drawer-product__price">${fmt(o.price)}</p>
        </div>
      </div>

      <!-- Status -->
      <div class="drawer-section">
        <p class="drawer-section__title">Order Status</p>
        <div style="display:flex; align-items:center; gap:var(--space-3);">
          ${statusBadge(o.status)}
          <span style="font-size:var(--text-xs); color:var(--color-text-muted);">Order # ${o.id}</span>
        </div>
      </div>

      <!-- Cancellation Details if Cancelled -->
      ${o.status === 'cancelled' ? `
        <div class="drawer-section" style="background:#fee2e2; border:1.5px solid #fecaca; border-radius:var(--radius-lg); padding:var(--space-3) var(--space-4);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; flex-wrap:wrap; gap:4px;">
            <strong style="color:#991b1b; font-size:var(--text-xs); text-transform:uppercase; letter-spacing:0.5px; display:inline-flex; align-items:center; gap:6px;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
              ${o.cancelledBy === 'ADMIN' ? 'Cancelled by Kishor Enterprises' : 'Cancelled by You'}
            </strong>
            <span style="font-size:11px; color:#991b1b;">
              ${formatISTDateTime(o.cancelledAt || o.createdAt)}
            </span>
          </div>
          <div style="font-size:var(--text-xs); color:#1f2937;">
            <strong>Reason:</strong>
            <p style="margin:4px 0 0 0; color:#991b1b; font-weight:500; font-size:var(--text-xs); line-height:1.4;">
              "${escapeHtml(o.cancelReason || (o.cancelledBy === 'ADMIN' ? 'Cancelled by store operations.' : 'Cancelled by customer.'))}"
            </p>
          </div>
        </div>
      ` : ''}

      <!-- Timeline -->
      <div class="drawer-section">
        <p class="drawer-section__title">Order Timeline</p>
        <div class="order-timeline">
          ${o.timeline.map((step, i) => {
      const isCurrent = i === lastDoneIdx + 1 && o.status !== 'cancelled' && o.status !== 'delivered';
      const cls = step.done ? 'timeline-step--done' : (isCurrent ? 'timeline-step--current' : '');
      return `
              <div class="timeline-step ${cls}">
                <div class="timeline-step__dot"></div>
                <div class="timeline-step__content">
                  <p class="timeline-step__label">${step.label}</p>
                  <p class="timeline-step__date">${step.date}</p>
                </div>
              </div>`;
    }).join('')}
        </div>
      </div>

      <!-- Delivery address -->
      <div class="drawer-section">
        <p class="drawer-section__title">Delivery Address</p>
        <p class="drawer-section__content">${o.address}</p>
      </div>

      <!-- Expected delivery -->
      <div class="drawer-section">
        <p class="drawer-section__title">Expected Delivery</p>
        <p class="drawer-section__content" style="font-weight:var(--font-semibold); color:var(--color-success-600);">
          ${o.status === 'cancelled' ? 'Order Cancelled' : o.status === 'delivered' ? `Delivered on ${o.deliveryDate}` : `By ${o.deliveryDate}`}
        </p>
      </div>

      <!-- Customer Rate & Review Section for Delivered Orders -->
      ${o.status === 'delivered' && o.items && o.items.length > 0 ? `
        <div class="drawer-section" id="customerReviewSection">
          <p class="drawer-section__title">Rate & Review Products</p>
          <div style="display:flex; flex-direction:column; gap:var(--space-3);">
            ${o.items.map(item => `
              <div class="drawer-review-card" style="padding:var(--space-3) var(--space-4); background:var(--color-bg-secondary); border-radius:var(--radius-lg); border:1px solid var(--color-border-light);" data-review-product-id="${item.productId}">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:var(--space-2);">
                  <strong style="font-size:var(--text-sm);">${item.name}</strong>
                  ${item.review ? '<span class="badge badge--success" style="font-size:10px; background:#dcfce7; color:#166534; padding:2px 6px; border-radius:4px;">Reviewed</span>' : ''}
                </div>

                ${item.review ? `
                  <div style="font-size:var(--text-xs); color:var(--color-text-secondary); margin-bottom:var(--space-2);">
                    <span style="color:#f59e0b; font-size:var(--text-sm); font-weight:var(--font-bold);">${'★'.repeat(Math.round(item.review.rating || 0))}${'☆'.repeat(5 - Math.round(item.review.rating || 0))}</span>
                    <span style="margin-left:6px; font-weight:var(--font-semibold);">(${item.review.rating}/5)</span>
                    <p style="margin:4px 0 0 0; font-style:italic;">"${item.review.comment || 'No feedback text'}"</p>
                  </div>
                  <button type="button" class="btn btn--outline btn--sm btn-edit-review" data-prod-id="${item.productId}" style="font-size:11px; padding:3px 8px;">Edit Review</button>
                ` : ''}

                <div class="review-form-container" style="${item.review ? 'display:none;' : 'display:block;'} margin-top:var(--space-2);">
                  <div class="star-rating-select" data-selected-rating="${item.review?.rating || 5}" style="display:flex; gap:4px; font-size:22px; cursor:pointer; color:#f59e0b; user-select:none; margin-bottom:var(--space-2);">
                    <span data-star="1">★</span>
                    <span data-star="2">★</span>
                    <span data-star="3">★</span>
                    <span data-star="4">★</span>
                    <span data-star="5">★</span>
                  </div>
                  <textarea class="form-input form-textarea review-comment-input" rows="2" placeholder="Write a quick review about this product..." style="width:100%; font-size:var(--text-xs); margin-bottom:var(--space-2); padding:6px 8px; border:1px solid var(--color-border-light); border-radius:var(--radius-md);">${item.review?.comment || ''}</textarea>
                  <button type="button" class="btn btn--primary btn--sm btn-submit-review" data-prod-id="${item.productId}" data-order-id="${o.dbId || o.id}" style="font-size:12px;">Submit Review</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Cancel Order Button for Active Orders -->
      ${(o.status === 'processing' || o.status === 'confirmed') ? `
        <div class="drawer-section" style="border-top:1px solid var(--color-border-light); padding-top:var(--space-3); margin-top:var(--space-3);">
          <button type="button" class="btn btn--outline btn--sm" id="customerCancelOrderBtn" data-order-id="${o.dbId || o.id}" style="color:var(--color-danger-600); border-color:var(--color-danger-300); width:100%;">
            Cancel This Order
          </button>
        </div>
      ` : ''}

      <!-- Need help -->
      <div class="drawer-help">
        <div class="drawer-help__text">
          <p class="drawer-help__label">Need Help?</p>
          <p class="drawer-help__sub">Call our store for any queries</p>
        </div>
        <a href="tel:9963657799" class="btn btn--accent" style="flex-shrink:0;">
          <svg class="icon icon--sm" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
          </svg>
          Call Now
        </a>
      </div>`;

    // Star rating selection interaction
    body.querySelectorAll('.star-rating-select').forEach(starContainer => {
      const stars = starContainer.querySelectorAll('span[data-star]');
      stars.forEach(s => {
        s.addEventListener('click', () => {
          const ratingVal = parseInt(s.dataset.star, 10);
          starContainer.dataset.selectedRating = ratingVal;
          stars.forEach(st => {
            const val = parseInt(st.dataset.star, 10);
            st.textContent = val <= ratingVal ? '★' : '☆';
          });
        });
      });
    });

    // Edit review toggle
    body.querySelectorAll('.btn-edit-review').forEach(btn => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.drawer-review-card');
        const form = card?.querySelector('.review-form-container');
        if (form) {
          form.style.display = form.style.display === 'none' ? 'block' : 'none';
        }
      });
    });

    // Submit review click
    body.querySelectorAll('.btn-submit-review').forEach(btn => {
      btn.addEventListener('click', async () => {
        const prodId = btn.dataset.prodId;
        const card = btn.closest('.drawer-review-card');
        const starContainer = card?.querySelector('.star-rating-select');
        const commentInput = card?.querySelector('.review-comment-input');
        const rating = parseInt(starContainer?.dataset.selectedRating || '5', 10);
        const comment = (commentInput?.value || '').trim();

        btn.disabled = true;
        btn.textContent = 'Submitting...';

        try {
          const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          };
          const token = localStorage.getItem('authToken');
          if (token) headers['Authorization'] = `Bearer ${token}`;

          const res = await fetch(`/api/products/${prodId}/rate`, {
            method: 'POST',
            headers,
            credentials: 'same-origin',
            body: JSON.stringify({ rating, comment })
          });

          const json = await res.json();
          if (res.ok && json.success) {
            alert('Thank you! Your product review has been submitted.');
            await fetchRealOrders();
            const updatedOrder = orders.find(ord => ord.id === o.id || ord.dbId === o.dbId);
            if (updatedOrder) populateDrawer(updatedOrder);
          } else {
            alert(json.message || 'Failed to submit review.');
            btn.disabled = false;
            btn.textContent = 'Submit Review';
          }
        } catch (err) {
          console.error(err);
          alert('Network error while submitting review.');
          btn.disabled = false;
          btn.textContent = 'Submit Review';
        }
      });
    });

    // Cancel order click
    const cancelBtn = body.querySelector('#customerCancelOrderBtn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        openCustomerCancelModal(o);
      });
    }
  }

  let activeCancelOrder = null;

  function openCustomerCancelModal(order) {
    activeCancelOrder = order;
    const modal = document.getElementById('customerCancelModal');
    const select = document.getElementById('customerCancelReasonSelect');
    const customWrap = document.getElementById('customerCustomReasonWrap');
    const customInput = document.getElementById('customerCustomReasonInput');

    if (select) select.selectedIndex = 0;
    if (customInput) customInput.value = '';
    if (customWrap) customWrap.style.display = 'none';

    if (modal) {
      modal.style.display = 'flex';
      modal.setAttribute('aria-hidden', 'false');
    }
  }

  function closeCustomerCancelModal() {
    const modal = document.getElementById('customerCancelModal');
    if (modal) {
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
    }
    activeCancelOrder = null;
  }

  function initCustomerCancelModal() {
    const select = document.getElementById('customerCancelReasonSelect');
    const customWrap = document.getElementById('customerCustomReasonWrap');
    const customInput = document.getElementById('customerCustomReasonInput');
    const closeBtn = document.getElementById('closeCustomerCancelModalBtn');
    const abortBtn = document.getElementById('abortCustomerCancelBtn');
    const confirmBtn = document.getElementById('confirmCustomerCancelBtn');

    if (select && customWrap) {
      select.addEventListener('change', () => {
        if (select.value === 'OTHER') {
          customWrap.style.display = 'block';
          if (customInput) customInput.focus();
        } else {
          customWrap.style.display = 'none';
        }
      });
    }

    if (closeBtn) closeBtn.addEventListener('click', closeCustomerCancelModal);
    if (abortBtn) abortBtn.addEventListener('click', closeCustomerCancelModal);

    if (confirmBtn) {
      confirmBtn.addEventListener('click', async () => {
        if (!activeCancelOrder) return;

        let reason = select ? select.value : '';
        if (reason === 'OTHER') {
          const customVal = customInput ? customInput.value.trim() : '';
          if (!customVal) {
            alert('Please specify why you are cancelling this order.');
            if (customInput) customInput.focus();
            return;
          }
          reason = customVal;
        }

        confirmBtn.disabled = true;
        confirmBtn.textContent = 'Cancelling...';

        try {
          const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          };
          const token = localStorage.getItem('authToken');
          if (token) headers['Authorization'] = `Bearer ${token}`;

          const res = await fetch(`/api/orders/${activeCancelOrder.dbId || activeCancelOrder.id}/cancel`, {
            method: 'POST',
            headers,
            credentials: 'same-origin',
            body: JSON.stringify({ reason })
          });

          const json = await res.json();
          if (res.ok && json.success) {
            alert('Your order has been cancelled.');
            const targetId = activeCancelOrder.id;
            const targetDbId = activeCancelOrder.dbId;
            closeCustomerCancelModal();
            await fetchRealOrders();
            const updatedOrder = orders.find(ord => ord.id === targetId || ord.dbId === targetDbId);
            if (updatedOrder) populateDrawer(updatedOrder);
          } else {
            alert(json.message || 'Could not cancel order.');
          }
        } catch (err) {
          console.error(err);
          alert('Network error while cancelling order.');
        } finally {
          confirmBtn.disabled = false;
          confirmBtn.textContent = 'Confirm Cancellation';
        }
      });
    }
  }

  // ─── Init ─────────────────────────────────────────────────────────────────
  render();
  fetchRealOrders();
  initCustomerCancelModal();

})();


