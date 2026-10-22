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

  // ─── Mobile Location button ───────────────────────────────────────────────
  const mobileLocBtn = document.getElementById('catMobileLocation');
  if (mobileLocBtn) {
    mobileLocBtn.addEventListener('click', () => {
      window.location.href = '/profile#addresses';
    });
  }

  // Fetch address to display in mobile location bar
  fetch('/api/profile/addresses')
    .then(res => res.json())
    .then(data => {
      if (data.success && data.data && data.data.length > 0) {
        const address = data.data.find(a => a.is_default) || data.data[0];
        const locMobileCity = document.getElementById('catMobileLocCity');
        if (locMobileCity) {
          const placeName = address.city || address.address_line_1 || '';
          const pincode = address.postal_code || address.pincode || '';
          if (placeName && pincode) {
            locMobileCity.textContent = `${placeName} (${pincode})`;
          } else if (placeName) {
            locMobileCity.textContent = placeName;
          } else if (pincode) {
            locMobileCity.textContent = pincode;
          }
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
