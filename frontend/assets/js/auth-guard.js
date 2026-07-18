/**
 * auth-guard.js — Enterprise Store Login Required Modal
 *
 * Public API (attach to window for global access):
 *   showLoginRequiredModal(targetRoute?: string) — opens the modal
 *   closeLoginRequiredModal()                    — closes the modal
 *
 * Usage on any restricted button:
 *   <button onclick="showLoginRequiredModal('/products/mobiles')">Buy Now</button>
 *   — or in JS:
 *   element.addEventListener('click', () => showLoginRequiredModal('/checkout'))
 *
 * Route memory:
 *   The intended route is saved to localStorage as 'pendingRoute'.
 *   After backend integration, read it post-login and redirect:
 *     const next = localStorage.getItem('pendingRoute');
 *     if (next) { localStorage.removeItem('pendingRoute'); redirect(next); }
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'pendingRoute';

  // ─── DOM refs ──────────────────────────────────────────────────────────────
  const backdrop   = document.getElementById('authModalBackdrop');
  const closeBtn   = document.getElementById('authModalClose');
  const browseBtn  = document.getElementById('authModalBrowse');
  const loginBtn   = document.getElementById('authModalLogin');
  const signupBtn  = document.getElementById('authModalSignup');

  if (!backdrop) return; // modal partial not included on this page

  // ─── Open ──────────────────────────────────────────────────────────────────
  function openModal(targetRoute) {
    // Store the intended destination for post-login redirect
    if (targetRoute) {
      localStorage.setItem(STORAGE_KEY, targetRoute);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }

    backdrop.setAttribute('aria-hidden', 'false');
    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Move focus into modal for accessibility
    requestAnimationFrame(() => {
      loginBtn && loginBtn.focus();
    });
  }

  // ─── Close ─────────────────────────────────────────────────────────────────
  function closeModal() {
    backdrop.classList.remove('open');
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // ─── Click outside backdrop ────────────────────────────────────────────────
  backdrop.addEventListener('click', (e) => {
    // Only close when clicking the backdrop itself, not the modal panel
    if (e.target === backdrop) closeModal();
  });

  // ─── ESC key ──────────────────────────────────────────────────────────────
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && backdrop.classList.contains('open')) {
      closeModal();
    }
  });

  // ─── Close button ──────────────────────────────────────────────────────────
  closeBtn  && closeBtn.addEventListener('click', closeModal);
  browseBtn && browseBtn.addEventListener('click', closeModal);

  // ─── Focus trap ───────────────────────────────────────────────────────────
  // Keep Tab / Shift+Tab cycling within the modal while open
  const modal = document.getElementById('authModal');
  if (modal) {
    modal.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const focusable = Array.from(
        modal.querySelectorAll(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );
      if (!focusable.length) return;

      const first = focusable[0];
      const last  = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }

  // ─── Expose global API ────────────────────────────────────────────────────
  window.showLoginRequiredModal  = openModal;
  window.closeLoginRequiredModal = closeModal;

})();
