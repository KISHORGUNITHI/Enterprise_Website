/**
 * category-header.js — Category page header behavior.
 * Handles: scroll shadow, desktop & mobile search, mobile location sync, cat-strip sync.
 */

(function () {
  'use strict';

  const hdr      = document.getElementById('categoryHeader');
  const catStrip = document.getElementById('catStripPage') || document.getElementById('catStrip');

  // ─── Scroll shadow ────────────────────────────────────────────────────────
  function syncShadow() {
    if (!hdr) return;
    hdr.classList.toggle('scrolled', window.scrollY > 4);
  }

  // ─── Cat-strip top = header height ────────────────────────────────────────
  function syncStripTop() {
    if (!hdr || !catStrip) return;
    if (window.innerWidth <= 768) {
      catStrip.style.top = '';
      return;
    }
    const h = Math.round(hdr.getBoundingClientRect().height);
    catStrip.style.top = (h || 72) + 'px';
  }

  // ─── Search handling (Desktop & Mobile) ────────────────────────────────────
  const forms  = document.querySelectorAll('.catSearchForm');
  const inputs = document.querySelectorAll('.catSearchInput');

  // Sync current query from URL
  try {
    const qParam = new URLSearchParams(window.location.search).get('q');
    if (qParam) {
      inputs.forEach(inp => {
        if (!inp.value) inp.value = qParam;
      });
    }
  } catch (_) {}

  // Wire up suggestions and submit for each search form
  forms.forEach(form => {
    const input = form.querySelector('.catSearchInput');
    const suggestions = form.querySelector('.hdr__suggestions');

    function showSuggestions() {
      if (!suggestions) return;
      suggestions.removeAttribute('hidden');
      input && input.setAttribute('aria-expanded', 'true');
    }

    function hideSuggestions() {
      if (!suggestions) return;
      suggestions.setAttribute('hidden', '');
      input && input.setAttribute('aria-expanded', 'false');
    }

    if (input && suggestions) {
      input.addEventListener('focus', showSuggestions);
      input.addEventListener('input', () => {
        input.value.trim().length > 0 ? showSuggestions() : hideSuggestions();
      });
      input.addEventListener('keydown', e => {
        if (e.key === 'Escape') { hideSuggestions(); input.blur(); }
      });
      document.addEventListener('click', e => {
        if (!form.contains(e.target)) hideSuggestions();
      });
    }

    form.addEventListener('submit', (e) => {
      hideSuggestions();
      const val = (input?.value || '').trim();
      if (!val) {
        e.preventDefault();
        window.location.href = '/products';
      }
    });
  });

  // ─── Location buttons (Desktop & Mobile) ──────────────────────────────────
  const mobileLocBtn = document.getElementById('catMobileLocation');
  const desktopLocBtn = document.getElementById('catHdrLocation');

  function handleLocClick() {
    if (window.location.pathname === '/checkout') {
      const changeBtn = document.getElementById('openChangeAddressBtn');
      const addBtn = document.getElementById('noAddrAddBtn');
      if (changeBtn && !changeBtn.hasAttribute('hidden')) {
        changeBtn.click();
      } else if (addBtn) {
        addBtn.click();
      } else {
        const modal = document.getElementById('addressModalBackdrop');
        if (modal) modal.removeAttribute('hidden');
      }
      return;
    }
    window.location.href = '/profile#addresses';
  }

  if (mobileLocBtn) mobileLocBtn.addEventListener('click', handleLocClick);
  if (desktopLocBtn) desktopLocBtn.addEventListener('click', handleLocClick);

  function applyHeaderLocationText(text) {
    if (!text) return;
    const locMobileCity = document.getElementById('catMobileLocCity');
    if (locMobileCity) locMobileCity.textContent = text;
    const catHdrLocFull = document.getElementById('catHdrLocFull');
    if (catHdrLocFull) catHdrLocFull.textContent = text;
    const locFull = document.querySelector('.hdr__loc-full');
    if (locFull) locFull.textContent = text;
  }

  // 1. Immediately read cached location from localStorage
  try {
    const cachedLoc = localStorage.getItem('ks_user_location');
    if (cachedLoc) {
      const parsed = JSON.parse(cachedLoc);
      if (parsed && parsed.text) {
        applyHeaderLocationText(parsed.text);
      }
    } else {
      const storedAddrs = localStorage.getItem('userAddresses');
      if (storedAddrs) {
        const list = JSON.parse(storedAddrs);
        if (Array.isArray(list) && list.length > 0) {
          const a = list.find(x => x.is_default) || list[0];
          const name = a.city || a.address_line_1 || '';
          const pin = a.postal_code || a.pincode || '';
          const display = (name && pin) ? `${name} (${pin})` : (name || pin || 'Select Location');
          applyHeaderLocationText(display);
        }
      }
    }
  } catch (_) {}

  // 2. Fetch authenticated address from server to update & sync
  const authHeaders = { 'Accept': 'application/json' };
  const token = localStorage.getItem('authToken');
  if (token) authHeaders['Authorization'] = `Bearer ${token}`;

  fetch('/api/profile/addresses', {
    headers: authHeaders,
    credentials: 'same-origin',
  })
    .then(res => res.json())
    .then(data => {
      if (data.success && data.data && data.data.length > 0) {
        const address = data.data.find(a => a.is_default) || data.data[0];
        const placeName = address.city || address.address_line_1 || '';
        const pincode = address.postal_code || address.pincode || '';
        let locText = placeName;
        if (placeName && pincode) {
          locText = `${placeName} (${pincode})`;
        } else if (pincode) {
          locText = pincode;
        }

        if (locText) {
          applyHeaderLocationText(locText);
          try {
            localStorage.setItem('ks_user_location', JSON.stringify({
              city: address.city || '',
              postal_code: address.postal_code || '',
              text: locText
            }));
          } catch (_) {}
        }
      }
    })
    .catch(() => {});

  // ─── Cart badge sync ──────────────────────────────────────────────────────
  fetch('/api/cart')
    .then(res => res.json())
    .then(data => {
      if (data.success && data.data) {
        const count = data.data.items?.length || data.data.itemCount || 0;
        const badge = document.getElementById('catHdrCartBadge');
        if (badge) {
          badge.textContent = count > 99 ? '99+' : count;
          badge.style.display = count > 0 ? 'inline-flex' : 'none';
        }
        const hdrBadge = document.getElementById('hdrCartBadge');
        if (hdrBadge) {
          hdrBadge.textContent = count > 99 ? '99+' : count;
          hdrBadge.style.display = count > 0 ? 'inline-flex' : 'none';
        }
      }
    })
    .catch(() => {});

  // ─── Scroll active pill into view on mobile ───────────────────────────────
  function scrollActivePillIntoView() {
    if (!catStrip) return;
    const activeItem = catStrip.querySelector('.cat-strip__item--active, .cat-strip__item.active');
    if (activeItem) {
      activeItem.scrollIntoView({ inline: 'center', behavior: 'smooth', block: 'nearest' });
    }
  }

  // ─── Bind events ──────────────────────────────────────────────────────────
  window.addEventListener('scroll', syncShadow, { passive: true });
  window.addEventListener('resize', syncStripTop, { passive: true });

  // ─── Init ─────────────────────────────────────────────────────────────────
  syncShadow();
  syncStripTop();
  scrollActivePillIntoView();

})();
