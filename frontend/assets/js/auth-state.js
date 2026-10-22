/**
 * auth-state.js — Universal Real-time Authentication Sync & BFCache Handler
 * Enterprise Store
 *
 * Ensures:
 * 1. Instant in-place UI updates upon logout (replaces Logout button with Login without page refresh).
 * 2. Perfect back/forward history navigation consistency (BFCache pageshow listener).
 * 3. Cross-tab synchronization via Storage & VisibilityChange APIs.
 * 4. Protected page enforcement on back-navigation.
 */

(function () {
  'use strict';

  // ─── 1. Core UI Updater ──────────────────────────────────────────────────
  function updateAuthUI(isAuth, isAdmin) {
    // ── Desktop & Mobile Home Header (home-header.ejs) ──
    var hdrLogout = document.getElementById('hdrLogoutBtn');
    var hdrLogin = document.getElementById('hdrLoginBtn');
    var hdrMobLogout = document.getElementById('hdrMobileLogoutBtn');
    var hdrMobLogin = document.getElementById('hdrMobileLoginBtn');
    var hdrAdmin = document.getElementById('hdrAdminBtn');

    if (hdrLogout) hdrLogout.style.display = isAuth ? 'flex' : 'none';
    if (hdrLogin) hdrLogin.style.display = isAuth ? 'none' : 'flex';
    if (hdrMobLogout) hdrMobLogout.style.display = isAuth ? 'inline-flex' : 'none';
    if (hdrMobLogin) hdrMobLogin.style.display = isAuth ? 'none' : 'inline-flex';
    if (hdrAdmin) hdrAdmin.style.display = (isAuth && isAdmin) ? 'flex' : 'none';

    // ── Desktop & Mobile Category Header (category-header.ejs) ──
    var catLogout = document.getElementById('catHdrLogoutBtn');
    var catLogin = document.getElementById('catHdrLoginBtn');
    var catMobLogout = document.getElementById('catMobileLogoutBtn');
    var catMobLogin = document.getElementById('catMobileLoginBtn');
    var catAdmin = document.getElementById('catHdrAdminBtn');

    if (catLogout) catLogout.style.display = isAuth ? 'flex' : 'none';
    if (catLogin) catLogin.style.display = isAuth ? 'none' : 'flex';
    if (catMobLogout) catMobLogout.style.display = isAuth ? 'inline-flex' : 'none';
    if (catMobLogin) catMobLogin.style.display = isAuth ? 'none' : 'inline-flex';
    if (catAdmin) catAdmin.style.display = (isAuth && isAdmin) ? 'flex' : 'none';

    // ── Landing Navbar (navbar.ejs) ──
    var navLogin = document.getElementById('navbarLoginBtn');
    var navProfile = document.getElementById('navProfileBtn');
    var navLogout = document.getElementById('navLogoutBtn');
    var navAdmin = document.getElementById('navAdminBtn');
    var navMobLogin = document.getElementById('navMobileLoginBtn');
    var navMobProfile = document.getElementById('navMobileProfileBtn');

    if (navLogin) navLogin.style.display = isAuth ? 'none' : 'inline-flex';
    if (navProfile) navProfile.style.display = isAuth ? 'inline-flex' : 'none';
    if (navLogout) navLogout.style.display = isAuth ? 'inline-flex' : 'none';
    if (navAdmin) navAdmin.style.display = (isAuth && isAdmin) ? 'inline-flex' : 'none';
    if (navMobLogin) navMobLogin.style.display = isAuth ? 'none' : 'block';
    if (navMobProfile) navMobProfile.style.display = isAuth ? 'block' : 'none';

    // ── Landing Mobile Bottom Bar ──
    var bottomBar = document.getElementById('mobileBottomBar');
    var adminBottom = document.getElementById('mobileBottomBarAdmin');
    var userBottom = document.getElementById('mobileBottomBarUser');
    if (bottomBar) bottomBar.style.display = isAuth ? '' : 'none';
    if (adminBottom) adminBottom.style.display = (isAuth && isAdmin) ? '' : 'none';
    if (userBottom) userBottom.style.display = (isAuth && !isAdmin) ? '' : 'none';

    // ── Home Footer (home-footer.ejs) ──
    var footerLogout = document.getElementById('footerLogoutLi');
    var footerLogin = document.getElementById('footerLoginLi');
    var footerSignup = document.getElementById('footerSignupLi');
    if (footerLogout) footerLogout.style.display = isAuth ? 'block' : 'none';
    if (footerLogin) footerLogin.style.display = isAuth ? 'none' : 'block';
    if (footerSignup) footerSignup.style.display = isAuth ? 'none' : 'block';

    // ── Body Classes ──
    if (document.body) {
      if (isAuth) {
        document.body.classList.add('is-authenticated');
        document.body.classList.add('has-mobile-bottom-bar');
        if (isAdmin) {
          document.body.classList.add('is-admin');
          document.body.classList.remove('is-user');
        } else {
          document.body.classList.add('is-user');
          document.body.classList.remove('is-admin');
        }
      } else {
        document.body.classList.remove('is-authenticated', 'has-mobile-bottom-bar', 'is-admin', 'is-user');
      }
    }

    // ── Cart Badge Cleanup on Logout ──
    if (!isAuth) {
      var hdrBadge = document.getElementById('hdrCartBadge');
      var catBadge = document.getElementById('catHdrCartBadge');
      var mobBadge = document.getElementById('mobileNavCartBadge');
      if (hdrBadge) hdrBadge.style.display = 'none';
      if (catBadge) catBadge.style.display = 'none';
      if (mobBadge) mobBadge.style.display = 'none';
    }
  }

  // ─── 2. Auth State Verifier & Syncer ─────────────────────────────────────
  function checkAndSyncAuth() {
    var isAuth = false;
    var isAdmin = false;

    // Fast synchronous check from client storage
    try {
      var raw = localStorage.getItem('authUser');
      if (raw) {
        var u = JSON.parse(raw);
        if (u && (u.id || u.email)) {
          isAuth = true;
          isAdmin = (u.role === 'ADMIN' || u.role === 'admin');
        }
      }
    } catch (_) {}

    // Apply immediately to prevent any flicker
    updateAuthUI(isAuth, isAdmin);

    // Protected route check
    var pathname = (window.location.pathname || '').toLowerCase();
    var protectedRoutes = ['/checkout', '/orders', '/profile', '/admin'];
    var isProtected = protectedRoutes.some(function (route) {
      return pathname === route || pathname.startsWith(route + '/');
    });

    if (!isAuth && isProtected) {
      window.location.href = '/login?pendingRoute=' + encodeURIComponent(window.location.pathname + window.location.search);
      return;
    }

    // Asynchronous verification with backend to ensure cookie is still valid
    fetch('/api/auth/status', {
      method: 'GET',
      cache: 'no-store',
      headers: { 'Accept': 'application/json' },
      credentials: 'same-origin'
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data && data.success) {
          var serverAuth = Boolean(data.isAuthenticated);
          var serverAdmin = Boolean(data.isAdmin);

          if (!serverAuth) {
            localStorage.removeItem('authUser');
            localStorage.removeItem('authToken');
            if (isProtected) {
              window.location.href = '/login?pendingRoute=' + encodeURIComponent(window.location.pathname + window.location.search);
              return;
            }
          } else if (data.user) {
            try {
              localStorage.setItem('authUser', JSON.stringify(data.user));
            } catch (_) {}
          }

          updateAuthUI(serverAuth, serverAdmin);
        }
      })
      .catch(function () {});
  }

  // ─── 3. Global Logout Handler ────────────────────────────────────────────
  async function handleGlobalLogout() {
    try {
      // 1. Immediately update UI in-place (turns Logout button into Login button without refresh)
      updateAuthUI(false, false);

      // 2. Clear client storage
      localStorage.removeItem('authUser');
      localStorage.removeItem('authToken');
      localStorage.removeItem('pendingRoute');
      localStorage.removeItem('ks_cart');

      // 3. Notify other tabs
      try {
        localStorage.setItem('auth_event', 'logout:' + Date.now());
      } catch (_) {}

      // 4. Invalidate session cookie on server
      await fetch('/logout', { method: 'POST', credentials: 'same-origin' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // 5. If on protected route, redirect to login; otherwise stay on current page with Login button visible
      var pathname = (window.location.pathname || '').toLowerCase();
      var protectedRoutes = ['/checkout', '/orders', '/profile', '/admin'];
      var isProtected = protectedRoutes.some(function (route) {
        return pathname === route || pathname.startsWith(route + '/');
      });

      if (isProtected) {
        if (pathname === '/profile' || pathname.startsWith('/profile/')) {
          window.location.href = '/home';
        } else {
          window.location.href = '/login?pendingRoute=' + encodeURIComponent(window.location.pathname + window.location.search);
        }
      }
    }
  }

  // ─── 4. Event Delegator for All Logout Buttons ───────────────────────────
  document.addEventListener('click', function (e) {
    var target = e.target.closest('#hdrLogoutBtn, #hdrMobileLogoutBtn, #catHdrLogoutBtn, #catMobileLogoutBtn, #navLogoutBtn, #footerLogoutBtn, #profileSidebarLogoutBtn');
    if (target) {
      e.preventDefault();
      handleGlobalLogout();
    }
  });

  // ─── 5. Lifecycle & Navigation Listeners ─────────────────────────────────
  // Initial DOM readiness
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAndSyncAuth);
  } else {
    checkAndSyncAuth();
  }

  // BFCache restoration ("backgoing" / history navigation)
  window.addEventListener('pageshow', function () {
    checkAndSyncAuth();
  });

  // Popstate history navigation
  window.addEventListener('popstate', function () {
    checkAndSyncAuth();
  });

  // Tab focus / visibility change
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') {
      checkAndSyncAuth();
    }
  });

  // Cross-tab storage synchronization
  window.addEventListener('storage', function (e) {
    if (e.key === 'authUser' || e.key === 'auth_event' || e.key === 'authToken') {
      checkAndSyncAuth();
    }
  });

  // Expose to window for manual access if needed
  window.EnterpriseAuth = {
    sync: checkAndSyncAuth,
    logout: handleGlobalLogout,
    updateUI: updateAuthUI
  };
})();
