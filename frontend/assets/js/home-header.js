/**
 * home-header.js — Sticky header interactions for the Home page.
 * Handles: scroll shadow, search suggestions, category strip active state.
 */

(function () {
  'use strict';

  const hdr      = document.getElementById('homeHeader');
  const catStrip = document.getElementById('catStrip');
  const input    = document.getElementById('hdrSearchInput');
  const suggestions = document.getElementById('hdrSuggestions');
  const form     = document.getElementById('hdrSearchForm');
  const locBtn   = document.getElementById('hdrLocation');

  // ─── Header scroll shadow ─────────────────────────────────────────────────
  function syncHeaderShadow() {
    if (!hdr) return;
    hdr.classList.toggle('scrolled', window.scrollY > 4);
  }

  // ─── Cat-strip top = actual header rendered height ───────────────────────
  function syncStripTop() {
    if (!hdr || !catStrip) return;
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
    // Offset = header height (row1 + row2) + strip height + a small buffer
    const headerH  = hdr  ? hdr.getBoundingClientRect().height  : 0;
    const stripH   = catStrip ? catStrip.getBoundingClientRect().height : 0;
    const offset   = headerH + stripH + 20;

    const scrollY  = window.scrollY + offset;
    const sections = Array.from(document.querySelectorAll('[data-section]'));

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
        return href === '/home';
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
    form && form.addEventListener('submit', hideSuggestions);
  }

  // ─── Location button ─────────────────────────────────────────────────────
  if (locBtn) {
    locBtn.addEventListener('click', () => {
      window.location.href = '/profile/addresses';
    });

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
          
          if (locFull && displayText) locFull.textContent = displayText;
          if (locShort && address.city) locShort.textContent = `📍 ${address.city}`;
        }
      })
      .catch(err => console.error("Error fetching location:", err));
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

})();
