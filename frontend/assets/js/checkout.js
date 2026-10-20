/**
 * checkout.js — Enterprise Store Checkout Flow
 * Handles address selection, address creation, cart/item calculation, and backend order creation.
 */

(function () {
  'use strict';

  // ─── DOM References ────────────────────────────────────────────────────────
  const checkoutGrid = document.getElementById('checkoutGrid');
  const alertBanner = document.getElementById('checkoutAlert');
  const alertMsg = document.getElementById('checkoutAlertMsg');
  const alertClose = document.getElementById('checkoutAlertClose');

  // Address Section
  const addressSkeleton = document.getElementById('addressSkeleton');
  const selectedAddressCard = document.getElementById('selectedAddressCard');
  const noAddressCard = document.getElementById('noAddressCard');
  const openChangeAddressBtn = document.getElementById('openChangeAddressBtn');
  const noAddrAddBtn = document.getElementById('noAddrAddBtn');

  const selectedAddrName = document.getElementById('selectedAddrName');
  const selectedAddrType = document.getElementById('selectedAddrType');
  const selectedAddrDefault = document.getElementById('selectedAddrDefault');
  const selectedAddrText = document.getElementById('selectedAddrText');
  const selectedAddrPhone = document.getElementById('selectedAddrPhone');

  // Address Modal / Drawer
  const addressModalBackdrop = document.getElementById('addressModalBackdrop');
  const closeAddressModalBtn = document.getElementById('closeAddressModalBtn');
  const addressListView = document.getElementById('addressListView');
  const addressFormView = document.getElementById('addressFormView');
  const modalSavedCount = document.getElementById('modalSavedCount');
  const modalAddressCardsList = document.getElementById('modalAddressCardsList');
  const showNewAddressFormBtn = document.getElementById('showNewAddressFormBtn');
  const backToAddressListBtn = document.getElementById('backToAddressListBtn');
  const cancelAddressFormBtn = document.getElementById('cancelAddressFormBtn');
  const checkoutAddressForm = document.getElementById('checkoutAddressForm');
  const saveAddressBtn = document.getElementById('saveAddressBtn');
  const saveAddrSpinner = document.getElementById('saveAddrSpinner');
  const saveAddrBtnText = document.getElementById('saveAddrBtnText');
  const useCurrentLocationBtn = document.getElementById('useCurrentLocationBtn');
  const addrLocationStatus = document.getElementById('addrLocationStatus');

  // Items & Summary
  const checkoutItemsCount = document.getElementById('checkoutItemsCount');
  const checkoutItemsList = document.getElementById('checkoutItemsList');
  const checkoutEmptyItems = document.getElementById('checkoutEmptyItems');
  const summaryItemCount = document.getElementById('summaryItemCount');
  const summarySubtotal = document.getElementById('summarySubtotal');
  const summarySubtotalLabel = document.getElementById('summarySubtotalLabel');
  const summaryDiscountRow = document.getElementById('summaryDiscountRow');
  const summaryDiscount = document.getElementById('summaryDiscount');
  const summaryGiftsBreakdown = document.getElementById('summaryGiftsBreakdown');
  const summaryTotalAmount = document.getElementById('summaryTotalAmount');
  const savingsBanner = document.getElementById('savingsBanner');
  const savingsAmountText = document.getElementById('savingsAmountText');

  // Order Placement
  const placeOrderBtn = document.getElementById('placeOrderBtn');
  const placeOrderSpinner = document.getElementById('placeOrderSpinner');

  // Success Modal
  const orderSuccessModal = document.getElementById('orderSuccessModal');
  const successOrderShortId = document.getElementById('successOrderShortId');
  const successOrderTotal = document.getElementById('successOrderTotal');
  const successOrderPayment = document.getElementById('successOrderPayment');

  // ─── State ────────────────────────────────────────────────────────────────
  let userAddresses = [];
  let selectedAddressId = null;
  let checkoutItems = [];
  let isPlacingOrder = false;
  let isUserAuthed = false;

  // ─── Helpers ──────────────────────────────────────────────────────────────
  function fmt(n) {
    return '₹' + Number(n || 0).toLocaleString('en-IN');
  }

  function getAuthHeaders(extra = {}) {
    const headers = {
      Accept: 'application/json',
      ...extra,
    };
    const token = localStorage.getItem('authToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  function showAlert(msg, type = 'error') {
    if (!alertBanner || !alertMsg) return;
    alertBanner.className = `checkout-alert checkout-alert--${type}`;
    alertMsg.textContent = msg;
    alertBanner.removeAttribute('hidden');
    alertBanner.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function hideAlert() {
    if (alertBanner) alertBanner.setAttribute('hidden', '');
  }

  alertClose && alertClose.addEventListener('click', hideAlert);

  // ═════════════════════════════════════════════════════════════════════════
  // 1. AUTHENTICATION & USER DATA
  // ═════════════════════════════════════════════════════════════════════════

  async function checkAuthAndLoadUser() {
    try {
      const response = await fetch('/api/profile', {
        headers: getAuthHeaders(),
        credentials: 'same-origin',
      });

      if (response.status === 401) {
        // Clear stale local info
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        if (typeof window.showLoginRequiredModal === 'function') {
          window.showLoginRequiredModal('/checkout');
        } else {
          localStorage.setItem('pendingRoute', '/checkout');
          window.location.href = '/login';
        }
        return false;
      }

      if (!response.ok) {
        throw new Error('Failed to verify session');
      }

      const json = await response.json();
      if (json.success && json.data) {
        localStorage.setItem('authUser', JSON.stringify(json.data));
        return true;
      }
      return false;
    } catch (err) {
      console.warn('Auth verification check:', err);
      const cached = localStorage.getItem('authUser');
      if (!cached) {
        if (typeof window.showLoginRequiredModal === 'function') {
          window.showLoginRequiredModal('/checkout');
        }
        return false;
      }
      return true;
    }
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 2. ADDRESS MANAGEMENT (GET, SELECT, ADD FROM DATABASE)
  // ═════════════════════════════════════════════════════════════════════════

  async function fetchUserAddresses() {
    addressSkeleton && addressSkeleton.removeAttribute('hidden');
    selectedAddressCard && selectedAddressCard.setAttribute('hidden', '');
    noAddressCard && noAddressCard.setAttribute('hidden', '');
    openChangeAddressBtn && openChangeAddressBtn.setAttribute('hidden', '');

    try {
      const res = await fetch('/api/profile/addresses', {
        headers: getAuthHeaders(),
        credentials: 'same-origin',
      });

      if (res.status === 401) {
        if (typeof window.showLoginRequiredModal === 'function') {
          window.showLoginRequiredModal('/checkout');
        }
        noAddressCard && noAddressCard.removeAttribute('hidden');
        return;
      }

      if (!res.ok) throw new Error('Could not fetch addresses');

      const json = await res.json();
      userAddresses = (json.success && Array.isArray(json.data)) ? json.data : [];

      if (userAddresses.length === 0) {
        selectedAddressId = null;
        noAddressCard && noAddressCard.removeAttribute('hidden');
        selectedAddressCard && selectedAddressCard.setAttribute('hidden', '');
        openChangeAddressBtn && openChangeAddressBtn.setAttribute('hidden', '');
      } else {
        const defaultAddr = userAddresses.find(a => a.is_default) || userAddresses[0];
        selectAddress(defaultAddr.id);
        openChangeAddressBtn && openChangeAddressBtn.removeAttribute('hidden');
      }

      renderModalAddressList();
    } catch (err) {
      console.error('Error fetching addresses:', err);
      showAlert('Unable to load saved delivery addresses. Please try again.');
      noAddressCard && noAddressCard.removeAttribute('hidden');
    } finally {
      addressSkeleton && addressSkeleton.setAttribute('hidden', '');
    }
  }

  function selectAddress(addressId) {
    selectedAddressId = addressId;
    const addr = userAddresses.find(a => a.id === addressId);
    if (!addr) return;

    if (selectedAddressCard) {
      selectedAddrName && (selectedAddrName.textContent = addr.full_name);

      const typeKey = (addr.address_type || 'HOME').toUpperCase();
      if (selectedAddrType) {
        selectedAddrType.textContent = typeKey;
        selectedAddrType.className = `checkout-addr-type-tag checkout-addr-type-tag--${typeKey.toLowerCase()}`;
      }

      if (selectedAddrDefault) {
        if (addr.is_default) selectedAddrDefault.removeAttribute('hidden');
        else selectedAddrDefault.setAttribute('hidden', '');
      }

      if (selectedAddrText) {
        const line2 = addr.address_line_2 ? `, ${addr.address_line_2}` : '';
        const landmark = addr.landmark ? `, ${addr.landmark}` : '';
        selectedAddrText.textContent = `${addr.address_line_1}${line2}${landmark}, ${addr.city}, ${addr.state} — ${addr.postal_code}`;
      }

      if (selectedAddrPhone) {
        selectedAddrPhone.textContent = addr.phone_number;
      }

      selectedAddressCard.removeAttribute('hidden');
      noAddressCard && noAddressCard.setAttribute('hidden', '');
      openChangeAddressBtn && openChangeAddressBtn.removeAttribute('hidden');
    }

    renderModalAddressList();
  }

  // Render list inside the change address modal
  function renderModalAddressList() {
    if (!modalAddressCardsList) return;

    if (modalSavedCount) {
      modalSavedCount.textContent = `Saved Addresses (${userAddresses.length})`;
    }

    if (userAddresses.length === 0) {
      modalAddressCardsList.innerHTML = `
        <div class="checkout-empty-items" style="padding: 24px 0;">
          <p class="checkout-empty-items__desc">No saved addresses found. Add a new address below.</p>
        </div>`;
      return;
    }

    modalAddressCardsList.innerHTML = userAddresses.map(addr => {
      const isSelected = addr.id === selectedAddressId;
      const typeKey = (addr.address_type || 'HOME').toUpperCase();
      const line2 = addr.address_line_2 ? `, ${addr.address_line_2}` : '';
      const landmark = addr.landmark ? `, ${addr.landmark}` : '';
      const fullText = `${addr.address_line_1}${line2}${landmark}, ${addr.city}, ${addr.state} — ${addr.postal_code}`;

      return `
        <div class="checkout-addr-card-item ${isSelected ? 'checkout-addr-card-item--selected' : ''}" data-addr-id="${addr.id}">
          <input type="radio" name="modal_selected_addr" class="checkout-addr-radio" value="${addr.id}" ${isSelected ? 'checked' : ''} aria-label="Select address for ${addr.full_name}"/>
          <div class="checkout-addr-card-content">
            <div class="checkout-addr-card-header">
              <span class="checkout-addr-card-name">${escapeHtml(addr.full_name)}</span>
              <span class="checkout-addr-type-tag checkout-addr-type-tag--${typeKey.toLowerCase()}">${typeKey}</span>
              ${addr.is_default ? '<span class="checkout-addr-default-tag">DEFAULT</span>' : ''}
            </div>
            <p class="checkout-addr-card-text">${escapeHtml(fullText)}</p>
            <p class="checkout-addr-card-phone"><strong>Mobile:</strong> ${escapeHtml(addr.phone_number)}</p>
            ${!isSelected ? `<button type="button" class="btn btn--primary btn--sm checkout-addr-card-deliver-btn" data-action="deliver-here" data-addr-id="${addr.id}">Deliver Here</button>` : ''}
          </div>
        </div>`;
    }).join('');

    // Attach click listeners to cards & buttons
    modalAddressCardsList.querySelectorAll('.checkout-addr-card-item').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-addr-id');
        if (id) {
          selectAddress(id);
          closeAddressModal();
        }
      });
    });

    modalAddressCardsList.querySelectorAll('[data-action="deliver-here"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-addr-id');
        if (id) {
          selectAddress(id);
          closeAddressModal();
        }
      });
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ─── Modal Open / Close / Views ────────────────────────────────────────────
  function openAddressModal(showForm = false) {
    if (!addressModalBackdrop) return;
    addressModalBackdrop.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';

    if (showForm) {
      showAddressFormView();
    } else {
      showAddressListView();
    }
  }

  function closeAddressModal() {
    if (!addressModalBackdrop) return;
    addressModalBackdrop.setAttribute('hidden', '');
    document.body.style.overflow = '';
    clearAddressForm();
  }

  function showAddressListView() {
    addressListView && addressListView.removeAttribute('hidden');
    addressFormView && addressFormView.setAttribute('hidden', '');
    renderModalAddressList();
  }

  function showAddressFormView() {
    addressListView && addressListView.setAttribute('hidden', '');
    addressFormView && addressFormView.removeAttribute('hidden');
    clearAddressForm();
    const nameInput = document.getElementById('addrFormFullName');
    nameInput && nameInput.focus();
  }

  function clearAddressForm() {
    if (!checkoutAddressForm) return;
    checkoutAddressForm.reset();
    document.getElementById('addrFormId').value = '';
    document.querySelectorAll('.checkout-form-error').forEach(el => el.setAttribute('hidden', ''));
    if (addrLocationStatus) addrLocationStatus.setAttribute('hidden', '');
  }

  // Modal event bindings
  openChangeAddressBtn && openChangeAddressBtn.addEventListener('click', () => openAddressModal(false));
  noAddrAddBtn && noAddrAddBtn.addEventListener('click', () => openAddressModal(true));
  showNewAddressFormBtn && showNewAddressFormBtn.addEventListener('click', () => showAddressFormView());
  backToAddressListBtn && backToAddressListBtn.addEventListener('click', () => showAddressListView());
  cancelAddressFormBtn && cancelAddressFormBtn.addEventListener('click', () => {
    if (userAddresses.length > 0) showAddressListView();
    else closeAddressModal();
  });
  closeAddressModalBtn && closeAddressModalBtn.addEventListener('click', closeAddressModal);

  addressModalBackdrop && addressModalBackdrop.addEventListener('click', (e) => {
    if (e.target === addressModalBackdrop) closeAddressModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && addressModalBackdrop && !addressModalBackdrop.hasAttribute('hidden')) {
      closeAddressModal();
    }
  });

  // ─── GPS Location Autofill ─────────────────────────────────────────────────
  useCurrentLocationBtn && useCurrentLocationBtn.addEventListener('click', async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    if (addrLocationStatus) {
      addrLocationStatus.textContent = 'Detecting location...';
      addrLocationStatus.removeAttribute('hidden');
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
          const geoData = await geoRes.json();

          if (geoData && geoData.address) {
            const a = geoData.address;
            const pin = a.postcode || '';
            const city = a.city || a.town || a.village || a.county || '';
            const state = a.state || '';

            if (pin) document.getElementById('addrFormPincode').value = pin.replace(/\D/g, '').slice(0, 6);
            if (city) document.getElementById('addrFormCity').value = city;
            if (state) {
              const stateSelect = document.getElementById('addrFormState');
              for (let i = 0; i < stateSelect.options.length; i++) {
                if (stateSelect.options[i].text.toLowerCase().includes(state.toLowerCase())) {
                  stateSelect.selectedIndex = i;
                  break;
                }
              }
            }

            if (addrLocationStatus) {
              addrLocationStatus.textContent = 'Location detected successfully!';
              setTimeout(() => addrLocationStatus && addrLocationStatus.setAttribute('hidden', ''), 3000);
            }
          }
        } catch (e) {
          if (addrLocationStatus) addrLocationStatus.textContent = 'Could not autofill address from GPS.';
        }
      },
      (err) => {
        if (addrLocationStatus) {
          addrLocationStatus.textContent = 'Location permission denied or unavailable.';
        }
      },
      { timeout: 10000 }
    );
  });

  // ─── Save New Address (POST /api/profile/address) ───────────────────────────
  checkoutAddressForm && checkoutAddressForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fullName = document.getElementById('addrFormFullName').value.trim();
    const phone = document.getElementById('addrFormPhone').value.trim();
    const pin = document.getElementById('addrFormPincode').value.trim();
    const landmark = document.getElementById('addrFormLandmark').value.trim();
    const line1 = document.getElementById('addrFormLine1').value.trim();
    const line2 = document.getElementById('addrFormLine2').value.trim();
    const city = document.getElementById('addrFormCity').value.trim();
    const state = document.getElementById('addrFormState').value.trim();
    const addressTypeRadio = document.querySelector('input[name="address_type"]:checked');
    const addressType = addressTypeRadio ? addressTypeRadio.value : 'HOME';
    const isDefault = document.getElementById('addrFormIsDefault').checked;

    // Reset error messages
    document.querySelectorAll('.checkout-form-error').forEach(el => el.setAttribute('hidden', ''));

    let valid = true;
    if (fullName.length < 2) {
      document.getElementById('errFullName').removeAttribute('hidden');
      valid = false;
    }
    if (!/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
      document.getElementById('errPhone').removeAttribute('hidden');
      valid = false;
    }
    if (!/^\d{6}$/.test(pin)) {
      document.getElementById('errPincode').removeAttribute('hidden');
      valid = false;
    }
    if (line1.length < 3) {
      document.getElementById('errLine1').removeAttribute('hidden');
      valid = false;
    }
    if (!city) {
      document.getElementById('errCity').removeAttribute('hidden');
      valid = false;
    }
    if (!state) {
      document.getElementById('errState').removeAttribute('hidden');
      valid = false;
    }

    if (!valid) return;

    const payload = {
      full_name: fullName,
      phone_number: phone,
      postal_code: pin,
      landmark,
      address_line_1: line1,
      address_line_2: line2,
      city,
      state,
      country: 'India',
      address_type: addressType,
      is_default: isDefault,
    };

    if (saveAddressBtn) saveAddressBtn.disabled = true;
    saveAddrSpinner && saveAddrSpinner.removeAttribute('hidden');
    saveAddrBtnText && (saveAddrBtnText.textContent = 'Saving...');

    try {
      const res = await fetch('/api/profile/address', {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        credentials: 'same-origin',
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        if (typeof window.showLoginRequiredModal === 'function') {
          window.showLoginRequiredModal('/checkout');
        }
        return;
      }

      const json = await res.json();
      if (res.ok && json.success && json.data) {
        const newAddress = json.data;
        userAddresses.unshift(newAddress);
        selectAddress(newAddress.id);
        closeAddressModal();
        showAlert('Delivery address saved successfully!', 'success');
        setTimeout(hideAlert, 4000);
      } else {
        throw new Error(json.message || 'Failed to save address.');
      }
    } catch (err) {
      console.error('Error creating address:', err);
      alert('Could not save address. ' + err.message);
    } finally {
      if (saveAddressBtn) saveAddressBtn.disabled = false;
      saveAddrSpinner && saveAddrSpinner.setAttribute('hidden', '');
      saveAddrBtnText && (saveAddrBtnText.textContent = 'Save & Deliver Here');
    }
  });

  // ═════════════════════════════════════════════════════════════════════════
  // 3. CART & ORDER ITEMS INITIALIZATION
  // ═════════════════════════════════════════════════════════════════════════

  async function loadCheckoutItems() {
    let items = [];

    // 1. Priority A: Direct Buy Now item in localStorage
    try {
      const buyNowRaw = localStorage.getItem('ks_checkout_item');
      if (buyNowRaw) {
        const item = JSON.parse(buyNowRaw);
        if (item && (item.id || item.productId || item.slug)) {
          items = [item];
        }
      }
    } catch (e) { }

    // 2. Priority B: URL Parameter (?productId=... or ?slug=...)
    if (items.length === 0) {
      const urlParams = new URLSearchParams(window.location.search);
      const paramId = urlParams.get('productId') || urlParams.get('slug') || urlParams.get('id');
      if (paramId) {
        items = [{ id: paramId, quantity: parseInt(urlParams.get('qty'), 10) || 1 }];
      }
    }

    // 3. Priority C: Cart in localStorage
    if (items.length === 0) {
      try {
        const cartRaw = localStorage.getItem('ks_cart');
        if (cartRaw) {
          const parsed = JSON.parse(cartRaw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            items = parsed;
          }
        }
      } catch (e) { }
    }

    // 4. Default demonstration fallback if empty
    if (items.length === 0) {
      try {
        const trendingRes = await fetch('/api/products?limit=1');
        if (trendingRes.ok) {
          const trendingJson = await trendingRes.json();
          const firstProd = (trendingJson.data && trendingJson.data[0]) || null;
          if (firstProd) {
            items = [{
              id: firstProd.slug || firstProd.id,
              dbId: firstProd.id,
              name: firstProd.name,
              brand: firstProd.brand,
              price: Number(firstProd.price),
              originalPrice: Math.round(Number(firstProd.price) * 1.15),
              imageUrl: firstProd.productImages?.[0]?.imageUrl || '',
              quantity: 1,
              variantDescription: 'Standard Official Warranty',
            }];
          }
        }
      } catch (e) { }
    }

    // Hydrate item details from backend product API
    checkoutItems = [];
    for (const rawItem of items) {
      const prodId = rawItem.productId || rawItem.dbId || rawItem.id || rawItem.slug;
      if (!prodId) continue;

      try {
        const res = await fetch(`/api/products/${encodeURIComponent(prodId)}`);
        if (res.ok) {
          const pJson = await res.json();
          if (pJson.success && pJson.data) {
            const p = pJson.data;
            const primaryImg = p.productImages?.find(img => img.isPrimary)?.imageUrl
              || p.productImages?.[0]?.imageUrl
              || rawItem.imageUrl
              || '';
            let basePrice = Number(p.price) || 0;
            if (rawItem.variantId && p.variants && p.variants.length > 0) {
              const matchedVar = p.variants.find(v => v.id === rawItem.variantId);
              if (matchedVar && matchedVar.priceOverride) {
                basePrice = Number(matchedVar.priceOverride);
              }
            }
            const offerVal = (p.offer !== undefined && p.offer !== null && !isNaN(parseFloat(p.offer))) ? parseFloat(p.offer) : 0;
            let price = offerVal > 0 ? Math.round(basePrice * (1 - offerVal / 100)) : (Number(rawItem.price) || basePrice);
            const originalPrice = rawItem.originalPrice || basePrice || Math.round(price * 1.15);

            // Extract gifts from product or rawItem
            let itemGifts = [];
            if (Array.isArray(p.giftsGiven) && p.giftsGiven.length > 0) {
              itemGifts = p.giftsGiven.map(g => {
                const isCustom = !g.giftProductId;
                const imgUrl = isCustom
                  ? (g.customGiftImage || '')
                  : (g.giftProduct?.productImages?.find(img => img.isPrimary)?.imageUrl || g.giftProduct?.productImages?.[0]?.imageUrl || '');
                return {
                  id: g.giftProduct?.id || g.id,
                  name: g.giftProduct?.name || g.customGiftName || 'Free Gift',
                  brand: g.giftProduct?.brand || null,
                  price: Number(g.giftProduct?.price) || 0,
                  imageUrl: imgUrl,
                  isCustom,
                };
              });
            } else if (Array.isArray(rawItem.gifts) && rawItem.gifts.length > 0) {
              itemGifts = rawItem.gifts.map(g => ({
                id: g.id || `gift_${Math.random()}`,
                name: g.name || g.customGiftName || 'Free Gift',
                brand: g.brand || null,
                price: Number(g.price) || 0,
                imageUrl: g.imageUrl || g.customGiftImage || '',
                isCustom: Boolean(g.isCustom),
              }));
            }

            checkoutItems.push({
              productId: p.id,
              dbId: p.id,
              slug: p.slug,
              name: p.name,
              brand: p.brand || 'Enterprise Store',
              price,
              originalPrice,
              imageUrl: primaryImg,
              quantity: Math.max(1, parseInt(rawItem.quantity, 10) || 1),
              variantDescription: rawItem.variantDescription || '100% Genuine · 1 Year Warranty',
              variantId: rawItem.variantId || null,
              gifts: itemGifts,
            });
            continue;
          }
        }
      } catch (err) {
        console.warn('Could not fetch product detail for checkout:', err);
      }

      // Fallback using rawItem
      const fallbackGifts = Array.isArray(rawItem.gifts) ? rawItem.gifts.map(g => ({
        id: g.id || `gift_${Math.random()}`,
        name: g.name || g.customGiftName || 'Free Gift',
        brand: g.brand || null,
        price: Number(g.price) || 0,
        imageUrl: g.imageUrl || g.customGiftImage || '',
        isCustom: Boolean(g.isCustom),
      })) : [];

      checkoutItems.push({
        productId: rawItem.productId || rawItem.dbId || rawItem.id,
        dbId: rawItem.dbId || rawItem.id,
        slug: rawItem.slug || rawItem.id,
        name: rawItem.name || 'Electronics Product',
        brand: rawItem.brand || 'Kishor Enterprises',
        price: Number(rawItem.price || rawItem.salePrice || 999),
        originalPrice: Number(rawItem.originalPrice || rawItem.price || 1299),
        imageUrl: rawItem.imageUrl || '',
        quantity: Math.max(1, parseInt(rawItem.quantity, 10) || 1),
        variantDescription: rawItem.variantDescription || 'Official Warranty Included',
        variantId: rawItem.variantId || null,
        gifts: fallbackGifts,
      });
    }

    renderCheckoutItems();
    recalculateTotals();
  }

  function updatePlaceOrderBtnState() {
    if (!placeOrderBtn) return;
    const btnText = placeOrderBtn.querySelector('.checkout-place-order-btn__text');
    if (!isUserAuthed) {
      placeOrderBtn.disabled = true;
      placeOrderBtn.style.opacity = '0.6';
      placeOrderBtn.style.cursor = 'not-allowed';
      if (btnText) btnText.textContent = 'LOGIN TO PLACE ORDER';
    } else if (checkoutItems.length === 0) {
      placeOrderBtn.disabled = true;
      placeOrderBtn.style.opacity = '';
      placeOrderBtn.style.cursor = '';
      if (btnText) btnText.textContent = 'PLACE ORDER';
    } else {
      placeOrderBtn.disabled = false;
      placeOrderBtn.style.opacity = '';
      placeOrderBtn.style.cursor = '';
      if (btnText) btnText.textContent = 'PLACE ORDER';
    }
  }

  function renderCheckoutItems() {
    if (!checkoutItemsList) return;

    if (checkoutItems.length === 0) {
      checkoutItemsList.innerHTML = '';
      checkoutEmptyItems && checkoutEmptyItems.removeAttribute('hidden');
      checkoutItemsCount && (checkoutItemsCount.textContent = '0');
      summaryItemCount && (summaryItemCount.textContent = '0');
      updatePlaceOrderBtnState();
      return;
    }

    checkoutEmptyItems && checkoutEmptyItems.setAttribute('hidden', '');
    updatePlaceOrderBtnState();
    checkoutItemsCount && (checkoutItemsCount.textContent = checkoutItems.length);
    summaryItemCount && (summaryItemCount.textContent = checkoutItems.length);

    checkoutItemsList.innerHTML = checkoutItems.map((item, idx) => {
      const discountPct = item.originalPrice > item.price
        ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
        : 0;

      const hasGifts = Array.isArray(item.gifts) && item.gifts.length > 0;
      const giftsHtml = hasGifts ? `
        <div class="checkout-item-gifts-box">
          <div class="checkout-item-gifts-header">
            <div class="checkout-item-gifts-title-wrap">
              <span class="checkout-item-gifts-icon" aria-hidden="true">
                <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                  <path fill-rule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0115 5h1a2 2 0 012 2v1a2 2 0 01-2 2v7a2 2 0 01-2 2H6a2 2 0 01-2-2V10a2 2 0 01-2-2V7a2 2 0 012-2h1zm3.05-1.164A1 1 0 007 5h2.86a2.98 2.98 0 01-1.81-1.164zM11.14 5H13a1 1 0 00-.86-1.164A2.98 2.98 0 0011.14 5zM4 7v2h12V7H4zm2 4v6h8v-6H6z" clip-rule="evenodd"/>
                </svg>
              </span>
              <span class="checkout-item-gifts-title">Shopkeeper Offer: Free Gift${item.gifts.length > 1 ? 's' : ''} Included</span>
            </div>
            <span class="checkout-item-gifts-count-badge">${item.gifts.length} Free Item${item.gifts.length > 1 ? 's' : ''}</span>
          </div>

          <div class="checkout-item-gifts-list">
            ${item.gifts.map(gift => `
              <div class="checkout-gift-row">
                <div class="checkout-gift-thumb">
                  ${gift.imageUrl
                    ? `<img src="${gift.imageUrl}" alt="${escapeHtml(gift.name)}" loading="lazy" />`
                    : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" width="20" height="20">
                         <path d="M20 12v10H4V12"/>
                         <path d="M2 7h20v5H2z"/>
                         <path d="M12 22V7"/>
                         <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
                         <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
                       </svg>`
                  }
                </div>
                <div class="checkout-gift-info">
                  <div class="checkout-gift-name-wrap">
                    <span class="checkout-gift-pill">FREE GIFT</span>
                    <span class="checkout-gift-name" title="${escapeHtml(gift.name)}">${escapeHtml(gift.name)}</span>
                    ${item.quantity > 1 ? `<span class="checkout-gift-qty-tag">x${item.quantity}</span>` : ''}
                  </div>
                  <div class="checkout-gift-price-wrap">
                    ${gift.price > 0 ? `<span class="checkout-gift-mrp">${fmt(gift.price * item.quantity)}</span>` : ''}
                    <span class="checkout-gift-free-text">FREE</span>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : '';

      return `
        <div class="checkout-item-card" data-idx="${idx}">
          <div class="checkout-item-main">
            <div class="checkout-item-thumb">
              ${item.imageUrl
                ? `<img src="${item.imageUrl}" alt="${escapeHtml(item.name)}" />`
                : `<svg viewBox="0 0 60 60" fill="none" width="40" height="40"><rect width="60" height="60" rx="8" fill="#e8edf5"/><path d="M20 20h20v20H20z" fill="#1e3d8f20"/></svg>`
              }
            </div>

            <div class="checkout-item-info">
              <span class="checkout-item-brand">${escapeHtml(item.brand)}</span>
              <h3 class="checkout-item-title">${escapeHtml(item.name)}</h3>
              <span class="checkout-item-variant">${escapeHtml(item.variantDescription)}</span>

              <div class="checkout-item-pricing">
                <span class="checkout-item-price-current">${fmt(item.price)}</span>
                ${item.originalPrice > item.price ? `<span class="checkout-item-price-original">${fmt(item.originalPrice)}</span>` : ''}
                ${discountPct > 0 ? `<span class="checkout-item-discount-badge">${discountPct}% off</span>` : ''}
              </div>

              <div class="checkout-item-bottom">
                <div class="checkout-qty-control">
                  <button type="button" class="checkout-qty-btn" data-action="dec" data-idx="${idx}" aria-label="Decrease quantity" ${item.quantity <= 1 ? 'disabled' : ''}>−</button>
                  <span class="checkout-qty-val">${item.quantity}</span>
                  <button type="button" class="checkout-qty-btn" data-action="inc" data-idx="${idx}" aria-label="Increase quantity">+</button>
                </div>

                <span class="checkout-item-delivery-est">
                  ⚡ Express Delivery: 3-5 Days
                </span>

                <button type="button" class="checkout-item-remove-btn" data-action="remove" data-idx="${idx}">
                  REMOVE
                </button>
              </div>
            </div>
          </div>

          ${giftsHtml}
        </div>`;
    }).join('');

    // Quantity & Remove Event Listeners
    checkoutItemsList.querySelectorAll('[data-action="inc"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        if (checkoutItems[idx]) {
          checkoutItems[idx].quantity += 1;
          renderCheckoutItems();
          recalculateTotals();
        }
      });
    });

    checkoutItemsList.querySelectorAll('[data-action="dec"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        if (checkoutItems[idx] && checkoutItems[idx].quantity > 1) {
          checkoutItems[idx].quantity -= 1;
          renderCheckoutItems();
          recalculateTotals();
        }
      });
    });

    checkoutItemsList.querySelectorAll('[data-action="remove"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        if (checkoutItems[idx]) {
          checkoutItems.splice(idx, 1);
          renderCheckoutItems();
          recalculateTotals();
        }
      });
    });
  }

  function recalculateTotals() {
    let productsMRP = 0;
    let totalSale = 0;
    let totalItemsQty = 0;

    // Collect all gifts across all items
    const allGifts = [];

    checkoutItems.forEach(it => {
      const qty = it.quantity || 1;
      totalItemsQty += qty;
      productsMRP += (it.originalPrice || it.price) * qty;
      totalSale += it.price * qty;

      if (Array.isArray(it.gifts)) {
        it.gifts.forEach(g => {
          const unitPrice = Number(g.price) || 0;
          allGifts.push({
            name: g.name,
            unitPrice,
            quantity: qty,
            totalPrice: unitPrice * qty,
            isCustom: Boolean(g.isCustom),
          });
        });
      }
    });

    const giftsTotalMRP = allGifts.reduce((sum, g) => sum + g.totalPrice, 0);
    const grossPrice = productsMRP + giftsTotalMRP;
    const productDiscount = Math.max(0, productsMRP - totalSale);
    const deliveryFee = 0; // Free delivery
    const totalAmount = totalSale + deliveryFee;
    const totalSavings = productDiscount + giftsTotalMRP;

    // 1. Update Subtotal Label and Value
    if (summarySubtotalLabel) {
      const itemsLabel = `${totalItemsQty} item${totalItemsQty > 1 ? 's' : ''}`;
      const giftsCountLabel = allGifts.length > 0
        ? ` + ${allGifts.length} free gift${allGifts.length > 1 ? 's' : ''}`
        : '';
      summarySubtotalLabel.innerHTML = `Price (${itemsLabel}${giftsCountLabel})`;
    } else if (summaryItemCount) {
      summaryItemCount.textContent = totalItemsQty;
    }

    summarySubtotal && (summarySubtotal.textContent = fmt(grossPrice));

    // 2. Update Product Discount Row
    if (productDiscount > 0) {
      summaryDiscount && (summaryDiscount.textContent = `-${fmt(productDiscount)}`);
      summaryDiscountRow && summaryDiscountRow.removeAttribute('hidden');
    } else {
      summaryDiscountRow && summaryDiscountRow.setAttribute('hidden', '');
    }

    // 3. Render Gifts Breakdown rows (gifts one by one with -sign means FREE)
    if (summaryGiftsBreakdown) {
      if (allGifts.length > 0) {
        summaryGiftsBreakdown.innerHTML = allGifts.map(g => {
          const qtyText = g.quantity > 1 ? ` (x${g.quantity})` : '';
          const valHtml = g.totalPrice > 0
            ? `<span class="checkout-price-original">${fmt(g.totalPrice)}</span> <span class="checkout-text-success font-semibold">-${fmt(g.totalPrice)}</span>`
            : `<span class="checkout-text-success font-semibold">-₹0 (FREE)</span>`;

          return `
            <div class="checkout-price-row checkout-price-row--gift">
              <dt class="checkout-price-row__label">
                <span class="checkout-gift-badge-sm">🎁 Free Gift</span>
                <span class="checkout-price-gift-name" title="${escapeHtml(g.name)}">${escapeHtml(g.name)}${qtyText}</span>
              </dt>
              <dd class="checkout-price-row__val">
                ${valHtml}
              </dd>
            </div>`;
        }).join('');
        summaryGiftsBreakdown.removeAttribute('hidden');
      } else {
        summaryGiftsBreakdown.innerHTML = '';
        summaryGiftsBreakdown.setAttribute('hidden', '');
      }
    }

    // 4. Update Final Total Amount
    summaryTotalAmount && (summaryTotalAmount.textContent = fmt(totalAmount));

    // 5. Update Savings Banner
    if (totalSavings > 0) {
      if (savingsAmountText) savingsAmountText.textContent = fmt(totalSavings);
      savingsBanner && savingsBanner.removeAttribute('hidden');
    } else {
      savingsBanner && savingsBanner.setAttribute('hidden', '');
    }
  }

  // Payment Option selection styling
  document.querySelectorAll('.checkout-payment-opt').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.checkout-payment-opt').forEach(o => o.classList.remove('checkout-payment-opt--selected'));
      opt.classList.add('checkout-payment-opt--selected');
      const radio = opt.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // 4. ORDER CREATION (POST /api/orders)
  // ═════════════════════════════════════════════════════════════════════════

  async function handlePlaceOrder() {
    if (isPlacingOrder) return;

    hideAlert();

    // 0. Verify authentication
    if (!isUserAuthed) {
      if (typeof window.showLoginRequiredModal === 'function') {
        window.showLoginRequiredModal('/checkout');
      } else {
        localStorage.setItem('pendingRoute', '/checkout');
        window.location.href = '/login?pendingRoute=%2Fcheckout';
      }
      return;
    }

    // 1. Verify address selection
    if (!selectedAddressId) {
      showAlert('Please select or add a delivery address to place your order.');
      openAddressModal(userAddresses.length === 0);
      return;
    }

    // 2. Verify items
    if (!checkoutItems || checkoutItems.length === 0) {
      showAlert('Your cart is empty. Please add items to proceed.');
      return;
    }

    // Get selected payment mode
    const paymentRadio = document.querySelector('input[name="payment_mode"]:checked');
    const paymentMethod = paymentRadio ? paymentRadio.value : 'COD';

    const orderPayload = {
      addressId: selectedAddressId,
      paymentMethod,
      items: checkoutItems.map(it => ({
        productId: it.productId || it.dbId,
        variantId: it.variantId || null,
        productName: it.name,
        variantDescription: it.variantDescription || '',
        quantity: it.quantity,
      })),
    };

    isPlacingOrder = true;
    if (placeOrderBtn) placeOrderBtn.disabled = true;
    placeOrderSpinner && placeOrderSpinner.removeAttribute('hidden');
    const btnText = placeOrderBtn.querySelector('.checkout-place-order-btn__text');
    if (btnText) btnText.textContent = 'PLACING ORDER...';

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        credentials: 'same-origin',
        body: JSON.stringify(orderPayload),
      });

      if (res.status === 401) {
        isUserAuthed = false;
        updatePlaceOrderBtnState();
        if (typeof window.showLoginRequiredModal === 'function') {
          window.showLoginRequiredModal('/checkout');
        } else {
          window.location.href = '/login';
        }
        return;
      }

      let json;
      try {
        json = await res.json();
      } catch (parseErr) {
        throw new Error('Server returned an invalid response. Please try again.');
      }

      if (res.ok && json.success) {
        // Clear checkout state
        try {
          localStorage.removeItem('ks_checkout_item');
          localStorage.removeItem('ks_cart');
        } catch (e) { }

        // Show celebratory success modal
        if (orderSuccessModal) {
          successOrderShortId && (successOrderShortId.textContent = `#${json.shortId || json.data?.shortId}`);
          successOrderTotal && (successOrderTotal.textContent = fmt(json.data?.totalAmount || summaryTotalAmount.textContent));
          successOrderPayment && (successOrderPayment.textContent = paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment');
          orderSuccessModal.removeAttribute('hidden');
        } else {
          window.location.href = '/orders';
        }
      } else {
        throw new Error(json.message || 'Unable to place order. Please try again.');
      }
    } catch (err) {
      console.error('Order creation failed:', err);
      showAlert(err.message || 'An error occurred while placing your order. Please check your network and try again.');
    } finally {
      isPlacingOrder = false;
      placeOrderSpinner && placeOrderSpinner.setAttribute('hidden', '');
      updatePlaceOrderBtnState();
    }
  }

  placeOrderBtn && placeOrderBtn.addEventListener('click', handlePlaceOrder);

  // ═════════════════════════════════════════════════════════════════════════
  // 5. INITIALIZATION
  // ═════════════════════════════════════════════════════════════════════════

  async function init() {
    isUserAuthed = await checkAuthAndLoadUser();
    if (isUserAuthed) {
      await fetchUserAddresses();
    } else {
      addressSkeleton && addressSkeleton.setAttribute('hidden', '');
      noAddressCard && noAddressCard.removeAttribute('hidden');
    }
    await loadCheckoutItems();
    updatePlaceOrderBtnState();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
