/**
 * home-header.js — Sticky header interactions for the Home page.
 * Handles: scroll shadow, search suggestions, category strip active state.
 */

(function () {
  'use strict';

  if (document.body && document.body.classList.contains('home-page')) {
    document.documentElement.style.overflowX = 'clip';
  }

  const hdr      = document.getElementById('homeHeader');
  const catStrip = document.getElementById('catStrip') || document.getElementById('catStripPage');
  const input    = document.getElementById('hdrSearchInput');
  const suggestions = document.getElementById('hdrSuggestions');
  const form     = document.getElementById('hdrSearchForm');
  const locBtn   = document.getElementById('hdrLocation');

  // ─── Header scroll shadow ─────────────────────────────────────────────────
  function syncHeaderShadow() {
    if (!hdr) return;
    hdr.classList.toggle('scrolled', window.scrollY > 4);
  }

  // ─── Cat-strip top = actual header rendered height (desktop only) ─────────
  function syncStripTop() {
    if (!hdr || !catStrip) return;
    if (window.innerWidth <= 768) {
      catStrip.style.top = '';
      return;
    }
    // Use getBoundingClientRect so it works regardless of row count
    catStrip.style.top = Math.round(hdr.getBoundingClientRect().height) + 'px';
  }

  // ─── Category strip active state on scroll ────────────────────────────────
  const catLinks = document.querySelectorAll('.cat-strip__item');

  // Maps data-section value → the URL slug used in the cat-strip href
  const KEY_TO_SLUG = {
    trending:      null,           // "trending" has no cat-strip entry → fall through to "All"
    mobiles:       'mobiles',
    tvs:           'tvs',
    acs:           'acs',
    homeTheatres:  'home-theatres',
    kitchen:       'kitchen',
    refrigerators: 'refrigerators',
  };

  function setActive(linkEl) {
    catLinks.forEach(l => {
      l.classList.remove('active', 'cat-strip__item--active');
      l.removeAttribute('aria-current');
    });
    if (linkEl) {
      linkEl.classList.add('active');
      linkEl.setAttribute('aria-current', 'true');
    }
  }

  function syncCatStrip() {
    const sections = Array.from(document.querySelectorAll('[data-section]'));
    if (!sections.length) return; // Keep server-rendered active tab on category pages

    // Offset = header height (row1 + row2) + strip height + a small buffer
    const headerH  = hdr  ? hdr.getBoundingClientRect().height  : 0;
    const stripH   = catStrip ? catStrip.getBoundingClientRect().height : 0;
    const offset   = headerH + stripH + 20;

    const scrollY  = window.scrollY + offset;

    // Find the last section whose top is at or above the scroll position
    let activeKey = '';
    sections.forEach(sec => {
      if (sec.offsetTop <= scrollY) activeKey = sec.dataset.section;
    });

    // Map the activeKey to a URL slug
    const targetSlug = KEY_TO_SLUG[activeKey]; // undefined if key not in map, null for trending

    // Find the matching cat-strip link
    let matchedLink = null;

    if (!activeKey || targetSlug === null) {
      // Above all sections, or in "trending" → highlight "All" (href: /home)
      matchedLink = Array.from(catLinks).find(l => {
        const href = l.getAttribute('href') || '';
        return href === '/home' || href === '/products';
      });
    } else if (targetSlug) {
      matchedLink = Array.from(catLinks).find(l => {
        const href = l.getAttribute('href') || '';
        // Match exact slug at end of href, e.g. "/products/mobiles" → "mobiles"
        return href.split('/').pop() === targetSlug;
      });
    }

    setActive(matchedLink || null);
  }

  function scrollActivePillIntoView() {
    if (!catStrip) return;
    const activeItem = catStrip.querySelector('.cat-strip__item--active, .cat-strip__item.active');
    if (activeItem) {
      activeItem.scrollIntoView({ inline: 'center', behavior: 'smooth', block: 'nearest' });
    }
  }

  // ─── Search suggestions ───────────────────────────────────────────────────
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
    // Sync query string from URL if present
    try {
      const qParam = new URLSearchParams(window.location.search).get('q');
      if (qParam && !input.value) {
        input.value = qParam;
      }
    } catch (_) {}

    input.addEventListener('focus', showSuggestions);
    input.addEventListener('input', () => {
      input.value.trim().length > 0 ? showSuggestions() : hideSuggestions();
    });
    input.addEventListener('keydown', e => {
      if (e.key === 'Escape') { hideSuggestions(); input.blur(); }
    });
    document.addEventListener('click', e => {
      if (form && !form.contains(e.target)) hideSuggestions();
    });
    form && form.addEventListener('submit', (e) => {
      hideSuggestions();
      const val = (input.value || '').trim();
      if (!val) {
        e.preventDefault();
        window.location.href = '/products';
      }
    });
  }

  // ─── Location button (desktop & mobile) ─────────────────────────────────
  const mobileLocBtn = document.getElementById('hdrMobileLocation');
  const goToAddresses = () => { window.location.href = '/profile#addresses'; };

  if (locBtn) locBtn.addEventListener('click', goToAddresses);
  if (mobileLocBtn) mobileLocBtn.addEventListener('click', goToAddresses);

  // Fetch user's address to display
  fetch('/api/profile/addresses')
    .then(res => res.json())
    .then(data => {
      if (data.success && data.data && data.data.length > 0) {
        const address = data.data.find(a => a.is_default) || data.data[0];
        
        // Format as City, Postal Code or Address Line 1
        const displayText = address.city ? `${address.city}, ${address.postal_code || ''}`.replace(/,\s*$/, '') : address.address_line_1;
        
        const locFull = document.querySelector('.hdr__loc-full');
        const locShort = document.querySelector('.hdr__loc-short');
        const locMobileCity = document.getElementById('hdrMobileLocCity');
        
        if (locFull && displayText) locFull.textContent = displayText;
        if (locShort && address.city) locShort.textContent = `📍 ${address.city}`;

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
    .catch(err => console.error("Error fetching location:", err));

  // ─── Cart badge sync ──────────────────────────────────────────────────────
  function syncHomeCartBadge() {
    fetch('/api/cart')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          const count = data.data.items?.length || data.data.itemCount || 0;
          const badge = document.getElementById('hdrCartBadge');
          if (badge) {
            badge.textContent = count > 99 ? '99+' : count;
            badge.style.display = count > 0 ? 'inline-flex' : 'none';
          }
        }
      })
      .catch(() => {});
  }

  // ─── Bind scroll / resize ─────────────────────────────────────────────────
  window.addEventListener('scroll', () => {
    syncHeaderShadow();
    syncCatStrip();
  }, { passive: true });

  window.addEventListener('resize', syncStripTop, { passive: true });

  // ─── Init ─────────────────────────────────────────────────────────────────
  syncHeaderShadow();
  syncStripTop();
  syncCatStrip();
  scrollActivePillIntoView();
  syncHomeCartBadge();

})();
