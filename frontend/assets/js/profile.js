/**
 * profile.js — Enterprise Store My Profile & Manage Addresses
 *
 * Handles:
 * - GET /api/profile integration (hydrates user data from database via JWT cookie)
 * - POST /api/profile integration (updates Full Name/username in database)
 * - Authentication & 401 redirect handling
 * - Tab switching (Profile Info vs Manage Addresses)
 * - Manage Addresses CRUD & local fallback
 * - Sidebar logout action
 */

(function () {
  'use strict';

  const STORAGE_KEY_ADDRESSES = 'userAddresses';
  const STORAGE_KEY_PENDING = 'pendingRoute';

  // ─── Global Alert Helper ──────────────────────────────────────────────────
  const alertBox = document.getElementById('profileAlert');
  const alertText = document.getElementById('profileAlertText');
  const alertClose = document.getElementById('profileAlertClose');

  let alertTimeout = null;
  function showAlert(message, type = 'success') {
    if (!alertBox || !alertText) return;
    clearTimeout(alertTimeout);

    alertBox.className = `profile-alert profile-alert--${type}`;
    alertText.textContent = message;
    alertBox.removeAttribute('hidden');

    alertTimeout = setTimeout(() => {
      hideAlert();
    }, 5000);
  }

  function hideAlert() {
    if (alertBox) alertBox.setAttribute('hidden', '');
  }

  alertClose && alertClose.addEventListener('click', hideAlert);

  // ─── Top-Right Toast Notification (Mobile Responsive) ─────────────────────
  function showRightToast(message) {
    let toast = document.getElementById('top-right-toast');
    if (!toast) {
      // Inject CSS for responsive toast
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
        #top-right-toast.show {
          transform: translateX(0);
        }
        @media (max-width: 768px) {
          #top-right-toast {
            top: 75px;
            right: 16px;
            width: calc(100vw - 32px);
            max-width: none;
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

    // trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    // hide after 3 seconds
    if (toast.hideTimeout) clearTimeout(toast.hideTimeout);
    toast.hideTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  // ─── DOM References ───────────────────────────────────────────────────────
  const sidebarUserName = document.getElementById('sidebarUserName');

  // Breadcrumb
  const breadcrumbActive = document.getElementById('breadcrumbActiveSection');

  // Tabs
  const tabBtnProfileInfo = document.getElementById('tabBtnProfileInfo');
  const tabBtnManageAddresses = document.getElementById('tabBtnManageAddresses');
  const profileInfoSection = document.getElementById('profileInfoSection');
  const manageAddressesSection = document.getElementById('manageAddressesSection');

  // Personal Info Form
  const personalInfoForm = document.getElementById('personalInfoForm');
  const profileFullName = document.getElementById('profileFullName');
  const editPersonalBtn = document.getElementById('editPersonalBtn');
  const cancelPersonalBtn = document.getElementById('cancelPersonalBtn');
  const savePersonalBtn = document.getElementById('savePersonalBtn');
  const personalActions = document.getElementById('personalActions');
  const fullNameError = document.getElementById('fullNameError');
  const genderRadios = document.querySelectorAll('input[name="gender"]');

  // Read-only contact inputs
  const profileEmail = document.getElementById('profileEmail');
  const profilePhone = document.getElementById('profilePhone');
  const editEmailBtn = document.getElementById('editEmailBtn');
  const editPhoneBtn = document.getElementById('editPhoneBtn');

  // Address Panel
  const addAddressTriggerCard = document.getElementById('addAddressTriggerCard');
  const openAddAddressBtn = document.getElementById('openAddAddressBtn');
  const addressFormPanel = document.getElementById('addressFormPanel');
  const addressFormTitle = document.getElementById('addressFormTitle');
  const useCurrentLocationBtn = document.getElementById('useCurrentLocationBtn');
  const addressLocationStatus = document.getElementById('addressLocationStatus');
  const addressForm = document.getElementById('addressForm');
  const cancelAddressBtn = document.getElementById('cancelAddressBtn');
  const addressesList = document.getElementById('addressesList');

  // Address Form Inputs
  const addressFormId = document.getElementById('addressFormId');
  const addrFullName = document.getElementById('addrFullName');
  const addrPhone = document.getElementById('addrPhone');
  const addrPincode = document.getElementById('addrPincode');
  const addrLocality = document.getElementById('addrLocality');
  const addrLine1 = document.getElementById('addrLine1');
  const addrLine2 = document.getElementById('addrLine2');
  const addrCity = document.getElementById('addrCity');
  const addrState = document.getElementById('addrState');
  const addrCountry = document.getElementById('addrCountry');
  const addrIsDefault = document.getElementById('addrIsDefault');

  // Address Error Spans
  const addrNameError = document.getElementById('addrNameError');
  const addrPhoneError = document.getElementById('addrPhoneError');
  const addrPincodeError = document.getElementById('addrPincodeError');
  const addrLine1Error = document.getElementById('addrLine1Error');
  const addrCityError = document.getElementById('addrCityError');
  const addrStateError = document.getElementById('addrStateError');

  // Sidebar Logout
  const profileSidebarLogoutBtn = document.getElementById('profileSidebarLogoutBtn');


  // ═════════════════════════════════════════════════════════════════════════
  // 1. GET /api/profile — LOAD AUTHENTICATED USER DATA
  // ═════════════════════════════════════════════════════════════════════════

  let currentUserData = {
    username: '',
    email: '',
    phone_number: '',
    gender: null,
  };

  async function fetchProfileData() {
    try {
      const response = await fetch('/api/profile', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'same-origin', // Sends authToken cookie automatically
      });

      if (response.status === 401) {
        // Unauthenticated / expired session -> redirect to login
        localStorage.setItem(STORAGE_KEY_PENDING, '/profile');
        localStorage.removeItem('authUser');
        showAlert('Your session has expired. Please sign in again.', 'error');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1200);
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to load profile (Status: ${response.status})`);
      }

      const result = await response.json();
      if (result && result.success && result.data) {
        currentUserData = {
          username: result.data.username || '',
          email: result.data.email || '',
          phone_number: result.data.phone_number || '',
          gender: result.data.gender || null,
        };

        // Cache user info in localStorage for other client components
        try {
          localStorage.setItem('authUser', JSON.stringify(result.data));
        } catch (e) { }

        populateProfileUI(currentUserData);
      } else {
        throw new Error(result?.message || 'Could not retrieve profile data');
      }
    } catch (error) {
      console.error('Error fetching profile from /api/profile:', error);

      // Check if we have cached user from previous login
      try {
        const cached = localStorage.getItem('authUser');
        if (cached) {
          const parsed = JSON.parse(cached);
          currentUserData = {
            username: parsed.username || '',
            email: parsed.email || '',
            phone_number: parsed.phone_number || '',
            gender: parsed.gender || null,
          };
          populateProfileUI(currentUserData);
          return;
        }
      } catch (e) { }

      showAlert('Unable to load profile data from server. Please refresh or try again.', 'error');
    }
  }

  function populateProfileUI(data) {
    if (sidebarUserName) {
      sidebarUserName.textContent = data.username ? data.username.toUpperCase() : 'MY ACCOUNT';
    }
    if (profileFullName) {
      profileFullName.value = data.username || '';
      profileFullName.placeholder = 'Enter your full name';
    }
    if (profileEmail) {
      profileEmail.value = data.email || '';
      profileEmail.placeholder = 'Not set';
    }
    if (profilePhone) {
      profilePhone.value = data.phone_number || '';
      profilePhone.placeholder = 'Not set';
    }

    // Gender radio selection
    if (data.gender) {
      const targetGender = String(data.gender).toUpperCase();
      genderRadios.forEach(radio => {
        radio.checked = (radio.value === targetGender);
      });
    }
  }


  // ═════════════════════════════════════════════════════════════════════════
  // 2. TAB SWITCHING (PROFILE INFO vs MANAGE ADDRESSES)
  // ═════════════════════════════════════════════════════════════════════════

  function switchTab(tabKey) {
    const isAddresses = tabKey === 'manage-addresses' || tabKey === 'addresses';

    if (tabBtnProfileInfo) {
      tabBtnProfileInfo.classList.toggle('active', !isAddresses);
      tabBtnProfileInfo.setAttribute('aria-selected', (!isAddresses).toString());
    }
    if (tabBtnManageAddresses) {
      tabBtnManageAddresses.classList.toggle('active', isAddresses);
      tabBtnManageAddresses.setAttribute('aria-selected', isAddresses.toString());
    }

    if (profileInfoSection) {
      if (isAddresses) profileInfoSection.setAttribute('hidden', '');
      else profileInfoSection.removeAttribute('hidden');
    }
    if (manageAddressesSection) {
      if (isAddresses) manageAddressesSection.removeAttribute('hidden');
      else manageAddressesSection.removeAttribute('hidden');
    }

    if (breadcrumbActive) {
      breadcrumbActive.textContent = isAddresses ? 'Manage Addresses' : 'Profile Information';
    }

    // Sync URL hash
    history.replaceState(null, '', isAddresses ? '#addresses' : '#profile');
  }

  tabBtnProfileInfo && tabBtnProfileInfo.addEventListener('click', () => switchTab('profile-info'));
  tabBtnManageAddresses && tabBtnManageAddresses.addEventListener('click', () => switchTab('manage-addresses'));

  // Pre-select tab based on URL hash or search params
  const initialHash = window.location.hash.toLowerCase().replace('#', '');
  const urlParams = new URLSearchParams(window.location.search);
  const tabParam = urlParams.get('tab');

  if (initialHash === 'addresses' || initialHash === 'manage-addresses' || tabParam === 'addresses') {
    switchTab('manage-addresses');
  } else {
    switchTab('profile-info');
  }


  // ═════════════════════════════════════════════════════════════════════════
  // 3. POST /api/profile — FULL NAME UPDATE
  // ═════════════════════════════════════════════════════════════════════════

  let isEditingPersonal = false;
  let savedName = '';
  let savedGender = '';

  function startEditingPersonal() {
    isEditingPersonal = true;
    savedName = profileFullName.value;
    const checkedRadio = document.querySelector('input[name="gender"]:checked');
    savedGender = checkedRadio ? checkedRadio.value : '';

    profileFullName.removeAttribute('disabled');
    profileFullName.focus();
    genderRadios.forEach(r => r.removeAttribute('disabled'));

    personalActions.removeAttribute('hidden');
    editPersonalBtn.textContent = 'Editing…';
    editPersonalBtn.setAttribute('aria-disabled', 'true');
    fullNameError.setAttribute('hidden', '');
  }

  function cancelEditingPersonal() {
    isEditingPersonal = false;
    profileFullName.value = savedName;
    genderRadios.forEach(r => {
      r.checked = (r.value === savedGender);
      r.setAttribute('disabled', '');
    });

    profileFullName.setAttribute('disabled', '');
    personalActions.setAttribute('hidden', '');
    editPersonalBtn.textContent = 'Edit';
    editPersonalBtn.removeAttribute('aria-disabled');
    fullNameError.setAttribute('hidden', '');
  }

  editPersonalBtn && editPersonalBtn.addEventListener('click', () => {
    if (!isEditingPersonal) startEditingPersonal();
    else cancelEditingPersonal();
  });

  cancelPersonalBtn && cancelPersonalBtn.addEventListener('click', cancelEditingPersonal);

  personalInfoForm && personalInfoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newName = profileFullName.value.trim();

    if (!newName || newName.length < 2) {
      fullNameError.removeAttribute('hidden');
      profileFullName.focus();
      return;
    }
    fullNameError.setAttribute('hidden', '');

    // Show loading state & prevent duplicate submits
    const submitBtn = document.getElementById('savePersonalBtn');
    const spinner = submitBtn ? submitBtn.querySelector('.profile-btn-spinner') : null;
    const btnText = submitBtn ? submitBtn.querySelector('.profile-btn-text') : null;

    if (submitBtn) submitBtn.disabled = true;
    if (spinner) spinner.removeAttribute('hidden');
    if (btnText) btnText.textContent = 'Saving…';

    try {
      // Send ONLY username — user identified via req.user in JWT cookie
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'same-origin', // Sends authToken cookie
        body: JSON.stringify({
          username: newName,
        }),
      });

      if (response.status === 401) {
        showAlert('Session expired. Please sign in to update your profile.', 'error');
        setTimeout(() => { window.location.href = '/login'; }, 1200);
        return;
      }

      const result = await response.json();

      if (response.ok && result.success) {
        currentUserData.username = result.data?.username || newName;

        // Update UI
        if (sidebarUserName) {
          sidebarUserName.textContent = currentUserData.username.toUpperCase();
        }
        profileFullName.value = currentUserData.username;

        // Update localStorage authUser cache
        try {
          const cached = localStorage.getItem('authUser');
          const parsed = cached ? JSON.parse(cached) : {};
          parsed.username = currentUserData.username;
          localStorage.setItem('authUser', JSON.stringify(parsed));
        } catch (e) { }

        // Exit edit mode
        isEditingPersonal = false;
        profileFullName.setAttribute('disabled', '');
        genderRadios.forEach(r => r.setAttribute('disabled', ''));
        personalActions.setAttribute('hidden', '');
        editPersonalBtn.textContent = 'Edit';
        editPersonalBtn.removeAttribute('aria-disabled');

        showAlert('Profile updated successfully.', 'success');
      } else {
        const errMsg = result?.message || 'Failed to update profile. Please try again.';
        showAlert(errMsg, 'error');
      }
    } catch (error) {
      console.error('Error in POST /api/profile:', error);
      showAlert('Unable to connect to the server. Please check your network and try again.', 'error');
    } finally {
      if (submitBtn) submitBtn.disabled = false;
      if (spinner) spinner.setAttribute('hidden', '');
      if (btnText) btnText.textContent = 'Save';
    }
  });

  // Read-only handlers for Email & Phone
  [editEmailBtn, editPhoneBtn].forEach(btn => {
    btn && btn.addEventListener('click', () => {
      showAlert('Editing contact details will be enabled in a future update.', 'error');
    });
  });


  // ═════════════════════════════════════════════════════════════════════════
  // 4. MANAGE ADDRESSES UI & LOCAL STORAGE PERSISTENCE
  // ═════════════════════════════════════════════════════════════════════════

  const DEFAULT_ADDRESSES = [
    {
      id: 'addr_1',
      full_name: 'Kishor Gunithi',
      phone_number: '8328179006',
      postal_code: '530001',
      landmark: 'Near RTC Complex',
      address_line_1: 'Flat 402, Sai Residency, Main Road',
      address_line_2: 'Opp. Supermarket',
      city: 'Visakhapatnam',
      state: 'Andhra Pradesh',
      country: 'India',
      address_type: 'HOME',
      is_default: true,
    },
    {
      id: 'addr_2',
      full_name: 'Kishor Gunithi',
      phone_number: '9963657799',
      postal_code: '500081',
      landmark: 'Cyber Towers',
      address_line_1: 'Plot 12, Tech Park, Hitec City',
      address_line_2: '3rd Floor',
      city: 'Hyderabad',
      state: 'Telangana',
      country: 'India',
      address_type: 'WORK',
      is_default: false,
    }
  ];

  function getStoredAddresses() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ADDRESSES);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) { }
    return DEFAULT_ADDRESSES;
  }

  function setStoredAddresses(addrList) {
    try {
      localStorage.setItem(STORAGE_KEY_ADDRESSES, JSON.stringify(addrList));
    } catch (e) { }
  }

  let addresses = getStoredAddresses();

  function renderAddresses() {
    if (!addressesList) return;

    if (!addresses || addresses.length === 0) {
      addressesList.innerHTML = `
        <div class="addresses-empty">
          <div class="addresses-empty__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 21s-8-5.686-8-12a8 8 0 1116 0c0 6.314-8 12-8 12z"/>
              <circle cx="12" cy="9" r="2.5"/>
            </svg>
          </div>
          <h4 class="addresses-empty__title">No Saved Addresses</h4>
          <p class="addresses-empty__desc">Add your home or work delivery address to speed up checkout.</p>
        </div>
      `;
      return;
    }

    addressesList.innerHTML = addresses.map(addr => {
      const typeKey = (addr.address_type || 'HOME').toUpperCase();
      const badgeClass = typeKey === 'WORK' ? 'address-badge--work' : (typeKey === 'OTHER' ? 'address-badge--other' : 'address-badge--home');
      const isDefault = Boolean(addr.is_default);

      return `
        <div class="address-card ${isDefault ? 'address-card--default' : ''}" data-id="${addr.id}">
          <div class="address-card__header">
            <div class="address-card__badges">
              <span class="address-badge ${badgeClass}">${typeKey}</span>
              ${isDefault ? '<span class="address-badge address-badge--default">DEFAULT</span>' : ''}
            </div>
            <div class="address-card__actions">
              ${!isDefault ? `<button type="button" class="address-card-btn address-card-btn--default" data-action="set-default" data-id="${addr.id}">Set as Default</button>` : ''}
              <button type="button" class="address-card-btn" data-action="edit" data-id="${addr.id}" aria-label="Edit address for ${escapeHtml(addr.full_name)}">Edit</button>
              <button type="button" class="address-card-btn address-card-btn--delete" data-action="delete" data-id="${addr.id}" aria-label="Delete address for ${escapeHtml(addr.full_name)}">Delete</button>
            </div>
          </div>

          <div class="address-card__recipient">
            <h4 class="address-card__name">${escapeHtml(addr.full_name)}</h4>
            <span class="address-card__phone">${escapeHtml(addr.phone_number)}</span>
          </div>

          <p class="address-card__address-text">
            ${escapeHtml(addr.address_line_1)}${addr.address_line_2 ? ', ' + escapeHtml(addr.address_line_2) : ''}${addr.landmark ? ', ' + escapeHtml(addr.landmark) : ''},
            ${escapeHtml(addr.city)}, ${escapeHtml(addr.state)} — <strong>${escapeHtml(addr.postal_code)}</strong>
          </p>
        </div>
      `;
    }).join('');
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

  function openAddressForm(addr = null) {
    if (!addressFormPanel || !addAddressTriggerCard) return;

    clearAddressErrors();
    clearLocationStatus();
    addressForm.reset();

    if (addr) {
      addressFormTitle.textContent = 'EDIT ADDRESS';
      addressFormId.value = addr.id || '';
      addrFullName.value = addr.full_name || '';
      addrPhone.value = addr.phone_number || '';
      addrPincode.value = addr.postal_code || '';
      addrLocality.value = addr.landmark || '';
      addrLine1.value = addr.address_line_1 || '';
      addrLine2.value = addr.address_line_2 || '';
      addrCity.value = addr.city || '';
      addrState.value = addr.state || '';
      addrCountry.value = addr.country || 'India';
      addrIsDefault.checked = Boolean(addr.is_default);

      const targetType = (addr.address_type || 'HOME').toUpperCase();
      const typeRadio = addressForm.querySelector(`input[name="address_type"][value="${targetType}"]`);
      if (typeRadio) typeRadio.checked = true;
    } else {
      addressFormTitle.textContent = 'ADD A NEW ADDRESS';
      addressFormId.value = '';
      addrCountry.value = 'India';
      addrIsDefault.checked = (addresses.length === 0);
    }

    addAddressTriggerCard.setAttribute('hidden', '');
    addressFormPanel.removeAttribute('hidden');
    addrFullName.focus();
  }

  function closeAddressForm() {
    if (!addressFormPanel || !addAddressTriggerCard) return;
    addressFormPanel.setAttribute('hidden', '');
    addAddressTriggerCard.removeAttribute('hidden');
    clearAddressErrors();
    clearLocationStatus();
    addressForm.reset();
  }

  function setLocationStatus(message, type = '') {
    if (!addressLocationStatus) return;
    addressLocationStatus.textContent = message;
    addressLocationStatus.classList.toggle('address-location-status--error', type === 'error');
    if (message) addressLocationStatus.removeAttribute('hidden');
    else addressLocationStatus.setAttribute('hidden', '');
  }

  function clearLocationStatus() {
    setLocationStatus('');
  }

  function getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Location is not supported by this browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      });
    });
  }

  async function useCurrentLocation() {
    if (!useCurrentLocationBtn) return;

    useCurrentLocationBtn.disabled = true;
    setLocationStatus('Getting your current location...');

    try {
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}&addressdetails=1&accept-language=en`, {
        headers: { 'Accept': 'application/json' },
      });

      if (!response.ok) throw new Error('Unable to find the address for this location.');
      const result = await response.json();
      const address = result.address || {};

      // Build a smart Address Line 1 from available local components
      const localParts = [
        address.house_number,
        address.building,
        address.road,
        address.pedestrian,
        address.neighbourhood || address.residential,
        address.suburb,
        address.hamlet
      ].filter(Boolean);

      // Deduplicate parts to avoid repetitive address lines
      const uniqueLocalParts = [...new Set(localParts)];

      let finalAddressLine = uniqueLocalParts.join(', ');

      // If we couldn't build a good address line, fall back to display name up to the city
      if (!finalAddressLine || finalAddressLine.length < 5) {
        const parts = (result.display_name || '').split(',').map(s => s.trim());
        // usually the last 3-4 parts are city, state, postcode, country
        finalAddressLine = parts.slice(0, Math.max(1, parts.length - 4)).join(', ');
      }

      addrLine1.value = finalAddressLine || result.display_name || '';
      addrLocality.value = address.suburb || address.neighbourhood || address.residential || address.city_district || '';
      addrCity.value = address.city || address.town || address.village || address.county || address.state_district || '';

      const matchingState = Array.from(addrState.options).find(option => option.value.toLowerCase() === (address.state || '').toLowerCase());
      addrState.value = matchingState ? matchingState.value : '';
      addrCountry.value = address.country || 'India';

      // Attempt to extract pincode from address.postcode OR display_name fallback
      let postalCode = address.postcode || '';
      if (!postalCode && result.display_name) {
        const pinMatch = result.display_name.match(/\b\d{6}\b/);
        if (pinMatch) postalCode = pinMatch[0];
      }
      addrPincode.value = postalCode;

      setLocationStatus('Location added. Please review the details before saving.');
    } catch (error) {
      const message = error.code === 1
        ? 'Location permission was denied. Please allow access and try again.'
        : (error.message || 'Unable to use your current location.');
      setLocationStatus(message, 'error');
    } finally {
      useCurrentLocationBtn.disabled = false;
    }
  }

  function clearAddressErrors() {
    [addrNameError, addrPhoneError, addrPincodeError, addrLine1Error, addrCityError, addrStateError].forEach(el => {
      el && el.setAttribute('hidden', '');
    });
  }

  openAddAddressBtn && openAddAddressBtn.addEventListener('click', () => openAddressForm(null));
  cancelAddressBtn && cancelAddressBtn.addEventListener('click', closeAddressForm);
  useCurrentLocationBtn && useCurrentLocationBtn.addEventListener('click', useCurrentLocation);

  addressForm && addressForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAddressErrors();

    const id = addressFormId.value.trim();
    const fullName = addrFullName.value.trim();
    const phone = addrPhone.value.trim();
    const pin = addrPincode.value.trim();
    const locality = addrLocality.value.trim();
    const line1 = addrLine1.value.trim();
    const line2 = addrLine2.value.trim();
    const city = addrCity.value.trim();
    const state = addrState.value;
    const country = addrCountry.value.trim() || 'India';
    const isDefault = addrIsDefault.checked;
    const typeRadio = addressForm.querySelector('input[name="address_type"]:checked');
    const addressType = typeRadio ? typeRadio.value : 'HOME';

    let valid = true;

    if (!fullName || fullName.length < 2) {
      addrNameError.removeAttribute('hidden');
      valid = false;
    }
    if (!phone || !/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
      addrPhoneError.removeAttribute('hidden');
      valid = false;
    }
    if (!pin || !/^\d{6}$/.test(pin.trim())) {
      addrPincodeError.removeAttribute('hidden');
      valid = false;
    }
    if (!line1 || line1.length < 5) {
      addrLine1Error.removeAttribute('hidden');
      valid = false;
    }
    if (!city || city.length < 2) {
      addrCityError.removeAttribute('hidden');
      valid = false;
    }
    if (!state) {
      addrStateError.removeAttribute('hidden');
      valid = false;
    }

    if (!valid) return;

    const payload = {
      full_name: fullName,
      phone_number: phone,
      postal_code: pin,
      landmark: locality,
      address_line_1: line1,
      address_line_2: line2,
      city: city,
      state: state,
      country: country,
      address_type: addressType,
      is_default: isDefault,
    };

    const isEdit = Boolean(id);
    const submitBtn = document.getElementById('saveAddressBtn');
    const spinner = submitBtn ? submitBtn.querySelector('.profile-btn-spinner') : null;
    const btnText = submitBtn ? submitBtn.querySelector('.profile-btn-text') : null;

    if (submitBtn) submitBtn.disabled = true;
    if (spinner) spinner.removeAttribute('hidden');
    if (btnText) btnText.textContent = 'SAVING...';

    try {
      if (isEdit) {
        const response = await fetch(`/api/profile/address/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'same-origin',
          body: JSON.stringify(payload),
        });

        if (response.status === 401) {
          showAlert('Session expired. Please sign in to update an address.', 'error');
          setTimeout(() => { window.location.href = '/login'; }, 1200);
          return;
        }

        const result = await response.json();
        if (response.ok && result.success) {
          addresses = addresses.map(a => {
            if (a.id === id) return { ...a, ...payload, id };
            return a;
          });
          if (isDefault) {
            addresses.forEach(a => { a.is_default = (a.id === id); });
          }
          setStoredAddresses(addresses);
          renderAddresses();
          closeAddressForm();
          showRightToast('Address Updated Successfully!');
        } else {
          showRightToast(result?.message || 'Failed to update address.', 'error');
        }
      } else {
        const response = await fetch('/api/profile/address', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'same-origin',
          body: JSON.stringify(payload),
        });

        if (response.status === 401) {
          showAlert('Session expired. Please sign in to add an address.', 'error');
          setTimeout(() => { window.location.href = '/login'; }, 1200);
          return;
        }

        const result = await response.json();
        if (response.ok && result.success) {
          const newAddr = result.data;
          addresses.unshift(newAddr);
          if (isDefault) {
            addresses.forEach(a => { a.is_default = (a.id === newAddr.id); });
          }
          setStoredAddresses(addresses);
          renderAddresses();
          closeAddressForm();
          showRightToast('Address Added Successfully!');
        } else {
          showAlert(result?.message || 'Failed to add address.', 'error');
        }
      }
    } catch (error) {
      console.error('Error saving address:', error);
      showAlert('Unable to connect to the server.', 'error');
    } finally {
      if (submitBtn) submitBtn.disabled = false;
      if (spinner) spinner.setAttribute('hidden', '');
      if (btnText) btnText.textContent = 'SAVE ADDRESS';
    }
  });

  addressesList && addressesList.addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;

    const action = btn.dataset.action;
    const id = btn.dataset.id;
    const targetAddr = addresses.find(a => a.id === id);
    if (!targetAddr) return;

    if (action === 'edit') {
      openAddressForm(targetAddr);
      window.scrollTo({ top: addressFormPanel.offsetTop - 80, behavior: 'smooth' });
    } else if (action === 'delete') {
      const confirmed = window.confirm(`Are you sure you want to delete the address for ${targetAddr.full_name}?`);
      if (!confirmed) return;

      const btnText = btn.textContent;
      btn.textContent = '...';
      btn.disabled = true;

      try {
        const response = await fetch(`/api/profile/address/${id}`, {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json',
          },
          credentials: 'same-origin',
        });

        if (response.status === 401) {
          showAlert('Session expired. Please sign in again.', 'error');
          setTimeout(() => { window.location.href = '/login'; }, 1200);
          return;
        }

        const result = await response.json();
        if (response.ok && result.success) {
          const wasDefault = Boolean(targetAddr.is_default);
          addresses = addresses.filter(a => a.id !== id);

          if (wasDefault && addresses.length > 0) {
            addresses[0].is_default = true;
          }

          setStoredAddresses(addresses);
          renderAddresses();
          showAlert('Address deleted successfully.', 'success');
        } else {
          showAlert(result?.message || 'Failed to delete address.', 'error');
          btn.textContent = btnText;
          btn.disabled = false;
        }
      } catch (error) {
        console.error('Error deleting address:', error);
        showAlert('Unable to connect to the server.', 'error');
        btn.textContent = btnText;
        btn.disabled = false;
      }
    } else if (action === 'set-default') {
      addresses.forEach(a => { a.is_default = (a.id === id); });
      setStoredAddresses(addresses);
      renderAddresses();
      showAlert('Default delivery address updated.', 'success');
    }
  });


  // ═════════════════════════════════════════════════════════════════════════
  // 5. SIDEBAR LOGOUT
  // ═════════════════════════════════════════════════════════════════════════

  profileSidebarLogoutBtn && profileSidebarLogoutBtn.addEventListener('click', function () {
    fetch('/logout', { method: 'POST', credentials: 'same-origin' })
      .finally(function () {
        localStorage.removeItem('authUser');
        localStorage.removeItem(STORAGE_KEY_PENDING);
        window.location.href = '/';
      });
  });

  async function fetchAddresses() {
    try {
      const response = await fetch('/api/profile/addresses', {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        credentials: 'same-origin',
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          addresses = result.data;
          setStoredAddresses(addresses);
          renderAddresses();
          return;
        }
      }
    } catch (e) {
      console.error('Error fetching addresses from server:', e);
    }

    // Fallback to local storage if API fails
    addresses = getStoredAddresses();
    renderAddresses();
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 6. INITIALIZE
  // ═════════════════════════════════════════════════════════════════════════

  fetchProfileData();
  fetchAddresses();

})();
