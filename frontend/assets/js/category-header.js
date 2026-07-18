/**
 * category-header.js — Category page header behavior.
 * Handles: scroll shadow, search suggestions, cat-strip sync.
 */

(function () {
  'use strict';

  const hdr      = document.getElementById('categoryHeader');
  const catStrip = document.getElementById('catStripPage');
  const input    = document.getElementById('catSearchInput');
  const suggestions = document.getElementById('catSuggestions');
  const form     = document.getElementById('catSearchForm');

  // ─── Scroll shadow ────────────────────────────────────────────────────────
  function syncShadow() {
    if (!hdr) return;
    hdr.classList.toggle('scrolled', window.scrollY > 4);
  }

  // ─── Cat-strip top = header height ────────────────────────────────────────
  function syncStripTop() {
    if (!hdr || !catStrip) return;
    const h = Math.round(hdr.getBoundingClientRect().height);
    catStrip.style.top = h + 'px';
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

  // ─── Scroll active scroll-to: highlight active strip item ─────────────────
  // On the category page the active item is set server-side.
  // But we also need to scroll the active pill into view on mobile.
  function scrollActivePillIntoView() {
    if (!catStrip) return;
    const activeItem = catStrip.querySelector('.cat-strip__item--active');
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
