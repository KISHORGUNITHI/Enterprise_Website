/**
 * admin.js — Enterprise Store Admin Panel Interactive Logic
 * Handles real-time search, filters, modals, drawers, status updates, and mock mutations.
 */

(function () {
  'use strict';

  // Check if using real API or mock data
  const useApi = window.ADMIN_USE_API || false;

  // Ensure mock data is loaded
  const data = window.adminMockData || {
    stats: {},
    banners: [],
    products: [],
    categories: [],
    users: [],
    orders: []
  };

  // API Helper Functions
  const API = {
    async fetch(endpoint, options = {}) {
      try {
        const response = await fetch(`/api/admin${endpoint}`, {
          headers: {
            'Content-Type': 'application/json',
            ...options.headers
          },
          ...options
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || `API error: ${response.status}`);
        }
        return await response.json();
      } catch (err) {
        showAdminToast(`Error: ${err.message}`, 'error');
        console.error('API Error:', err);
        throw err;
      }
    },

    // Read operations
    async getStats() {
      return this.fetch('/stats');
    },
    async getBanners(filters = {}) {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      return this.fetch(`/banners?${params}`);
    },
    async getProducts(filters = {}) {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      return this.fetch(`/products?${params}`);
    },
    async getUsers(filters = {}) {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.role) params.append('role', filters.role);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      return this.fetch(`/users?${params}`);
    },
    async getUserDetail(userId) {
      return this.fetch(`/users/${userId}`);
    },
    async getOrders(filters = {}) {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      return this.fetch(`/orders?${params}`);
    },
    async getOrderDetail(orderId) {
      return this.fetch(`/orders/${orderId}`);
    },

    // Write operations
    async createBanner(bannerData) {
      return this.fetch('/banners', {
        method: 'POST',
        body: JSON.stringify(bannerData)
      });
    },
    async updateBanner(bannerId, bannerData) {
      return this.fetch(`/banners/${bannerId}`, {
        method: 'PUT',
        body: JSON.stringify(bannerData)
      });
    },
    async toggleBanner(bannerId) {
      return this.fetch(`/banners/${bannerId}/toggle`, {
        method: 'PATCH'
      });
    },
    async deleteBanner(bannerId) {
      return this.fetch(`/banners/${bannerId}`, {
        method: 'DELETE'
      });
    },

    async createProduct(productData) {
      return this.fetch('/products', {
        method: 'POST',
        body: JSON.stringify(productData)
      });
    },
    async updateProduct(productId, productData) {
      return this.fetch(`/products/${productId}`, {
        method: 'PUT',
        body: JSON.stringify(productData)
      });
    },
    async toggleProductVisibility(productId) {
      return this.fetch(`/products/${productId}/visibility`, {
        method: 'PATCH'
      });
    },
    async deleteProduct(productId) {
      return this.fetch(`/products/${productId}`, {
        method: 'DELETE'
      });
    },

    async updateOrderStatus(orderId, status, cancelReason = null) {
      return this.fetch(`/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, cancelReason })
      });
    }
  };

  // CRUD Wrapper Functions (auto-switch between API and mock)
  const CRUD = {
    async saveBanner(bannerData, bannerId = null) {
      if (!useApi) {
        if (bannerId) {
          const idx = data.banners.findIndex(b => b.id === bannerId);
          if (idx !== -1) data.banners[idx] = { ...data.banners[idx], ...bannerData };
        } else {
          data.banners.push({ id: Date.now().toString(), ...bannerData });
        }
        showAdminToast(`Banner ${bannerId ? 'updated' : 'created'} successfully`);
        return { success: true };
      }
      try {
        const res = bannerId
          ? await API.updateBanner(bannerId, bannerData)
          : await API.createBanner(bannerData);
        if (res.success) showAdminToast(`Banner ${bannerId ? 'updated' : 'created'} successfully`);
        return res;
      } catch (err) {
        showAdminToast('Failed to save banner', 'error');
        throw err;
      }
    },

    async deleteBanner(bannerId) {
      if (!useApi) {
        data.banners = data.banners.filter(b => b.id !== bannerId);
        showAdminToast('Banner deleted');
        return { success: true };
      }
      try {
        const res = await API.deleteBanner(bannerId);
        if (res.success) showAdminToast('Banner deleted');
        return res;
      } catch (err) {
        showAdminToast('Failed to delete banner', 'error');
        throw err;
      }
    },

    async saveProduct(productData, productId = null) {
      if (!useApi) {
        if (productId) {
          const idx = data.products.findIndex(p => p.id === productId);
          if (idx !== -1) data.products[idx] = { ...data.products[idx], ...productData };
        } else {
          data.products.push({ id: Date.now().toString(), ...productData });
        }
        showAdminToast(`Product ${productId ? 'updated' : 'created'} successfully`);
        return { success: true };
      }
      try {
        const res = productId
          ? await API.updateProduct(productId, productData)
          : await API.createProduct(productData);
        if (res.success) showAdminToast(`Product ${productId ? 'updated' : 'created'} successfully`);
        return res;
      } catch (err) {
        showAdminToast('Failed to save product', 'error');
        throw err;
      }
    },

    async deleteProduct(productId) {
      if (!useApi) {
        data.products = data.products.filter(p => p.id !== productId);
        showAdminToast('Product deleted');
        return { success: true };
      }
      try {
        const res = await API.deleteProduct(productId);
        if (res.success) showAdminToast('Product deleted');
        return res;
      } catch (err) {
        showAdminToast('Failed to delete product', 'error');
        throw err;
      }
    }
  };

  /* =========================================================================
     1. UTILITIES & TOAST NOTIFICATIONS
     ========================================================================= */

  function formatRupees(num) {
    if (typeof num !== 'number') num = Number(num) || 0;
    return '₹' + num.toLocaleString('en-IN');
  }

  function showAdminToast(message, type = 'success') {
    const container = document.getElementById('adminToastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `admin-toast admin-toast--${type}`;

    let iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
    if (type === 'warning') {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
    }

    toast.innerHTML = `${iconSvg}<span>${message}</span>`;
    container.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => toast.classList.add('show'));

    // Remove after 3.5 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  /* =========================================================================
     2. MOBILE SIDEBAR NAVIGATION
     ========================================================================= */

  const sidebarToggleBtn = document.getElementById('adminSidebarToggle');
  const sidebar = document.getElementById('adminSidebar');
  const sidebarBackdrop = document.getElementById('adminSidebarBackdrop');

  function toggleSidebar(open) {
    if (!sidebar) return;
    const shouldOpen = open !== undefined ? open : !sidebar.classList.contains('open');
    if (shouldOpen) {
      sidebar.classList.add('open');
      if (sidebarBackdrop) sidebarBackdrop.classList.add('open');
    } else {
      sidebar.classList.remove('open');
      if (sidebarBackdrop) sidebarBackdrop.classList.remove('open');
    }
  }

  if (sidebarToggleBtn) {
    sidebarToggleBtn.addEventListener('click', () => toggleSidebar());
  }
  if (sidebarBackdrop) {
    sidebarBackdrop.addEventListener('click', () => toggleSidebar(false));
  }

  /* =========================================================================
     2.1 USER PROFILE DROPDOWN & LOGOUT
     ========================================================================= */

  const userDropdownBtn = document.getElementById('adminUserDropdownBtn');
  const userDropdownMenu = document.getElementById('adminUserDropdownMenu');

  function toggleUserDropdown(open) {
    if (!userDropdownMenu) return;
    const shouldOpen = open !== undefined ? open : !userDropdownMenu.classList.contains('open');
    if (shouldOpen) {
      userDropdownMenu.classList.add('open');
      userDropdownBtn?.setAttribute('aria-expanded', 'true');
    } else {
      userDropdownMenu.classList.remove('open');
      userDropdownBtn?.setAttribute('aria-expanded', 'false');
    }
  }

  if (userDropdownBtn && userDropdownMenu) {
    userDropdownBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      toggleUserDropdown();
    });

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
      if (userDropdownMenu && userDropdownMenu.classList.contains('open')) {
        if (!userDropdownMenu.contains(e.target) && !userDropdownBtn?.contains(e.target)) {
          toggleUserDropdown(false);
        }
      }
    });
  }

  // Admin Logout unified handler
  function performAdminLogout() {
    showAdminToast('Logging out from admin session...', 'warning');
    try {
      fetch('/logout', { method: 'POST', credentials: 'same-origin' })
        .finally(() => {
          localStorage.removeItem('authUser');
          localStorage.removeItem('authToken');
          localStorage.removeItem('pendingRoute');
          setTimeout(() => {
            window.location.href = '/login';
          }, 600);
        });
    } catch (e) {
      localStorage.removeItem('authUser');
      localStorage.removeItem('authToken');
      localStorage.removeItem('pendingRoute');
      window.location.href = '/login';
    }
  }

  ['adminLogoutBtn', 'adminSidebarLogoutBtn', 'headerLogoutBtn', 'adminProfileSignOutBtn'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        performAdminLogout();
      });
    }
  });

  /* =========================================================================
     3. MODAL & DRAWER CONTROLS
     ========================================================================= */

  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  // Close triggers
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-close-modal');
      closeModal(targetId);
    });
  });

  // Open triggers
  document.querySelectorAll('[data-open-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-open-modal');
      if (targetId === 'productModal') resetProductForm();
      if (targetId === 'bannerModal') resetBannerForm();
      openModal(targetId);
    });
  });

  // Global ESC key listener
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.admin-modal-backdrop.open').forEach(m => closeModal(m.id));
      closeUserDrawer();
      closeOrderDrawer();
      toggleSidebar(false);
    }
  });

  /* =========================================================================
     4. DASHBOARD VIEW CONTROLLER
     ========================================================================= */

  function initDashboard() {
    const ordersTbody = document.getElementById('dashboardOrdersTableBody');

    if (!useApi) {
      // Use mock data
      if (ordersTbody) {
        const recent = data.orders.slice(0, 5);
        ordersTbody.innerHTML = recent.map(o => `
          <tr>
            <td><strong style="font-family:var(--font-mono); color:var(--color-primary-700);">${o.shortId}</strong></td>
            <td>
              <div style="font-weight:var(--font-semibold);">${o.customer.name}</div>
              <div style="font-size:var(--text-xs); color:var(--color-text-muted);">${o.customer.phone}</div>
            </td>
            <td><strong>${formatRupees(o.totalAmount)}</strong></td>
            <td>
              <span class="order-status order-status--${o.status}">
                <span class="order-status__dot"></span>
                ${capitalize(o.status.replace(/_/g, ' '))}
              </span>
            </td>
            <td style="font-size:var(--text-xs); color:var(--color-text-muted);">${o.date}</td>
            <td>
              <button type="button" class="admin-btn-action" data-view-order="${o.id}">
                <span>View</span>
              </button>
            </td>
          </tr>
        `).join('');

        ordersTbody.querySelectorAll('[data-view-order]').forEach(btn => {
          btn.addEventListener('click', () => openOrderDrawer(btn.dataset.viewOrder));
        });
      }
      return;
    }

    // Use API data
    Promise.all([API.getOrders({ limit: 5 }), API.getStats()])
      .then(([ordersRes, statsRes]) => {
        if (ordersTbody && ordersRes.data) {
          ordersTbody.innerHTML = ordersRes.data.map(o => {
            const customerName = o.user?.username || (o.user?.email ? o.user.email.split('@')[0] : 'Customer');
            const customerPhone = o.user?.phone_number || '-';
            const statusStr = (o.status || 'PENDING').toLowerCase();

            return `
              <tr>
                <td><strong style="font-family:var(--font-mono); color:var(--color-primary-700);">${o.shortId}</strong></td>
                <td>
                  <div style="font-weight:var(--font-semibold);">${customerName}</div>
                  <div style="font-size:var(--text-xs); color:var(--color-text-muted);">${customerPhone}</div>
                </td>
                <td><strong>${formatRupees(o.totalAmount)}</strong></td>
                <td>
                  <span class="order-status order-status--${statusStr}">
                    <span class="order-status__dot"></span>
                    ${capitalize(statusStr.replace(/_/g, ' '))}
                  </span>
                </td>
                <td style="font-size:var(--text-xs); color:var(--color-text-muted);">${new Date(o.createdAt).toLocaleDateString()}</td>
                <td>
                  <button type="button" class="admin-btn-action" data-view-order="${o.id}">
                    <span>View</span>
                  </button>
                </td>
              </tr>
            `;
          }).join('');

          ordersTbody.querySelectorAll('[data-view-order]').forEach(btn => {
            btn.addEventListener('click', () => openOrderDrawer(btn.dataset.viewOrder));
          });
        }

        // Update stat cards
        if (statsRes.data) {
          const stats = statsRes.data;
          const els = {
            totalProducts: document.getElementById('statTotalProducts'),
            totalUsers: document.getElementById('statTotalUsers') || document.getElementById('statRegisteredUsers'),
            totalOrders: document.getElementById('statTotalOrders'),
            revenue: document.getElementById('statTotalRevenue'),
            pending: document.getElementById('statPendingCount'),
            banners: document.getElementById('statActiveBanners')
          };
          if (els.totalProducts) els.totalProducts.textContent = stats.totalProducts;
          if (els.totalUsers) els.totalUsers.textContent = stats.totalUsers;
          if (els.totalOrders) els.totalOrders.textContent = stats.totalOrders;
          if (els.revenue) els.revenue.textContent = formatRupees(stats.totalRevenue);
          if (els.pending) els.pending.textContent = `${stats.pendingOrders} Orders`;
          if (els.banners) els.banners.textContent = `${stats.activeBanners} Running`;
        }
      })
      .catch((err) => {
        console.warn('Failed to load dashboard from API:', err);
        // Fall back to mock data
        initDashboard_Mock();
      });
  }

  function initDashboard_Mock() {
    // Fallback mock implementation - same as original
    const ordersTbody = document.getElementById('dashboardOrdersTableBody');

    if (ordersTbody) {
      const recent = data.orders.slice(0, 5);
      ordersTbody.innerHTML = recent.map(o => `
        <tr>
          <td><strong style="font-family:var(--font-mono); color:var(--color-primary-700);">${o.shortId}</strong></td>
          <td>
            <div style="font-weight:var(--font-semibold);">${o.customer.name}</div>
            <div style="font-size:var(--text-xs); color:var(--color-text-muted);">${o.customer.phone}</div>
          </td>
          <td><strong>${formatRupees(o.totalAmount)}</strong></td>
          <td>
            <span class="order-status order-status--${o.status}">
              <span class="order-status__dot"></span>
              ${capitalize(o.status.replace(/_/g, ' '))}
            </span>
          </td>
          <td style="font-size:var(--text-xs); color:var(--color-text-muted);">${o.date}</td>
          <td>
            <button type="button" class="admin-btn-action" data-view-order="${o.id}">
              <span>View</span>
            </button>
          </td>
        </tr>
      `).join('');

      ordersTbody.querySelectorAll('[data-view-order]').forEach(btn => {
        btn.addEventListener('click', () => openOrderDrawer(btn.dataset.viewOrder));
      });
    }
  }

  /* =========================================================================
     5. BANNER MANAGEMENT VIEW CONTROLLER
     ========================================================================= */

  let currentBannerImage = '';

  function setBannerImage(url) {
    currentBannerImage = url || '';
    const previewBox = document.getElementById('bannerImgPreviewBox');
    const previewImg = document.getElementById('bannerImgPreviewElement');
    const urlInput = document.getElementById('bannerImageUrlInput');

    if (currentBannerImage) {
      if (previewImg) previewImg.src = currentBannerImage;
      if (previewBox) previewBox.style.display = 'block';
      if (urlInput && !urlInput.value) urlInput.value = currentBannerImage;
    } else {
      if (previewImg) previewImg.src = '';
      if (previewBox) previewBox.style.display = 'none';
      if (urlInput) urlInput.value = '';
      const fileInput = document.getElementById('bannerFileInput');
      if (fileInput) fileInput.value = '';
    }
  }

  function setupBannerImageControls() {
    // Tab switcher
    const tabs = document.querySelectorAll('[data-img-tab^="banner-"]');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');

        const tabType = tab.getAttribute('data-img-tab');
        const filePanel = document.getElementById('bannerFilePanel');
        const urlPanel = document.getElementById('bannerUrlPanel');
        if (tabType === 'banner-file') {
          if (filePanel) filePanel.style.display = 'block';
          if (urlPanel) urlPanel.style.display = 'none';
        } else {
          if (filePanel) filePanel.style.display = 'none';
          if (urlPanel) urlPanel.style.display = 'block';
        }
      });
    });

    // File input change (local file)
    const fileInput = document.getElementById('bannerFileInput');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            setBannerImage(ev.target.result);
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Drag and drop for banner dropzone
    const dropzone = document.getElementById('bannerDropzone');
    if (dropzone) {
      ['dragenter', 'dragover'].forEach(evtName => {
        dropzone.addEventListener(evtName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropzone.classList.add('dragover');
        });
      });
      ['dragleave', 'drop'].forEach(evtName => {
        dropzone.addEventListener(evtName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropzone.classList.remove('dragover');
        });
      });
      dropzone.addEventListener('drop', (e) => {
        const file = e.dataTransfer?.files?.[0];
        if (file && file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            setBannerImage(ev.target.result);
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Online URL input & button
    const applyUrlBtn = document.getElementById('bannerApplyUrlBtn');
    const urlInput = document.getElementById('bannerImageUrlInput');
    if (applyUrlBtn && urlInput) {
      applyUrlBtn.addEventListener('click', () => {
        const val = urlInput.value.trim();
        if (val) setBannerImage(val);
      });
      urlInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const val = urlInput.value.trim();
          if (val) setBannerImage(val);
        }
      });
    }

    // Clear image
    const clearBtn = document.getElementById('bannerImgClearBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        setBannerImage('');
      });
    }
  }

  let liveBannersLoaded = false;

  async function loadLiveBanners() {
    if (!useApi) return;
    try {
      const res = await API.getBanners();
      if (res && res.success && Array.isArray(res.data)) {
        data.banners = res.data.map(b => ({
          id: b.id,
          title: b.title,
          eyebrow: b.eyebrow,
          subtitle: b.subtitle || '',
          ctaText: b.ctaText,
          slug: b.slug,
          badge: b.badge || '',
          status: b.status === 'ACTIVE' ? 'Active' : 'Inactive',
          bgGradient: b.bgGradient || 'linear-gradient(135deg, #0d1e4d 0%, #1e3d8f 60%, #2f52a0 100%)',
          accentColor: b.accentColor || '#f58500',
          image: b.image || ''
        }));
        liveBannersLoaded = true;
      }
    } catch (e) {
      console.warn('Could not load live banners from API:', e);
    }
  }

  async function renderBanners() {
    const grid = document.getElementById('bannersGrid');
    const emptyState = document.getElementById('bannersEmptyState');
    const searchInput = document.getElementById('bannerSearchInput');
    const statusFilter = document.getElementById('bannerStatusFilter');

    if (!grid) return;

    if (useApi && !liveBannersLoaded) {
      await loadLiveBanners();
    }

    // Dynamically update filter counts with actual live numbers
    if (statusFilter && Array.isArray(data.banners)) {
      const totalCount = data.banners.length;
      const activeCount = data.banners.filter(b => (b.status || '').toLowerCase() === 'active').length;
      const inactiveCount = data.banners.filter(b => (b.status || '').toLowerCase() === 'inactive').length;

      const optAll = statusFilter.querySelector('option[value="all"]');
      const optActive = statusFilter.querySelector('option[value="Active"]');
      const optInactive = statusFilter.querySelector('option[value="Inactive"]');

      if (optAll) optAll.textContent = `All Banners (${totalCount})`;
      if (optActive) optActive.textContent = `Active Only (${activeCount})`;
      if (optInactive) optInactive.textContent = `Inactive Only (${inactiveCount})`;
    }

    const query = (searchInput?.value || '').trim().toLowerCase();
    const filterStatus = statusFilter?.value || 'all';

    const filtered = data.banners.filter(b => {
      const matchSearch = (b.title || '').toLowerCase().includes(query) ||
                          (b.eyebrow || '').toLowerCase().includes(query) ||
                          (b.slug || '').toLowerCase().includes(query);
      const matchStatus = filterStatus === 'all' || (b.status || '').toLowerCase() === filterStatus.toLowerCase();
      return matchSearch && matchStatus;
    });

    if (filtered.length === 0) {
      grid.innerHTML = '';
      if (emptyState) emptyState.style.display = 'flex';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    grid.innerHTML = filtered.map(b => `
      <div class="admin-banner-card" data-id="${b.id}">
        <!-- Visual Banner Header Preview -->
        <div class="admin-banner-preview" style="background:${b.bgGradient || 'linear-gradient(135deg, #0d1e4d 0%, #1e3d8f 60%, #2f52a0 100%)'};">
          ${b.image ? `<img src="${b.image}" alt="${b.title}" class="admin-banner-preview__bg-img" onerror="this.style.display='none'"/>` : ''}
          <div>
            <span class="admin-banner-preview__eyebrow">${b.eyebrow}</span>
            <h3 class="admin-banner-preview__title">${b.title}</h3>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:flex-end;">
            ${b.badge ? `<span class="admin-banner-preview__badge">${b.badge}</span>` : '<span></span>'}
            <span style="font-size:var(--text-xs); background:rgba(0,0,0,0.4); padding:2px 8px; border-radius:var(--radius-sm);">
              CTA: ${b.ctaText}
            </span>
          </div>
        </div>

        <!-- Banner Card Body -->
        <div class="admin-banner-card__details">
          <p style="font-size:var(--text-xs); color:var(--color-text-muted); line-height:var(--leading-relaxed); margin:0;">
            ${b.subtitle}
          </p>

          <div class="admin-banner-card__slug-row">
            <span style="color:var(--color-text-muted);">Destination Slug:</span>
            <span class="admin-banner-slug-pill">/${b.slug}</span>
          </div>

          <div class="admin-banner-card__slug-row">
            <span style="color:var(--color-text-muted);">Visibility Status:</span>
            <span class="badge ${b.status === 'Active' ? 'badge--success' : ''}" style="${b.status === 'Inactive' ? 'background:#f4f4f5; color:#71717a;' : ''}">
              ${b.status}
            </span>
          </div>

          <!-- Footer Actions -->
          <div class="admin-banner-card__footer">
            <button type="button" class="admin-btn-action" data-toggle-banner="${b.id}">
              ${b.status === 'Active' ? 'Deactivate' : 'Activate'}
            </button>
            <div style="display:flex; gap:var(--space-2);">
              <button type="button" class="admin-btn-action" data-edit-banner="${b.id}">Edit</button>
              <button type="button" class="admin-btn-action admin-btn-action--danger" data-delete-banner="${b.id}">Delete</button>
            </div>
          </div>
        </div>
      </div>
    `).join('');

    // Attach listeners
    grid.querySelectorAll('[data-edit-banner]').forEach(btn => {
      btn.addEventListener('click', () => editBanner(btn.dataset.editBanner));
    });

    grid.querySelectorAll('[data-toggle-banner]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const bannerId = btn.dataset.toggleBanner;
        if (useApi) {
          try {
            await API.toggleBanner(bannerId);
            await loadLiveBanners();
            renderBanners();
            showAdminToast('Banner visibility toggled.');
            return;
          } catch (err) {
            showAdminToast('Failed to toggle banner.', 'error');
            return;
          }
        }
        const item = data.banners.find(x => x.id === bannerId);
        if (item) {
          item.status = item.status === 'Active' ? 'Inactive' : 'Active';
          renderBanners();
          showAdminToast(`Banner "${item.title}" marked as ${item.status}.`);
        }
      });
    });

    grid.querySelectorAll('[data-delete-banner]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const bannerId = btn.dataset.deleteBanner;
        if (!confirm('Are you sure you want to delete this banner?')) return;
        if (useApi) {
          try {
            await API.deleteBanner(bannerId);
            await loadLiveBanners();
            renderBanners();
            showAdminToast('Banner deleted successfully.');
            return;
          } catch (err) {
            showAdminToast('Failed to delete banner.', 'error');
            return;
          }
        }
        const idx = data.banners.findIndex(x => x.id === bannerId);
        if (idx !== -1) {
          const removed = data.banners.splice(idx, 1)[0];
          renderBanners();
          showAdminToast(`Banner "${removed.title}" deleted.`);
        }
      });
    });
  }

  function resetBannerForm() {
    const form = document.getElementById('bannerForm');
    if (form) form.reset();
    const idInput = document.getElementById('bannerFormId');
    if (idInput) idInput.value = '';
    const title = document.getElementById('bannerModalTitle');
    if (title) title.textContent = 'Add New Banner';
    setBannerImage('');
    const catSel = document.getElementById('bannerCategorySelect');
    if (catSel) catSel.value = 'all';
    const slugInp = document.getElementById('bannerSlug');
    if (slugInp) slugInp.value = 'all';
  }

  // Category select sync with slug input
  const bannerCatSelect = document.getElementById('bannerCategorySelect');
  const bannerSlugInput = document.getElementById('bannerSlug');
  if (bannerCatSelect && bannerSlugInput) {
    bannerCatSelect.addEventListener('change', () => {
      if (bannerCatSelect.value !== 'custom') {
        bannerSlugInput.value = bannerCatSelect.value;
      }
    });
    bannerSlugInput.addEventListener('input', () => {
      const val = bannerSlugInput.value.trim().toLowerCase();
      if (['all', 'mobiles', 'tvs', 'acs', 'home-theatres'].includes(val)) {
        bannerCatSelect.value = val;
      } else {
        bannerCatSelect.value = 'custom';
      }
    });
  }

  function editBanner(id) {
    const banner = data.banners.find(b => b.id === id);
    if (!banner) return;

    document.getElementById('bannerFormId').value = banner.id;
    document.getElementById('bannerEyebrow').value = banner.eyebrow;
    document.getElementById('bannerTitle').value = banner.title;
    document.getElementById('bannerSubtitle').value = banner.subtitle;
    document.getElementById('bannerCtaText').value = banner.ctaText;
    document.getElementById('bannerSlug').value = banner.slug;
    document.getElementById('bannerBadge').value = banner.badge || '';
    document.getElementById('bannerStatus').value = banner.status;

    const catSel = document.getElementById('bannerCategorySelect');
    if (catSel) {
      const lower = (banner.slug || '').toLowerCase();
      if (['all', 'mobiles', 'tvs', 'acs', 'home-theatres'].includes(lower)) {
        catSel.value = lower;
      } else {
        catSel.value = 'custom';
      }
    }

    setBannerImage(banner.image || '');

    document.getElementById('bannerModalTitle').textContent = 'Edit Banner';
    openModal('bannerModal');
  }

  const saveBannerBtn = document.getElementById('saveBannerBtn');
  if (saveBannerBtn) {
    saveBannerBtn.addEventListener('click', async () => {
      const id = document.getElementById('bannerFormId').value;
      const title = document.getElementById('bannerTitle').value.trim();
      const eyebrow = document.getElementById('bannerEyebrow').value.trim();
      const subtitle = document.getElementById('bannerSubtitle').value.trim();
      const ctaText = document.getElementById('bannerCtaText').value.trim();
      const slug = document.getElementById('bannerSlug').value.trim();
      const badge = document.getElementById('bannerBadge').value.trim();
      const status = document.getElementById('bannerStatus').value;

      if (!title || !slug) {
        alert('Please provide a banner title and target slug.');
        return;
      }

      if (useApi) {
        try {
          const defaultThemes = {
            mobiles: { bg: 'linear-gradient(135deg, #0d1e4d 0%, #1e3d8f 55%, #2f52a0 100%)', accent: '#f58500' },
            tvs: { bg: 'linear-gradient(135deg, #1a0d2e 0%, #3b1f6b 55%, #5a2ea0 100%)', accent: '#a78bfa' },
            acs: { bg: 'linear-gradient(135deg, #0a1a30 0%, #0d3a6e 55%, #1e5aa0 100%)', accent: '#60a5fa' },
            'home-theatres': { bg: 'linear-gradient(135deg, #10141f 0%, #1f2937 55%, #374151 100%)', accent: '#fbbf24' },
            all: { bg: 'linear-gradient(135deg, #0d1e4d 0%, #1e3d8f 60%, #2f52a0 100%)', accent: '#f58500' }
          };
          const theme = defaultThemes[slug.toLowerCase()] || defaultThemes['all'];
          const existingBanner = id ? data.banners.find(b => b.id === id) : null;

          const bannerPayload = {
            title,
            eyebrow,
            subtitle,
            ctaText,
            slug,
            badge: badge || null,
            status: status === 'Active' ? 'ACTIVE' : 'INACTIVE',
            bgGradient: existingBanner?.bgGradient || theme.bg,
            accentColor: existingBanner?.accentColor || theme.accent
          };
          if (id) {
            await API.updateBanner(id, bannerPayload);
            showAdminToast('Banner updated successfully.');
          } else {
            await API.createBanner(bannerPayload);
            showAdminToast('New banner added successfully.');
          }
          await loadLiveBanners();
          closeModal('bannerModal');
          renderBanners();
          return;
        } catch (err) {
          showAdminToast(`Error saving banner: ${err.message}`, 'error');
          return;
        }
      }

      if (id) {
        // Edit existing mock
        const banner = data.banners.find(b => b.id === id);
        if (banner) {
          Object.assign(banner, {
            title,
            eyebrow,
            subtitle,
            ctaText,
            slug,
            badge,
            status,
            image: currentBannerImage
          });
          showAdminToast('Banner updated successfully.');
        }
      } else {
        // Add new mock
        const newBanner = {
          id: 'BNR-' + String(data.banners.length + 1).padStart(3, '0'),
          title,
          eyebrow,
          subtitle,
          ctaText,
          slug,
          badge,
          status,
          image: currentBannerImage,
          bgGradient: 'linear-gradient(135deg, #0d1e4d 0%, #1e3d8f 60%, #2f52a0 100%)',
          accentColor: '#f58500',
          clicks: 0
        };
        data.banners.unshift(newBanner);
        showAdminToast('New banner added successfully.');
      }

      closeModal('bannerModal');
      renderBanners();
    });
  }

  /* =========================================================================
     6. PRODUCT & STOCK MANAGEMENT CONTROLLER
     ========================================================================= */

  let currentProductImages = [];

  function renderProductGallery() {
    const grid = document.getElementById('productGalleryGrid');
    const empty = document.getElementById('productGalleryEmpty');
    const count = document.getElementById('productImagesCount');

    if (count) {
      count.textContent = `${currentProductImages.length} image${currentProductImages.length === 1 ? '' : 's'}`;
    }

    if (!grid || !empty) return;

    if (currentProductImages.length === 0) {
      grid.innerHTML = '';
      empty.style.display = 'flex';
      return;
    }

    empty.style.display = 'none';

    // Ensure at least one primary image exists
    const hasPrimary = currentProductImages.some(x => x.isPrimary);
    if (!hasPrimary && currentProductImages.length > 0) {
      currentProductImages[0].isPrimary = true;
    }

    grid.innerHTML = currentProductImages.map((img, idx) => `
      <div class="admin-gallery-thumb ${img.isPrimary ? 'admin-gallery-thumb--primary' : ''}">
        ${img.isPrimary ? `<span class="admin-thumb-primary-tag">★ Cover</span>` : ''}
        <img src="${img.url}" alt="Product Preview ${idx + 1}" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'100\\' height=\\'100\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'%2394a3b8\\' stroke-width=\\'2\\'><rect x=\\'3\\' y=\\'3\\' width=\\'18\\' height=\\'18\\' rx=\\'2\\'/><circle cx=\\'8.5\\' cy=\\'8.5\\' r=\\'1.5\\'/><polyline points=\\'21 15 16 10 5 21\\'/></svg>'"/>
        <div class="admin-gallery-thumb__actions">
          ${!img.isPrimary ? `<button type="button" class="admin-thumb-btn-cover" data-make-cover="${idx}">Set Cover</button>` : '<div></div>'}
          <button type="button" class="admin-thumb-btn-delete" data-remove-img="${idx}" title="Delete image">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      </div>
    `).join('');

    // Attach cover and delete handlers
    grid.querySelectorAll('[data-make-cover]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = Number(btn.dataset.makeCover);
        currentProductImages.forEach((item, i) => {
          item.isPrimary = (i === index);
        });
        renderProductGallery();
      });
    });

    grid.querySelectorAll('[data-remove-img]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = Number(btn.dataset.removeImg);
        const wasPrimary = currentProductImages[index]?.isPrimary;
        currentProductImages.splice(index, 1);
        if (wasPrimary && currentProductImages.length > 0) {
          currentProductImages[0].isPrimary = true;
        }
        renderProductGallery();
      });
    });
  }

  function addProductImage(url) {
    if (!url) return;
    const isFirst = currentProductImages.length === 0;
    currentProductImages.push({
      url,
      isPrimary: isFirst
    });
    renderProductGallery();
  }

  function setupProductImageControls() {
    // Tab switcher
    const tabs = document.querySelectorAll('[data-img-tab^="product-"]');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');

        const tabType = tab.getAttribute('data-img-tab');
        const filePanel = document.getElementById('productFilePanel');
        const urlPanel = document.getElementById('productUrlPanel');
        if (tabType === 'product-file') {
          if (filePanel) filePanel.style.display = 'block';
          if (urlPanel) urlPanel.style.display = 'none';
        } else {
          if (filePanel) filePanel.style.display = 'none';
          if (urlPanel) urlPanel.style.display = 'block';
        }
      });
    });

    // File input (multiple local files)
    const fileInput = document.getElementById('productFileInput');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        files.forEach(file => {
          if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (ev) => {
              addProductImage(ev.target.result);
            };
            reader.readAsDataURL(file);
          }
        });
        fileInput.value = '';
      });
    }

    // Drag and drop for product dropzone
    const dropzone = document.getElementById('productDropzone');
    if (dropzone) {
      ['dragenter', 'dragover'].forEach(evtName => {
        dropzone.addEventListener(evtName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropzone.classList.add('dragover');
        });
      });
      ['dragleave', 'drop'].forEach(evtName => {
        dropzone.addEventListener(evtName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropzone.classList.remove('dragover');
        });
      });
      dropzone.addEventListener('drop', (e) => {
        const files = Array.from(e.dataTransfer?.files || []);
        files.forEach(file => {
          if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (ev) => {
              addProductImage(ev.target.result);
            };
            reader.readAsDataURL(file);
          }
        });
      });
    }

    // Online URL input & button
    const addUrlBtn = document.getElementById('productAddUrlBtn');
    const urlInput = document.getElementById('productImageUrlInput');
    if (addUrlBtn && urlInput) {
      const handleAddUrl = () => {
        const val = urlInput.value.trim();
        if (val) {
          addProductImage(val);
          urlInput.value = '';
        }
      };

      addUrlBtn.addEventListener('click', handleAddUrl);
      urlInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleAddUrl();
        }
      });
    }
  }

  let liveProductsLoaded = false;

  async function loadLiveProducts() {
    if (!useApi) return;
    try {
      const res = await API.getProducts({ limit: 100 });
      if (res && res.success && Array.isArray(res.data)) {
        data.products = res.data.map(p => {
          const primaryImg = (p.productImages && p.productImages.find(img => img.isPrimary)?.imageUrl) ||
                             p.productImages?.[0]?.imageUrl ||
                             '';
          const images = (p.productImages || []).map(img => ({
            url: img.imageUrl,
            isPrimary: !!img.isPrimary
          }));
          const priceNum = parseFloat(p.price) || 0;
          return {
            id: p.id,
            name: p.name,
            brand: p.brand || '',
            category: p.category ? p.category.name : 'General',
            categoryId: p.categoryId,
            price: priceNum,
            originalPrice: priceNum,
            stock: (p.stock !== undefined && p.stock !== null) ? Number(p.stock) : 0,
            minStockThreshold: 4,
            status: (p.availability === 'NOT_AVAILABLE' || p.stock === 0) ? 'Out of Stock' : (Number(p.stock) < 5 ? 'Low Stock' : 'In Stock'),
            availability: p.availability || 'AVAILABLE',
            slug: p.slug,
            description: p.description || '',
            images,
            primaryImage: primaryImg
          };
        });
        liveProductsLoaded = true;
      }
    } catch (e) {
      console.warn('Could not load live products from API:', e);
    }
  }

  async function renderProducts() {
    const tbody = document.getElementById('productsTableBody');
    const emptyState = document.getElementById('productsEmptyState');
    const searchInput = document.getElementById('productSearchInput');
    const catFilter = document.getElementById('productCategoryFilter');
    const stockFilter = document.getElementById('productStockFilter');
    const countDisplay = document.getElementById('productsCountDisplay');

    if (!tbody) return;

    if (useApi && !liveProductsLoaded) {
      await loadLiveProducts();
    }

    const query = (searchInput?.value || '').trim().toLowerCase();
    const cat = catFilter?.value || 'all';
    const stockStatus = stockFilter?.value || 'all';

    const filtered = data.products.filter(p => {
      const matchQuery = (p.name || '').toLowerCase().includes(query) ||
                         (p.brand || '').toLowerCase().includes(query) ||
                         (p.category || '').toLowerCase().includes(query) ||
                         (p.slug || '').toLowerCase().includes(query);
      const matchCat = cat === 'all' || p.category.toLowerCase() === cat.toLowerCase();
      const matchStock = stockStatus === 'all' || p.status === stockStatus;
      return matchQuery && matchCat && matchStock;
    });

    if (countDisplay) countDisplay.textContent = filtered.length;

    if (filtered.length === 0) {
      tbody.innerHTML = '';
      if (emptyState) emptyState.style.display = 'flex';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    tbody.innerHTML = filtered.map(p => {
      let stockBadgeClass = 'badge--success';
      let stockColor = '#16a34a';
      if (p.status === 'Low Stock') {
        stockBadgeClass = 'badge--accent';
        stockColor = '#d97706';
      } else if (p.status === 'Out of Stock') {
        stockBadgeClass = '';
        stockColor = '#dc2626';
      }

      const primaryImg = p.primaryImage ||
        (Array.isArray(p.images) && (p.images.find(x => x.isPrimary)?.url || p.images[0]?.url || (typeof p.images[0] === 'string' ? p.images[0] : null))) ||
        p.image || null;

      const imgHtml = primaryImg
        ? `<img src="${primaryImg}" alt="${p.name}" class="admin-cell-product__thumb-img" onerror="this.parentElement.innerHTML='<svg viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'currentColor\\' stroke-width=\\'1.75\\'><rect x=\\'5\\' y=\\'2\\' width=\\'14\\' height=\\'20\\' rx=\\'2\\' ry=\\'2\\'></rect><line x1=\\'12\\' y1=\\'18\\' x2=\\'12.01\\' y2=\\'18\\'></line></svg>'"/>`
        : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
             <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
             <line x1="12" y1="18" x2="12.01" y2="18"></line>
           </svg>`;

      return `
        <tr data-product-id="${p.id}">
          <td>
            <div class="admin-cell-product">
              <div class="admin-cell-product__img">
                ${imgHtml}
              </div>
              <div class="admin-cell-product__info">
                <div class="admin-cell-product__name">${p.name}</div>
                <div class="admin-cell-product__brand">Brand: ${p.brand} &bull; /${p.slug}</div>
              </div>
            </div>
          </td>
          <td>
            <span style="font-weight:var(--font-medium); color:var(--color-text-secondary);">${p.category}</span>
          </td>
          <td>
            <strong>${formatRupees(p.price)}</strong>
          </td>
          <td>
            <div style="display:flex; align-items:center; gap:var(--space-2);">
              <span style="width:8px; height:8px; border-radius:50%; background:${stockColor};"></span>
              <span style="font-weight:var(--font-bold);">${p.stock} units</span>
            </div>
          </td>
          <td>
            <span class="badge ${stockBadgeClass}" style="${p.status === 'Out of Stock' ? 'background:#fee2e2; color:#991b1b;' : ''}">
              ${p.status}
            </span>
          </td>
          <td>
            <button type="button" class="admin-btn-action" data-toggle-avail="${p.id}" style="font-size:11px;">
              ${p.availability === 'AVAILABLE' ? '🟢 Visible' : '🔴 Hidden'}
            </button>
          </td>
          <td>
            <div class="admin-actions-cell">
              <button type="button" class="admin-btn-action" data-edit-product="${p.id}">Edit</button>
              <button type="button" class="admin-btn-action" data-stock-product="${p.id}">Stock</button>
              <button type="button" class="admin-btn-action admin-btn-action--danger" data-delete-product="${p.id}">Delete</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Wire action buttons
    tbody.querySelectorAll('[data-edit-product]').forEach(btn => {
      btn.addEventListener('click', () => editProduct(btn.dataset.editProduct));
    });

    tbody.querySelectorAll('[data-stock-product]').forEach(btn => {
      btn.addEventListener('click', () => openStockModal(btn.dataset.stockProduct));
    });

    tbody.querySelectorAll('[data-toggle-avail]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const prodId = btn.dataset.toggleAvail;
        if (useApi) {
          try {
            await API.toggleProductVisibility(prodId);
            await loadLiveProducts();
            renderProducts();
            showAdminToast('Product visibility updated.');
            return;
          } catch (err) {
            showAdminToast('Failed to update product visibility.', 'error');
            return;
          }
        }
        const prod = data.products.find(x => x.id === prodId);
        if (prod) {
          prod.availability = prod.availability === 'AVAILABLE' ? 'NOT_AVAILABLE' : 'AVAILABLE';
          renderProducts();
          showAdminToast(`Product availability updated for ${prod.name}`);
        }
      });
    });

    tbody.querySelectorAll('[data-delete-product]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const prodId = btn.dataset.deleteProduct;
        if (!confirm('Are you sure you want to delete this product?')) return;
        if (useApi) {
          try {
            await API.deleteProduct(prodId);
            await loadLiveProducts();
            renderProducts();
            showAdminToast('Product deleted successfully.');
            return;
          } catch (err) {
            showAdminToast('Failed to delete product.', 'error');
            return;
          }
        }
        const idx = data.products.findIndex(x => x.id === prodId);
        if (idx !== -1) {
          const removed = data.products.splice(idx, 1)[0];
          renderProducts();
          showAdminToast(`Product "${removed.name}" removed.`);
        }
      });
    });
  }

  function resetProductForm() {
    const form = document.getElementById('productForm');
    if (form) form.reset();
    const idInput = document.getElementById('productFormId');
    if (idInput) idInput.value = '';
    const title = document.getElementById('productModalTitle');
    if (title) title.textContent = 'Add New Product';
    currentProductImages = [];
    renderProductGallery();
    const urlInput = document.getElementById('productImageUrlInput');
    if (urlInput) urlInput.value = '';
    const fileInput = document.getElementById('productFileInput');
    if (fileInput) fileInput.value = '';
  }

  function editProduct(id) {
    const prod = data.products.find(p => p.id === id);
    if (!prod) return;

    document.getElementById('productFormId').value = prod.id;
    document.getElementById('productName').value = prod.name;
    document.getElementById('productBrand').value = prod.brand;
    document.getElementById('productCategory').value = prod.category;
    document.getElementById('productPrice').value = prod.price;
    document.getElementById('productStock').value = prod.stock;
    document.getElementById('productSlug').value = prod.slug;
    document.getElementById('productAvailability').value = prod.availability;
    document.getElementById('productDescription').value = prod.description || '';

    // Populate images
    if (Array.isArray(prod.images) && prod.images.length > 0) {
      currentProductImages = prod.images.map(img => {
        if (typeof img === 'string') {
          return { url: img, isPrimary: img === prod.primaryImage };
        }
        return { url: img.url, isPrimary: !!img.isPrimary };
      });
    } else if (prod.primaryImage || prod.image) {
      currentProductImages = [{ url: prod.primaryImage || prod.image, isPrimary: true }];
    } else {
      currentProductImages = [];
    }

    renderProductGallery();

    document.getElementById('productModalTitle').textContent = 'Edit Product Details';
    openModal('productModal');
  }

  const saveProductBtn = document.getElementById('saveProductBtn');
  if (saveProductBtn) {
    saveProductBtn.addEventListener('click', async () => {
      const id = document.getElementById('productFormId').value;
      const name = document.getElementById('productName').value.trim();
      const brand = document.getElementById('productBrand').value.trim();
      const category = document.getElementById('productCategory').value;
      const price = Number(document.getElementById('productPrice').value) || 0;
      const stock = Number(document.getElementById('productStock').value) || 0;
      const slug = document.getElementById('productSlug').value.trim();
      const availability = document.getElementById('productAvailability').value;
      const description = document.getElementById('productDescription').value.trim();

      if (!name || !brand || !slug || price <= 0) {
        alert('Please fill in product name, brand, price and slug.');
        return;
      }

      let status = 'In Stock';
      if (stock === 0) status = 'Out of Stock';
      else if (stock < 5) status = 'Low Stock';

      const primaryImgUrl = currentProductImages.find(x => x.isPrimary)?.url || currentProductImages[0]?.url || '';
      const productImages = currentProductImages.map(x => ({ url: x.url, isPrimary: !!x.isPrimary }));

      if (useApi) {
        try {
          const payload = {
            name,
            brand,
            category,
            price,
            stock,
            slug,
            availability,
            description,
            images: productImages
          };
          if (id) {
            await API.updateProduct(id, payload);
            showAdminToast(`Product "${name}" updated successfully.`);
          } else {
            await API.createProduct(payload);
            showAdminToast(`Product "${name}" created successfully.`);
          }
          await loadLiveProducts();
          closeModal('productModal');
          renderProducts();
          return;
        } catch (err) {
          showAdminToast(`Error saving product: ${err.message}`, 'error');
          return;
        }
      }

      if (id) {
        const prod = data.products.find(p => p.id === id);
        if (prod) {
          Object.assign(prod, {
            name,
            brand,
            category,
            price,
            stock,
            slug,
            availability,
            description,
            status,
            images: productImages,
            primaryImage: primaryImgUrl
          });
          showAdminToast(`Product "${prod.name}" updated successfully.`);
        }
      } else {
        const newProduct = {
          id: 'PRD-' + String(100 + data.products.length + 1),
          name,
          brand,
          category,
          price,
          originalPrice: price,
          stock,
          minStockThreshold: 4,
          status,
          availability,
          slug,
          rating: 5.0,
          description,
          images: productImages,
          primaryImage: primaryImgUrl
        };
        data.products.unshift(newProduct);
        showAdminToast(`New product "${name}" added to catalogue.`);
      }

      closeModal('productModal');
      renderProducts();
    });
  }

  // Stock Modal operations
  function openStockModal(id) {
    const prod = data.products.find(p => p.id === id);
    if (!prod) return;

    document.getElementById('stockProductId').value = prod.id;
    document.getElementById('stockProductName').textContent = `${prod.name} (${prod.brand})`;
    document.getElementById('stockQuantityInput').value = prod.stock;
    document.getElementById('stockStatusSelect').value = prod.status;

    openModal('stockModal');
  }

  const stockIncBtn = document.getElementById('stockIncBtn');
  const stockDecBtn = document.getElementById('stockDecBtn');
  const stockQtyInput = document.getElementById('stockQuantityInput');

  if (stockIncBtn && stockQtyInput) {
    stockIncBtn.addEventListener('click', () => {
      stockQtyInput.value = Number(stockQtyInput.value) + 1;
      updateStockStatusAuto();
    });
  }
  if (stockDecBtn && stockQtyInput) {
    stockDecBtn.addEventListener('click', () => {
      const val = Number(stockQtyInput.value);
      if (val > 0) stockQtyInput.value = val - 1;
      updateStockStatusAuto();
    });
  }

  function updateStockStatusAuto() {
    const val = Number(stockQtyInput.value) || 0;
    const select = document.getElementById('stockStatusSelect');
    if (!select) return;
    if (val === 0) select.value = 'Out of Stock';
    else if (val < 5) select.value = 'Low Stock';
    else select.value = 'In Stock';
  }

  if (stockQtyInput) {
    stockQtyInput.addEventListener('input', updateStockStatusAuto);
  }

  const saveStockBtn = document.getElementById('saveStockBtn');
  if (saveStockBtn) {
    saveStockBtn.addEventListener('click', async () => {
      const id = document.getElementById('stockProductId').value;
      const stock = Number(document.getElementById('stockQuantityInput').value) || 0;
      const status = document.getElementById('stockStatusSelect').value;
      const availability = (status === 'Out of Stock' || stock === 0) ? 'NOT_AVAILABLE' : 'AVAILABLE';

      if (useApi) {
        try {
          await API.updateProduct(id, { stock, availability });
          const prod = data.products.find(p => p.id === id);
          if (prod) {
            prod.stock = stock;
            prod.status = status;
            prod.availability = availability;
          }
          showAdminToast(`Stock updated to ${stock} units (${status}) for "${prod ? prod.name : 'Product'}"`);
          closeModal('stockModal');
          await loadLiveProducts();
          renderProducts();
          initDashboard();
          return;
        } catch (err) {
          showAdminToast(`Failed to update stock: ${err.message}`, 'error');
          return;
        }
      }

      const prod = data.products.find(p => p.id === id);
      if (prod) {
        prod.stock = stock;
        prod.status = status;
        if (stock === 0) prod.availability = 'NOT_AVAILABLE';
        showAdminToast(`Stock updated to ${stock} units for "${prod.name}"`);
        closeModal('stockModal');
        renderProducts();
        initDashboard();
      }
    });
  }

  /* =========================================================================
     7. REGISTERED USERS CONTROLLER (DATABASE BACKED)
     ========================================================================= */

  let registeredUsersData = [];

  function formatAdminDate(dateStr) {
    if (!dateStr) return 'Recent';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  }

  function formatAdminDateTimeIST(dateStr) {
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

  function escapeAdminHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatAdminCurrency(amount) {
    const num = Number(amount) || 0;
    return '₹' + num.toLocaleString('en-IN');
  }

  async function loadUsersFromDb() {
    try {
      const res = await fetch('/api/admin/users?limit=100');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          registeredUsersData = json.data;
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to fetch /api/admin/users from database:', e);
    }
    // Fallback to mock data if API is unreachable
    registeredUsersData = (data.users || []).map(u => ({
      id: u.id,
      username: u.name,
      email: u.email,
      phone_number: u.phone,
      gender: u.gender,
      role: u.role,
      created_at: u.joinedDate,
      orderCount: u.ordersCount,
      addresses: u.addresses || []
    }));
  }

  async function renderUsers() {
    const tbody = document.getElementById('usersTableBody');
    const emptyState = document.getElementById('usersEmptyState');
    const searchInput = document.getElementById('userSearchInput');
    const roleFilter = document.getElementById('userRoleFilter');
    const countDisplay = document.getElementById('usersCountDisplay');

    if (!tbody) return;

    if (registeredUsersData.length === 0) {
      await loadUsersFromDb();
    }

    const query = (searchInput?.value || '').trim().toLowerCase();
    const role = roleFilter?.value || 'all';

    const filtered = registeredUsersData.filter(u => {
      const name = (u.username || u.name || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      const phone = (u.phone_number || u.phone || '').toLowerCase();
      const matchQuery = name.includes(query) || email.includes(query) || phone.includes(query);
      const matchRole = role === 'all' || u.role === role;
      return matchQuery && matchRole;
    });

    if (countDisplay) countDisplay.textContent = registeredUsersData.length;

    if (filtered.length === 0) {
      tbody.innerHTML = '';
      if (emptyState) emptyState.style.display = 'flex';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    tbody.innerHTML = filtered.map(u => {
      const displayName = u.username || u.name || 'User';
      const initials = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';
      const phoneDisplay = u.phone_number || u.phone || 'N/A';
      const orders = u.orderCount !== undefined ? u.orderCount : (u.ordersCount || 0);
      const joinedFormatted = formatAdminDate(u.created_at || u.joinedDate);
      const genderDisplay = u.gender ? u.gender.replace(/_/g, ' ') : 'Not specified';

      return `
        <tr data-user-id="${u.id}">
          <td>
            <div class="admin-cell-user">
              <div class="admin-cell-user__avatar">${initials}</div>
              <div>
                <strong style="color:var(--color-text-primary);">${displayName}</strong>
                <div style="font-size:var(--text-xs); color:var(--color-text-muted);">${genderDisplay}</div>
              </div>
            </div>
          </td>
          <td><span style="font-family:var(--font-mono); font-size:var(--text-xs);">${u.email}</span></td>
          <td>${phoneDisplay}</td>
          <td>
            <span class="badge ${u.role === 'ADMIN' ? 'badge--accent' : 'badge--primary'}">
              ${u.role}
            </span>
          </td>
          <td style="font-size:var(--text-xs); color:var(--color-text-muted);">${joinedFormatted}</td>
          <td><strong>${orders}</strong> orders</td>
          <td>
            <span class="badge badge--success">Active</span>
          </td>
          <td>
            <button type="button" class="admin-btn-action" data-view-user="${u.id}">
              <span>View Profile</span>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('[data-view-user]').forEach(btn => {
      btn.addEventListener('click', () => openUserDrawer(btn.dataset.viewUser));
    });
  }

  // Hook up user search and role filter listeners
  const userSearchInput = document.getElementById('userSearchInput');
  const userRoleFilter = document.getElementById('userRoleFilter');
  const resetUserFiltersBtn = document.getElementById('resetUserFiltersBtn');

  if (userSearchInput) {
    userSearchInput.addEventListener('input', () => renderUsers());
  }
  if (userRoleFilter) {
    userRoleFilter.addEventListener('change', () => renderUsers());
  }
  if (resetUserFiltersBtn) {
    resetUserFiltersBtn.addEventListener('click', () => {
      if (userSearchInput) userSearchInput.value = '';
      if (userRoleFilter) userRoleFilter.value = 'all';
      renderUsers();
    });
  }

  async function openUserDrawer(userId) {
    let user = registeredUsersData.find(u => u.id === userId);
    try {
      if (useApi) {
        const json = await API.getUserDetail(userId);
        if (json && json.success && json.data) {
          user = { ...user, ...json.data };
        }
      } else {
        const res = await fetch(`/api/admin/users/${userId}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            user = { ...user, ...json.data };
          }
        }
      }
    } catch (e) {
      console.warn('Could not fetch user details:', e);
    }

    if (!user) return;

    const drawerBody = document.getElementById('userDrawerBody');
    const drawer = document.getElementById('userDrawer');
    const overlay = document.getElementById('userDrawerOverlay');

    if (!drawerBody || !drawer || !overlay) return;

    const displayName = user.username || user.name || 'User';
    const initials = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';
    const joinedFormatted = formatAdminDate(user.created_at || user.joinedDate);
    const phoneDisplay = user.phone_number || user.phone || 'Not provided';
    const ordersCount = user.orderCount !== undefined ? user.orderCount : (user.ordersCount || (user.orders ? user.orders.length : 0));
    const totalSpent = user.totalSpent !== undefined ? formatAdminCurrency(user.totalSpent) : (user.totalSpentFormatted || '₹0');
    const addresses = user.addresses || [];

    drawerBody.innerHTML = `
      <!-- User Summary Card -->
      <div style="display:flex; align-items:center; gap:var(--space-4); padding:var(--space-4); background:var(--color-bg-secondary); border-radius:var(--radius-xl); border:1px solid var(--color-border-light);">
        <div style="width:52px; height:52px; border-radius:50%; background:var(--color-primary-700); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:var(--font-bold); font-size:var(--text-lg);">
          ${initials}
        </div>
        <div>
          <h4 style="font-size:var(--text-lg); font-weight:var(--font-bold); margin:0;">${displayName}</h4>
          <span style="font-size:var(--text-xs); color:var(--color-text-muted);">Customer ID: ${user.id}</span>
        </div>
      </div>

      <!-- Account Details -->
      <div>
        <h5 style="font-size:var(--text-xs); font-weight:var(--font-bold); color:var(--color-text-muted); text-transform:uppercase; letter-spacing:var(--tracking-wider); margin-bottom:var(--space-3);">
          Contact & Profile
        </h5>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:var(--space-3); font-size:var(--text-sm);">
          <div>
            <span style="color:var(--color-text-muted); font-size:var(--text-xs); display:block;">Email Address</span>
            <strong>${user.email}</strong>
          </div>
          <div>
            <span style="color:var(--color-text-muted); font-size:var(--text-xs); display:block;">Phone Number</span>
            <strong>${phoneDisplay}</strong>
          </div>
          <div>
            <span style="color:var(--color-text-muted); font-size:var(--text-xs); display:block;">Account Role</span>
            <span class="badge ${user.role === 'ADMIN' ? 'badge--accent' : 'badge--primary'}">${user.role}</span>
          </div>
          <div>
            <span style="color:var(--color-text-muted); font-size:var(--text-xs); display:block;">Date Registered</span>
            <strong>${joinedFormatted}</strong>
          </div>
        </div>
      </div>

      <!-- Purchasing Activity -->
      <div>
        <h5 style="font-size:var(--text-xs); font-weight:var(--font-bold); color:var(--color-text-muted); text-transform:uppercase; letter-spacing:var(--tracking-wider); margin-bottom:var(--space-3);">
          Purchasing Activity
        </h5>
        <div style="display:flex; gap:var(--space-4);">
          <div style="flex:1; padding:var(--space-4); background:var(--color-bg-secondary); border-radius:var(--radius-lg); border:1px solid var(--color-border-light);">
            <span style="font-size:var(--text-xs); color:var(--color-text-muted);">Total Completed Orders</span>
            <div style="font-size:var(--text-2xl); font-weight:var(--font-extrabold); color:var(--color-primary-700);">${ordersCount}</div>
          </div>
          <div style="flex:1; padding:var(--space-4); background:var(--color-bg-secondary); border-radius:var(--radius-lg); border:1px solid var(--color-border-light);">
            <span style="font-size:var(--text-xs); color:var(--color-text-muted);">Lifetime Spend</span>
            <div style="font-size:var(--text-2xl); font-weight:var(--font-extrabold); color:var(--color-accent-600);">${totalSpent}</div>
          </div>
        </div>
      </div>

      <!-- Saved Delivery Addresses -->
      <div>
        <h5 style="font-size:var(--text-xs); font-weight:var(--font-bold); color:var(--color-text-muted); text-transform:uppercase; letter-spacing:var(--tracking-wider); margin-bottom:var(--space-3);">
          Saved Addresses (${addresses.length})
        </h5>
        ${addresses.length === 0 ? '<p style="font-size:var(--text-xs); color:var(--color-text-muted);">No addresses saved yet.</p>' : addresses.map(a => `
          <div style="padding:var(--space-3) var(--space-4); background:var(--color-bg-secondary); border-radius:var(--radius-lg); border:1px solid var(--color-border-light); margin-bottom:var(--space-2); font-size:var(--text-sm);">
            <strong style="color:var(--color-primary-700);">${a.full_name || a.name || 'Address'}</strong>
            <p style="margin:4px 0 0 0; color:var(--color-text-secondary);">${a.address_line_1 || a.line1 || ''}, ${a.city || ''}, ${a.state || ''} — ${a.postal_code || a.pincode || ''}</p>
          </div>
        `).join('')}
      </div>

      <!-- Placed Orders by User -->
      <div>
        <h5 style="font-size:var(--text-xs); font-weight:var(--font-bold); color:var(--color-text-muted); text-transform:uppercase; letter-spacing:var(--tracking-wider); margin-bottom:var(--space-3);">
          Placed Orders (${(user.orders || []).length})
        </h5>
        ${(!user.orders || user.orders.length === 0) ? '<p style="font-size:var(--text-xs); color:var(--color-text-muted);">No orders placed yet.</p>' : user.orders.map(order => `
          <div style="padding:var(--space-3) var(--space-4); background:var(--color-bg-secondary); border-radius:var(--radius-lg); border:1px solid var(--color-border-light); margin-bottom:var(--space-3); font-size:var(--text-sm);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-2); padding-bottom:var(--space-2); border-bottom:1px solid var(--color-border-light);">
              <div>
                <strong style="color:var(--color-primary-700); font-size:var(--text-sm);">${order.shortId || order.id}</strong>
                <span style="font-size:11px; color:var(--color-text-muted); margin-left:8px;">${formatAdminDate(order.createdAt)}</span>
              </div>
              <span class="badge ${order.status === 'DELIVERED' ? 'badge--success' : (order.status === 'PROCESSING' ? 'badge--warning' : 'badge--primary')}" style="font-size:10px;">${order.status}</span>
            </div>
            
            <!-- Products List (Product ID & Product Name) -->
            <div style="display:flex; flex-direction:column; gap:6px;">
              ${(order.items && order.items.length > 0) ? order.items.map(item => `
                <div style="background:#ffffff; padding:6px 10px; border-radius:var(--radius-md); border:1px solid var(--color-border-light); font-size:12px;">
                  <div style="font-weight:600; color:var(--color-text-primary);">${item.productName}</div>
                  <div style="font-size:11px; color:var(--color-text-muted); font-family:monospace; margin-top:2px;">
                    <span style="color:var(--color-primary-600); font-weight:500;">Product ID:</span> ${item.productId || 'N/A'}
                  </div>
                </div>
              `).join('') : '<span style="font-size:11px; color:var(--color-text-muted);">No products in this order</span>'}
            </div>
          </div>
        `).join('')}
      </div>
    `;

    drawer.classList.add('open');
    overlay.classList.add('open');
  }

  function closeUserDrawer() {
    const drawer = document.getElementById('userDrawer');
    const overlay = document.getElementById('userDrawerOverlay');
    if (drawer) drawer.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
  }

  const userDrawerCloseBtn = document.getElementById('userDrawerClose');
  const userDrawerOverlay = document.getElementById('userDrawerOverlay');
  if (userDrawerCloseBtn) userDrawerCloseBtn.addEventListener('click', closeUserDrawer);
  if (userDrawerOverlay) userDrawerOverlay.addEventListener('click', closeUserDrawer);

  /* =========================================================================
     8. ORDER MANAGEMENT CONTROLLER
     ========================================================================= */

  let currentOrderFilter = 'all';
  let currentOrderSort = 'date-desc';
  let liveOrdersLoaded = false;

  const ORDER_STATUS_RANK = {
    'processing': 1,
    'confirmed': 2,
    'out_for_delivery': 3,
    'delivered': 4,
    'cancelled': 5
  };

  async function loadLiveOrders() {
    if (!useApi) return;
    try {
      const res = await API.getOrders({ limit: 100 });
      if (res && res.success && Array.isArray(res.data)) {
        data.orders = res.data.map(o => {
          const custName = o.user?.username || (o.user?.email ? o.user.email.split('@')[0] : 'Customer');
          const custEmail = o.user?.email || '';
          const custPhone = o.user?.phone_number || '-';
          const items = (o.items || []).map(i => ({
            name: i.productName || 'Product',
            variant: i.variantDescription || 'Standard',
            quantity: i.quantity || 1,
            unitPrice: parseFloat(i.unitPrice) || 0,
            subtotal: parseFloat(i.lineTotal) || ((parseFloat(i.unitPrice) || 0) * (i.quantity || 1))
          }));

          return {
            id: o.id,
            shortId: o.shortId,
            customer: {
              name: custName,
              email: custEmail,
              phone: custPhone
            },
            items: items.length > 0 ? items : [{ name: 'Order Item', variant: 'Standard', quantity: o.itemCount || 1, subtotal: parseFloat(o.totalAmount) || 0 }],
            totalAmount: parseFloat(o.totalAmount) || 0,
            subtotal: parseFloat(o.subtotal) || parseFloat(o.totalAmount) || 0,
            paymentMethod: o.paymentMethod || 'Online',
            paymentStatus: o.paymentStatus || 'Paid',
            status: (o.status || 'PENDING').toLowerCase(),
            shippingAddress: o.shippingAddress || 'Registered Address',
            createdAt: o.createdAt ? new Date(o.createdAt).getTime() : 0,
            date: formatAdminDate(o.createdAt)
          };
        });
        liveOrdersLoaded = true;
        updateOrderFilterCounts();
      }
    } catch (e) {
      console.warn('Could not load live orders from API:', e);
    }
  }

  function updateOrderFilterCounts() {
    const counts = {
      all: (data.orders || []).length,
      processing: 0,
      confirmed: 0,
      out_for_delivery: 0,
      delivered: 0,
      cancelled: 0
    };
    (data.orders || []).forEach(o => {
      const st = (o.status || '').toLowerCase();
      if (counts[st] !== undefined) counts[st]++;
    });

    const setEl = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setEl('filterCountAll', counts.all);
    setEl('filterCountProcessing', counts.processing);
    setEl('filterCountConfirmed', counts.confirmed);
    setEl('filterCountOutForDelivery', counts.out_for_delivery);
    setEl('filterCountDelivered', counts.delivered);
    setEl('filterCountCancelled', counts.cancelled);
  }

  async function renderOrders() {
    const tbody = document.getElementById('ordersTableBody');
    const emptyState = document.getElementById('ordersEmptyState');
    const searchInput = document.getElementById('orderSearchInput');
    const countDisplay = document.getElementById('ordersCountDisplay');

    if (!tbody) return;

    if (useApi && !liveOrdersLoaded) {
      await loadLiveOrders();
    }

    updateOrderFilterCounts();

    const query = (searchInput?.value || '').trim().toLowerCase();

    const filtered = data.orders.filter(o => {
      const matchQuery = (o.id || '').toLowerCase().includes(query) ||
                         (o.shortId || '').toLowerCase().includes(query) ||
                         (o.customer?.name || '').toLowerCase().includes(query) ||
                         (o.customer?.phone || '').includes(query);
      const matchFilter = currentOrderFilter === 'all' || o.status === currentOrderFilter;
      return matchQuery && matchFilter;
    });

    // Sort according to payment, order status, date
    filtered.sort((a, b) => {
      switch (currentOrderSort) {
        case 'date-desc':
          return (b.createdAt || 0) - (a.createdAt || 0);
        case 'date-asc':
          return (a.createdAt || 0) - (b.createdAt || 0);
        case 'status-asc': {
          const rankA = ORDER_STATUS_RANK[a.status] || 99;
          const rankB = ORDER_STATUS_RANK[b.status] || 99;
          return rankA - rankB;
        }
        case 'status-desc': {
          const rankA = ORDER_STATUS_RANK[a.status] || 99;
          const rankB = ORDER_STATUS_RANK[b.status] || 99;
          return rankB - rankA;
        }
        case 'payment-status': {
          const pA = (a.paymentStatus || '').toLowerCase();
          const pB = (b.paymentStatus || '').toLowerCase();
          return pA.localeCompare(pB);
        }
        case 'payment-high':
          return (b.totalAmount || 0) - (a.totalAmount || 0);
        case 'payment-low':
          return (a.totalAmount || 0) - (b.totalAmount || 0);
        default:
          return (b.createdAt || 0) - (a.createdAt || 0);
      }
    });

    if (countDisplay) countDisplay.textContent = filtered.length;

    if (filtered.length === 0) {
      tbody.innerHTML = '';
      if (emptyState) emptyState.style.display = 'flex';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    tbody.innerHTML = filtered.map(o => {
      const itemsSummary = o.items.map(i => `${i.name} (x${i.quantity})`).join(', ');

      return `
        <tr data-order-id="${o.id}">
          <td>
            <strong style="font-family:var(--font-mono); color:var(--color-primary-700);">${o.shortId}</strong>
            <div style="font-size:11px; color:var(--color-text-muted);">${o.id}</div>
          </td>
          <td>
            <strong>${o.customer.name}</strong>
            <div style="font-size:var(--text-xs); color:var(--color-text-muted);">${o.customer.phone}</div>
          </td>
          <td style="max-width:240px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${itemsSummary}">
            ${itemsSummary}
          </td>
          <td><strong>${formatRupees(o.totalAmount)}</strong></td>
          <td>
            <span style="font-size:var(--text-xs);">${o.paymentMethod}</span>
            <div style="font-size:11px; color:${o.paymentStatus === 'Paid' ? 'var(--color-success-600)' : 'var(--color-accent-600)'}; font-weight:var(--font-bold);">
              ${o.paymentStatus}
            </div>
          </td>
          <td>
            <span class="order-status order-status--${o.status}">
              <span class="order-status__dot"></span>
              ${capitalize(o.status.replace(/_/g, ' '))}
            </span>
          </td>
          <td style="font-size:var(--text-xs); color:var(--color-text-muted);">${o.date}</td>
          <td>
            <button type="button" class="admin-btn-action" data-view-order="${o.id}">
              <span>View & Manage</span>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('[data-view-order]').forEach(btn => {
      btn.addEventListener('click', () => openOrderDrawer(btn.dataset.viewOrder));
    });
  }

  async function openOrderDrawer(orderId) {
    let order = data.orders.find(o => o.id === orderId);

    if (useApi) {
      try {
        const res = await API.getOrderDetail(orderId);
        if (res && res.success && res.data) {
          const o = res.data;
          order = {
            id: o.id,
            shortId: o.shortId,
            customer: {
              name: o.user?.username || o.user?.email || 'Customer',
              email: o.user?.email || '',
              phone: o.user?.phone_number || '-'
            },
            items: (o.items || []).map(i => ({
              productId: i.productId,
              name: i.productName || 'Product',
              variant: i.variantDescription || 'Standard',
              quantity: i.quantity || 1,
              unitPrice: parseFloat(i.unitPrice) || 0,
              subtotal: parseFloat(i.lineTotal) || ((parseFloat(i.unitPrice) || 0) * (i.quantity || 1)),
              review: i.review || null
            })),
            reviews: o.reviews || [],
            subtotal: parseFloat(o.subtotal) || parseFloat(o.totalAmount) || 0,
            totalAmount: parseFloat(o.totalAmount) || 0,
            paymentMethod: o.paymentMethod || 'Online',
            paymentStatus: o.paymentStatus || 'Paid',
            status: (o.status || 'PENDING').toLowerCase(),
            shippingAddress: o.shippingAddress || 'Registered Address',
            cancelReason: o.cancelReason || null,
            cancelledBy: o.cancelledBy || null,
            cancelledAt: o.cancelledAt || null,
            date: formatAdminDate(o.createdAt),
            createdAt: o.createdAt
          };
        }
      } catch (e) {
        console.warn('Could not fetch fresh order detail from API:', e);
      }
    }

    if (!order) return;

    const drawerBody = document.getElementById('orderDrawerBody');
    const drawer = document.getElementById('orderDrawer');
    const overlay = document.getElementById('orderDrawerOverlay');

    if (!drawerBody || !drawer || !overlay) return;

    // Render Cancellation Banner if order was cancelled
    let cancellationBannerHtml = '';
    if (order.status === 'cancelled') {
      const isUserCancel = (order.cancelledBy || '').toUpperCase() === 'USER';
      const badgeLabel = isUserCancel ? 'Cancelled by Customer' : 'Cancelled by Store (Admin)';
      const badgeColor = isUserCancel ? '#b45309' : '#b91c1c';
      const badgeBg = isUserCancel ? '#fef3c7' : '#fee2e2';
      const badgeBorder = isUserCancel ? '#fde68a' : '#fecaca';
      const reasonText = order.cancelReason || (isUserCancel ? 'No reason provided by customer.' : 'Cancelled by store administrator.');
      const formattedCancelTime = formatAdminDateTimeIST(order.cancelledAt || order.createdAt || order.date);

      cancellationBannerHtml = `
        <div style="padding:var(--space-3) var(--space-4); background:${badgeBg}; border:1px solid ${badgeBorder}; border-radius:var(--radius-lg); margin-top:var(--space-1);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; flex-wrap:wrap; gap:4px;">
            <span style="display:inline-flex; align-items:center; gap:6px; font-weight:var(--font-bold); font-size:var(--text-xs); text-transform:uppercase; letter-spacing:0.5px; color:${badgeColor};">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
              ${badgeLabel}
            </span>
            <span style="font-size:11px; color:var(--color-text-muted);">
              ${formattedCancelTime}
            </span>
          </div>
          <div style="font-size:var(--text-xs); color:#1f2937;">
            <strong>Cancellation Reason:</strong>
            <span style="color:${isUserCancel ? '#92400e' : '#991b1b'}; font-weight:500;">"${escapeAdminHtml(reasonText)}"</span>
          </div>
        </div>
      `;
    }

    // Render Review Section Content based on order fulfillment status
    let reviewsHtml = '';
    if (order.status === 'cancelled') {
      const isUserCancel = (order.cancelledBy || '').toUpperCase() === 'USER';
      const who = isUserCancel ? 'the customer' : 'the store administrator';
      reviewsHtml = `
        <div style="padding:var(--space-4); background:#fef2f2; border:1px solid #fecaca; border-radius:var(--radius-lg); color:#991b1b; font-size:var(--text-sm);">
          <div style="display:flex; align-items:center; gap:var(--space-2); font-weight:var(--font-bold); margin-bottom:4px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
            Order Cancelled
          </div>
          <p style="margin:0; font-size:var(--text-xs); color:#b91c1c;">
            This order was cancelled by ${who}. Reviews cannot be submitted for cancelled orders.
          </p>
        </div>
      `;
    } else if (order.status === 'delivered') {
      reviewsHtml = `
        <div style="display:flex; flex-direction:column; gap:var(--space-3);">
          ${order.items.map(item => {
            if (item.review) {
              const ratingNum = Math.min(5, Math.max(1, Math.round(item.review.rating || 0)));
              const stars = '★'.repeat(ratingNum) + '☆'.repeat(5 - ratingNum);
              return `
                <div style="background:#ffffff; border:1px solid var(--color-border-light); border-left:4px solid var(--color-success-600); border-radius:var(--radius-lg); padding:var(--space-3) var(--space-4); box-shadow:var(--shadow-xs);">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                    <span style="font-weight:var(--font-bold); font-size:var(--text-sm); color:var(--color-text-primary);">${item.name}</span>
                    <span style="color:#f59e0b; font-size:var(--text-sm); font-weight:var(--font-bold); letter-spacing:1px;" title="${item.review.rating} out of 5 stars">
                      ${stars} <span style="font-size:var(--text-xs); color:var(--color-text-muted); font-weight:var(--font-normal);">(${item.review.rating}/5)</span>
                    </span>
                  </div>
                  <p style="font-size:var(--text-sm); color:var(--color-text-secondary); margin:4px 0 6px 0; font-style:${item.review.comment ? 'normal' : 'italic'};">
                    ${item.review.comment ? `"${item.review.comment}"` : 'No written feedback provided with this rating.'}
                  </p>
                  <div style="font-size:11px; color:var(--color-text-muted);">
                    Reviewed by <strong>${order.customer.name}</strong> &bull; ${formatAdminDateTimeIST(item.review.createdAt)}
                  </div>
                </div>
              `;
            } else {
              return `
                <div style="background:var(--color-bg-secondary); border:1px dashed var(--color-border-light); border-radius:var(--radius-lg); padding:var(--space-3) var(--space-4); font-size:var(--text-xs); color:var(--color-text-muted); display:flex; justify-content:space-between; align-items:center;">
                  <span>${item.name}</span>
                  <span class="badge" style="background:#f3f4f6; color:#6b7280; font-size:11px;">No review submitted yet</span>
                </div>
              `;
            }
          }).join('')}
        </div>
      `;
    } else {
      reviewsHtml = `
        <div style="padding:var(--space-4); background:var(--color-primary-50); border:1px solid var(--color-primary-200); border-radius:var(--radius-lg); color:var(--color-primary-900); font-size:var(--text-xs);">
          <div style="display:flex; align-items:center; gap:var(--space-2); font-weight:var(--font-bold); margin-bottom:2px;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            Fulfillment In Progress
          </div>
          Customer review will unlock once order fulfillment status is marked as <strong>Delivered</strong>.
        </div>
      `;
    }

    const drawerFooter = document.getElementById('orderDrawerFooter');

    drawerBody.innerHTML = `
      <!-- Order Top Summary Card (Clean, unnested) -->
      <div style="background:#ffffff; border-radius:var(--radius-xl); border:1px solid var(--color-border-light); padding:var(--space-4); display:flex; justify-content:space-between; align-items:center; box-shadow:var(--shadow-xs);">
        <div>
          <span style="font-family:var(--font-mono); font-weight:var(--font-extrabold); font-size:var(--text-lg); color:var(--color-primary-700); letter-spacing:-0.5px;">${order.shortId}</span>
          <div style="font-size:var(--text-xs); color:var(--color-text-muted); margin-top:2px;">Placed on ${formatAdminDateTimeIST(order.createdAt || order.date)}</div>
        </div>
        <span class="order-status order-status--${order.status}">
          <span class="order-status__dot"></span>
          ${capitalize(order.status.replace(/_/g, ' '))}
        </span>
      </div>

      ${cancellationBannerHtml}

      <!-- Customer & Shipping -->
      <div>
        <h5 style="font-size:var(--text-xs); font-weight:var(--font-bold); color:var(--color-text-muted); text-transform:uppercase; letter-spacing:var(--tracking-wider); margin-bottom:var(--space-3);">
          Customer & Delivery Address
        </h5>
        <div style="padding:var(--space-4); background:#ffffff; border-radius:var(--radius-lg); border:1px solid var(--color-border-light); font-size:var(--text-sm); box-shadow:var(--shadow-xs);">
          <strong style="font-size:var(--text-base); color:var(--color-text-primary); display:block; margin-bottom:4px;">${order.customer.name}</strong>
          <div style="color:var(--color-text-secondary); margin-bottom:var(--space-2); font-size:var(--text-xs);">
            <span>📞 ${order.customer.phone}</span> &bull; <span>✉️ ${order.customer.email}</span>
          </div>
          <div style="color:var(--color-text-secondary); padding-top:var(--space-2); border-top:1px dashed var(--color-border-light); font-size:var(--text-xs); display:flex; gap:6px;">
            <span>📍</span> <span>${order.shippingAddress}</span>
          </div>
        </div>
      </div>

      <!-- Items Breakdown -->
      <div>
        <h5 style="font-size:var(--text-xs); font-weight:var(--font-bold); color:var(--color-text-muted); text-transform:uppercase; letter-spacing:var(--tracking-wider); margin-bottom:var(--space-3);">
          Order Items (${order.items.length})
        </h5>
        <div style="background:#ffffff; border-radius:var(--radius-lg); border:1px solid var(--color-border-light); padding:0 var(--space-4); box-shadow:var(--shadow-xs);">
          ${order.items.map((item, idx) => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:var(--space-3) 0; ${idx !== order.items.length - 1 ? 'border-bottom:1px solid var(--color-border-light);' : ''}">
              <div>
                <strong style="font-size:var(--text-sm); color:var(--color-text-primary);">${item.name}</strong>
                <div style="font-size:var(--text-xs); color:var(--color-text-muted);">${item.variant} &bull; Qty: ${item.quantity}</div>
              </div>
              <strong style="font-size:var(--text-sm);">${formatRupees(item.subtotal)}</strong>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Customer Reviews & Feedback Section (Directly After Order Items) -->
      <div>
        <h5 style="font-size:var(--text-xs); font-weight:var(--font-bold); color:var(--color-text-muted); text-transform:uppercase; letter-spacing:var(--tracking-wider); margin-bottom:var(--space-3); display:flex; align-items:center; justify-content:space-between;">
          <span>Customer Reviews & Feedback</span>
          ${order.status === 'delivered' ? '<span class="badge badge--success" style="font-size:10px;">Delivered Order</span>' : (order.status === 'cancelled' ? '<span class="badge" style="font-size:10px; background:#fee2e2; color:#991b1b;">Cancelled</span>' : '<span class="badge badge--warning" style="font-size:10px;">In Fulfillment</span>')}
        </h5>
        ${reviewsHtml}
      </div>

      <!-- Financial Calculation -->
      <div style="background:#ffffff; padding:var(--space-4); border-radius:var(--radius-lg); border:1px solid var(--color-border-light); font-size:var(--text-sm); box-shadow:var(--shadow-xs);">
        <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
          <span style="color:var(--color-text-muted);">Subtotal</span>
          <span>${formatRupees(order.subtotal)}</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
          <span style="color:var(--color-text-muted);">Shipping Fee</span>
          <span style="color:var(--color-success-600); font-weight:var(--font-semibold);">FREE</span>
        </div>
        <div style="display:flex; justify-content:space-between; padding-top:var(--space-3); border-top:1px solid var(--color-border-light); font-weight:var(--font-extrabold); font-size:var(--text-base);">
          <span>Total Paid</span>
          <span style="color:var(--color-primary-700);">${formatRupees(order.totalAmount)}</span>
        </div>
      </div>
    `;

    // Populate dedicated sticky Drawer Footer with Status Action Bar (Custom Dropdown)
    if (drawerFooter) {
      drawerFooter.style.display = 'flex';

      const statusMap = {
        processing: { label: 'Processing', dot: 'status-dot-indicator--processing' },
        confirmed: { label: 'Confirmed', dot: 'status-dot-indicator--confirmed' },
        out_for_delivery: { label: 'Out for Delivery', dot: 'status-dot-indicator--out_for_delivery' },
        delivered: { label: 'Delivered', dot: 'status-dot-indicator--delivered' },
        cancelled: { label: 'Cancelled', dot: 'status-dot-indicator--cancelled' }
      };

      const currentStatusKey = (order.status || 'processing').toLowerCase();
      const currentMeta = statusMap[currentStatusKey] || statusMap.processing;

      drawerFooter.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
          <label style="font-size:11px; text-transform:uppercase; font-weight:var(--font-bold); color:var(--color-text-muted); letter-spacing:var(--tracking-wider); margin:0;">
            Update Fulfillment Status
          </label>
          <span style="font-size:11px; color:var(--color-text-muted);">Current: <strong style="text-transform:capitalize; color:var(--color-text-primary);">${order.status.replace(/_/g, ' ')}</strong></span>
        </div>
        <div style="display:flex; gap:var(--space-2); align-items:center; position:relative;">
          <!-- Hidden input keeping chosen value -->
          <input type="hidden" id="drawerStatusSelect" value="${currentStatusKey}"/>

          <!-- Custom Dropdown Container (No ugly OS popups or misaligned boxes) -->
          <div class="admin-custom-select" id="drawerCustomSelect">
            <button type="button" class="admin-custom-select__trigger" id="drawerCustomSelectTrigger" aria-haspopup="listbox" aria-expanded="false">
              <span class="admin-custom-select__value" id="drawerCustomSelectValue">
                <span class="status-dot-indicator ${currentMeta.dot}"></span>
                <span>${currentMeta.label}</span>
              </span>
              <svg class="admin-custom-select__arrow" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
              </svg>
            </button>

            <!-- Popup Menu positioned with exact 100% width -->
            <div class="admin-custom-select__menu" id="drawerCustomSelectMenu" role="listbox">
              ${Object.entries(statusMap).map(([val, info]) => `
                <div class="admin-custom-select__option${val === currentStatusKey ? ' selected' : ''}" data-status-val="${val}" role="option" aria-selected="${val === currentStatusKey}">
                  <span class="admin-custom-select__option-left">
                    <span class="status-dot-indicator ${info.dot}"></span>
                    <span>${info.label}</span>
                  </span>
                  ${val === currentStatusKey ? '<svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>' : ''}
                </div>
              `).join('')}
            </div>
          </div>

          <button type="button" class="btn btn--primary btn--sm" id="updateOrderStatusBtn" data-order-id="${order.id}" style="height:42px; padding:0 var(--space-5); border-radius:var(--radius-md); font-weight:var(--font-semibold); white-space:nowrap;">
            Update
          </button>
        </div>
      `;

      // Wire custom dropdown interactivity
      const customSelect = document.getElementById('drawerCustomSelect');
      const triggerBtn = document.getElementById('drawerCustomSelectTrigger');
      const hiddenInput = document.getElementById('drawerStatusSelect');
      const valueSpan = document.getElementById('drawerCustomSelectValue');
      const options = customSelect?.querySelectorAll('.admin-custom-select__option');

      if (customSelect && triggerBtn) {
        triggerBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const isOpen = customSelect.classList.toggle('open');
          triggerBtn.setAttribute('aria-expanded', String(isOpen));
        });

        options?.forEach(opt => {
          opt.addEventListener('click', (e) => {
            e.stopPropagation();
            const val = opt.dataset.statusVal;
            const meta = statusMap[val];
            if (hiddenInput && meta) {
              hiddenInput.value = val;
              valueSpan.innerHTML = `
                <span class="status-dot-indicator ${meta.dot}"></span>
                <span>${meta.label}</span>
              `;
              options.forEach(o => {
                const isSel = o === opt;
                o.classList.toggle('selected', isSel);
                o.setAttribute('aria-selected', String(isSel));
                const checkIcon = o.querySelector('svg');
                if (isSel && !checkIcon) {
                  o.insertAdjacentHTML('beforeend', '<svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>');
                } else if (!isSel && checkIcon) {
                  checkIcon.remove();
                }
              });
            }
            customSelect.classList.remove('open');
            triggerBtn.setAttribute('aria-expanded', 'false');
          });
        });

        // Close on clicking outside
        document.addEventListener('click', (e) => {
          if (!customSelect.contains(e.target)) {
            customSelect.classList.remove('open');
            triggerBtn.setAttribute('aria-expanded', 'false');
          }
        });
      }
    }

    // Attach status update listener
    const updateBtn = document.getElementById('updateOrderStatusBtn');
    const selectEl = document.getElementById('drawerStatusSelect');
    if (updateBtn && selectEl) {
      updateBtn.addEventListener('click', () => {
        const chosenStatus = selectEl.value;
        if (chosenStatus === 'cancelled' && order.status !== 'cancelled') {
          openAdminCancelModal(order.id);
        } else {
          updateOrderStatus(order.id, chosenStatus);
        }
      });
    }

    drawer.classList.add('open');
    overlay.classList.add('open');
  }

  let pendingCancelOrderId = null;

  function openAdminCancelModal(orderId) {
    pendingCancelOrderId = orderId;
    const modal = document.getElementById('adminCancelReasonModal');
    const presetSelect = document.getElementById('adminCancelPreset');
    const customWrap = document.getElementById('adminCustomReasonWrap');
    const customInput = document.getElementById('adminCustomCancelReason');

    if (presetSelect) presetSelect.selectedIndex = 0;
    if (customInput) customInput.value = '';
    if (customWrap) customWrap.style.display = 'none';

    if (modal) {
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
    }
  }

  function initAdminCancelModal() {
    const modal = document.getElementById('adminCancelReasonModal');
    const presetSelect = document.getElementById('adminCancelPreset');
    const customWrap = document.getElementById('adminCustomReasonWrap');
    const customInput = document.getElementById('adminCustomCancelReason');
    const confirmBtn = document.getElementById('confirmAdminCancelBtn');

    if (presetSelect && customWrap) {
      presetSelect.addEventListener('change', () => {
        if (presetSelect.value === 'OTHER') {
          customWrap.style.display = 'block';
          if (customInput) customInput.focus();
        } else {
          customWrap.style.display = 'none';
        }
      });
    }

    if (confirmBtn) {
      confirmBtn.addEventListener('click', async () => {
        if (!pendingCancelOrderId) return;

        let reason = presetSelect ? presetSelect.value : '';
        if (reason === 'OTHER') {
          const customVal = customInput ? customInput.value.trim() : '';
          if (!customVal) {
            showAdminToast('Please provide a specific cancellation note.', 'warning');
            if (customInput) customInput.focus();
            return;
          }
          reason = customVal;
        }

        closeModal('adminCancelReasonModal');
        await updateOrderStatus(pendingCancelOrderId, 'cancelled', reason);
        pendingCancelOrderId = null;
      });
    }
  }

  async function updateOrderStatus(orderId, newStatus, cancelReason = null) {
    if (useApi) {
      try {
        const res = await API.updateOrderStatus(orderId, newStatus.toUpperCase(), cancelReason);
        if (res.success) {
          showAdminToast(`Order status updated to ${newStatus.replace(/_/g, ' ')}`, 'success');
          await loadLiveOrders();
          renderOrders();
          initDashboard();
          openOrderDrawer(orderId);
        }
      } catch (err) {
        showAdminToast(`Failed to update order status: ${err.message}`, 'error');
      }
      return;
    }

    // Mock implementation
    const order = data.orders.find(o => o.id === orderId);
    if (order) {
      order.status = newStatus;
      if (newStatus === 'cancelled') {
        order.cancelReason = cancelReason || 'Cancelled by store administrator';
        order.cancelledBy = 'ADMIN';
        order.cancelledAt = new Date().toISOString();
      }
      showAdminToast(`Order ${order.shortId} status updated to "${capitalize(newStatus.replace(/_/g, ' '))}".`);
      renderOrders();
      initDashboard();
      openOrderDrawer(orderId);
    }
  }

  function closeOrderDrawer() {
    const drawer = document.getElementById('orderDrawer');
    const overlay = document.getElementById('orderDrawerOverlay');
    const footer = document.getElementById('orderDrawerFooter');
    if (drawer) drawer.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    if (footer) footer.style.display = 'none';
  }

  const orderDrawerCloseBtn = document.getElementById('orderDrawerClose');
  const orderDrawerOverlay = document.getElementById('orderDrawerOverlay');
  if (orderDrawerCloseBtn) orderDrawerCloseBtn.addEventListener('click', closeOrderDrawer);
  if (orderDrawerOverlay) orderDrawerOverlay.addEventListener('click', closeOrderDrawer);

  // Status Filter Chips
  const filterChipsContainer = document.getElementById('adminOrderFilterChips');
  if (filterChipsContainer) {
    filterChipsContainer.querySelectorAll('.orders-filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        filterChipsContainer.querySelectorAll('.orders-filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        currentOrderFilter = chip.dataset.filter;
        renderOrders();
      });
    });
  }

  // Order Search Input
  const orderSearchInput = document.getElementById('orderSearchInput');
  if (orderSearchInput) {
    orderSearchInput.addEventListener('input', () => {
      renderOrders();
    });
  }

  // Order Sort Select & Clickable Column Headers
  function updateOrderSortIndicators() {
    const iconDate = document.getElementById('sortIndicatorDate');
    const iconStatus = document.getElementById('sortIndicatorStatus');
    const iconPayment = document.getElementById('sortIndicatorPayment');

    if (iconDate) { iconDate.textContent = '⇅'; iconDate.style.color = ''; iconDate.style.opacity = '0.6'; }
    if (iconStatus) { iconStatus.textContent = '⇅'; iconStatus.style.color = ''; iconStatus.style.opacity = '0.6'; }
    if (iconPayment) { iconPayment.textContent = '⇅'; iconPayment.style.color = ''; iconPayment.style.opacity = '0.6'; }

    if (currentOrderSort === 'date-desc' && iconDate) {
      iconDate.textContent = '↓';
      iconDate.style.color = 'var(--color-primary-600)';
      iconDate.style.opacity = '1';
    } else if (currentOrderSort === 'date-asc' && iconDate) {
      iconDate.textContent = '↑';
      iconDate.style.color = 'var(--color-primary-600)';
      iconDate.style.opacity = '1';
    } else if (currentOrderSort === 'status-asc' && iconStatus) {
      iconStatus.textContent = '↑';
      iconStatus.style.color = 'var(--color-primary-600)';
      iconStatus.style.opacity = '1';
    } else if (currentOrderSort === 'status-desc' && iconStatus) {
      iconStatus.textContent = '↓';
      iconStatus.style.color = 'var(--color-primary-600)';
      iconStatus.style.opacity = '1';
    } else if ((currentOrderSort === 'payment-high' || currentOrderSort === 'payment-status') && iconPayment) {
      iconPayment.textContent = '↓';
      iconPayment.style.color = 'var(--color-primary-600)';
      iconPayment.style.opacity = '1';
    } else if (currentOrderSort === 'payment-low' && iconPayment) {
      iconPayment.textContent = '↑';
      iconPayment.style.color = 'var(--color-primary-600)';
      iconPayment.style.opacity = '1';
    }
  }

  const orderSortSelect = document.getElementById('orderSortSelect');
  if (orderSortSelect) {
    orderSortSelect.value = currentOrderSort;
    orderSortSelect.addEventListener('change', () => {
      currentOrderSort = orderSortSelect.value;
      updateOrderSortIndicators();
      renderOrders();
    });
  }

  document.querySelectorAll('.admin-th-sortable').forEach(th => {
    th.addEventListener('click', () => {
      const field = th.dataset.sortField;
      if (field === 'date') {
        currentOrderSort = (currentOrderSort === 'date-desc') ? 'date-asc' : 'date-desc';
      } else if (field === 'status') {
        currentOrderSort = (currentOrderSort === 'status-asc') ? 'status-desc' : 'status-asc';
      } else if (field === 'payment') {
        if (currentOrderSort === 'payment-high') {
          currentOrderSort = 'payment-low';
        } else if (currentOrderSort === 'payment-low') {
          currentOrderSort = 'payment-status';
        } else {
          currentOrderSort = 'payment-high';
        }
      }
      if (orderSortSelect) orderSortSelect.value = currentOrderSort;
      updateOrderSortIndicators();
      renderOrders();
    });
  });

  function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /* =========================================================================
     9. SEARCH & FILTER ATTACHMENTS
     ========================================================================= */

  // Global search redirect / filter
  const globalSearch = document.getElementById('adminGlobalSearch');
  if (globalSearch) {
    globalSearch.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const q = globalSearch.value.trim();
        if (q) {
          // If on products page, filter products, otherwise jump to products
          if (window.location.pathname.includes('/admin/products')) {
            const prodInput = document.getElementById('productSearchInput');
            if (prodInput) {
              prodInput.value = q;
              renderProducts();
            }
          } else {
            window.location.href = `/admin/products?q=${encodeURIComponent(q)}`;
          }
        }
      }
    });
  }

  // Banner filters
  const bannerSearch = document.getElementById('bannerSearchInput');
  const bannerStatus = document.getElementById('bannerStatusFilter');
  if (bannerSearch) bannerSearch.addEventListener('input', renderBanners);
  if (bannerStatus) bannerStatus.addEventListener('change', renderBanners);

  // Product filters
  const prodSearch = document.getElementById('productSearchInput');
  const prodCat = document.getElementById('productCategoryFilter');
  const prodStock = document.getElementById('productStockFilter');
  const prodReset = document.getElementById('resetProductFiltersBtn');
  if (prodSearch) prodSearch.addEventListener('input', renderProducts);
  if (prodCat) prodCat.addEventListener('change', renderProducts);
  if (prodStock) prodStock.addEventListener('change', renderProducts);
  if (prodReset) {
    prodReset.addEventListener('click', () => {
      if (prodSearch) prodSearch.value = '';
      if (prodCat) prodCat.value = 'all';
      if (prodStock) prodStock.value = 'all';
      renderProducts();
    });
  }

  // User filters
  const userSearch = document.getElementById('userSearchInput');
  const userRole = document.getElementById('userRoleFilter');
  const userReset = document.getElementById('resetUserFiltersBtn');
  if (userSearch) userSearch.addEventListener('input', renderUsers);
  if (userRole) userRole.addEventListener('change', renderUsers);
  if (userReset) {
    userReset.addEventListener('click', () => {
      if (userSearch) userSearch.value = '';
      if (userRole) userRole.value = 'all';
      renderUsers();
    });
  }

  // Order filters
  const orderSearch = document.getElementById('orderSearchInput');
  const orderReset = document.getElementById('resetOrderFiltersBtn');
  if (orderSearch) orderSearch.addEventListener('input', renderOrders);
  if (orderReset) {
    orderReset.addEventListener('click', () => {
      if (orderSearch) orderSearch.value = '';
      currentOrderFilter = 'all';
      if (filterChipsContainer) {
        filterChipsContainer.querySelectorAll('.orders-filter-chip').forEach(c => c.classList.remove('active'));
        const firstChip = filterChipsContainer.querySelector('[data-filter="all"]');
        if (firstChip) firstChip.classList.add('active');
      }
      renderOrders();
    });
  }

  /* =========================================================================
     10. ADMIN USER HYDRATION & PROFILE MANAGEMENT
     ========================================================================= */

  function hydrateAdminUser() {
    let authUser = null;
    try {
      const stored = localStorage.getItem('authUser');
      if (stored) authUser = JSON.parse(stored);
    } catch (e) { }

    if (!authUser) return;

    const username = authUser.username || authUser.name || 'Admin User';
    const email = authUser.email || 'admin@enterprisestore.com';
    const phone = authUser.phone_number || authUser.phone || '';
    const role = authUser.role || 'ADMIN';
    const initials = username.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'AU';

    // Update Header
    const hdrName = document.getElementById('headerUserName');
    if (hdrName) hdrName.textContent = username;
    const hdrRole = document.getElementById('headerUserRole');
    if (hdrRole) hdrRole.textContent = role;
    const hdrAvatar = document.getElementById('headerUserAvatar');
    if (hdrAvatar) hdrAvatar.textContent = initials;

    // Update Dropdown
    const dropName = document.getElementById('dropdownUserName');
    if (dropName) dropName.textContent = username;
    const dropEmail = document.getElementById('dropdownUserEmail');
    if (dropEmail) dropEmail.textContent = email;
    const dropAvatar = document.getElementById('dropdownUserAvatar');
    if (dropAvatar) dropAvatar.textContent = initials;

    // Update Sidebar
    const sideName = document.getElementById('sidebarUserName');
    if (sideName) sideName.textContent = username;
    const sideAvatar = document.getElementById('sidebarUserAvatar');
    if (sideAvatar) sideAvatar.textContent = initials;

    // Update Profile Page if present
    const profName = document.getElementById('adminProfileDisplayName');
    if (profName) profName.textContent = username;
    const profEmail = document.getElementById('adminProfileDisplayEmail');
    if (profEmail) profEmail.textContent = email;
    const profAvatar = document.getElementById('adminProfileLargeAvatar');
    if (profAvatar) profAvatar.textContent = initials;

    const inputName = document.getElementById('adminFullNameInput');
    if (inputName && !inputName.value) inputName.value = username;
    const inputEmail = document.getElementById('adminEmailInput');
    if (inputEmail && !inputEmail.value) inputEmail.value = email;
    const inputPhone = document.getElementById('adminPhoneInput');
    if (inputPhone && !inputPhone.value && phone) inputPhone.value = phone;
  }

  function initAdminProfilePage() {
    // 1. Password Visibility Toggles
    document.querySelectorAll('[data-toggle-pass]').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-toggle-pass');
        const input = document.getElementById(targetId);
        if (!input) return;
        const isPass = input.type === 'password';
        input.type = isPass ? 'text' : 'password';
        btn.style.color = isPass ? 'var(--color-primary-600)' : 'var(--color-text-muted)';
      });
    });

    // 2. Personal Info Form (Real Database Updates via /api/admin/profile)
    const personalForm = document.getElementById('adminPersonalForm');
    const saveProfileBtn = document.getElementById('saveAdminProfileBtn');
    if (personalForm) {
      personalForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('adminFullNameInput')?.value.trim();
        const email = document.getElementById('adminEmailInput')?.value.trim();
        const phone = document.getElementById('adminPhoneInput')?.value.trim();

        if (!username || !email) {
          showAdminToast('Username and email cannot be blank.', 'warning');
          return;
        }

        if (saveProfileBtn) {
          saveProfileBtn.disabled = true;
          saveProfileBtn.textContent = 'Saving Changes...';
        }

        try {
          const res = await fetch('/api/admin/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, phone })
          });

          const json = await res.json();
          if (!res.ok || !json.success) {
            throw new Error(json.message || 'Failed to save profile changes.');
          }

          const updatedUser = json.data;

          // Update localStorage authUser
          let authUser = {};
          try {
            const stored = localStorage.getItem('authUser');
            if (stored) authUser = JSON.parse(stored);
          } catch (e) {}
          authUser.username = updatedUser.username;
          authUser.email = updatedUser.email;
          authUser.phone_number = updatedUser.phone_number;
          localStorage.setItem('authUser', JSON.stringify(authUser));

          // Update visible DOM elements
          const profName = document.getElementById('adminProfileDisplayName');
          if (profName) profName.textContent = updatedUser.username;
          const profEmail = document.getElementById('adminProfileDisplayEmail');
          if (profEmail) profEmail.textContent = updatedUser.email;
          const hdrName = document.getElementById('headerUserName');
          if (hdrName) hdrName.textContent = updatedUser.username;
          const sideName = document.getElementById('sidebarUserName');
          if (sideName) sideName.textContent = updatedUser.username;

          if (updatedUser.avatar) {
            const profAv = document.getElementById('adminProfileLargeAvatar');
            if (profAv) profAv.textContent = updatedUser.avatar;
            const hdrAv = document.getElementById('headerUserAvatar');
            if (hdrAv) hdrAv.textContent = updatedUser.avatar;
            const sideAv = document.getElementById('sidebarUserAvatar');
            if (sideAv) sideAv.textContent = updatedUser.avatar;
          }

          showAdminToast(json.message || 'Admin profile details saved to database successfully!');
        } catch (err) {
          showAdminToast(err.message || 'Failed to save profile changes.', 'error');
        } finally {
          if (saveProfileBtn) {
            saveProfileBtn.disabled = false;
            saveProfileBtn.textContent = 'Save Profile Changes';
          }
        }
      });
    }

    // 3. Password Live Validation & Form Submit (Real Database Password Update)
    const newPassInput = document.getElementById('adminNewPass');
    const confirmPassInput = document.getElementById('adminConfirmPass');
    const chkLength = document.getElementById('chkLength');
    const chkNumber = document.getElementById('chkNumber');
    const chkMatch = document.getElementById('chkMatch');

    function validatePasswordInputs() {
      const val = newPassInput?.value || '';
      const conf = confirmPassInput?.value || '';

      const hasLen = val.length >= 8;
      const hasNum = /\d/.test(val);
      const matches = val.length > 0 && val === conf;

      if (chkLength) {
        chkLength.classList.toggle('admin-checklist-item--valid', hasLen);
        chkLength.textContent = (hasLen ? '✓ ' : '● ') + 'At least 8 characters';
      }
      if (chkNumber) {
        chkNumber.classList.toggle('admin-checklist-item--valid', hasNum);
        chkNumber.textContent = (hasNum ? '✓ ' : '● ') + 'Contains a number';
      }
      if (chkMatch) {
        chkMatch.classList.toggle('admin-checklist-item--valid', matches);
        chkMatch.textContent = (matches ? '✓ ' : '● ') + 'Passwords match';
      }

      return hasLen && hasNum && matches;
    }

    if (newPassInput) newPassInput.addEventListener('input', validatePasswordInputs);
    if (confirmPassInput) confirmPassInput.addEventListener('input', validatePasswordInputs);

    const passForm = document.getElementById('adminPasswordForm');
    const updatePassBtn = document.getElementById('updateAdminPasswordBtn');
    if (passForm) {
      passForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const curPass = document.getElementById('adminCurrentPass')?.value || '';
        if (!curPass) {
          showAdminToast('Please enter your current password.', 'warning');
          return;
        }

        const valid = validatePasswordInputs();
        if (!valid) {
          showAdminToast('Please fulfill all password requirements before updating.', 'warning');
          return;
        }

        const newPass = newPassInput?.value || '';

        if (updatePassBtn) {
          updatePassBtn.disabled = true;
          updatePassBtn.textContent = 'Updating Password...';
        }

        try {
          const res = await fetch('/api/admin/profile/password', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentPassword: curPass, newPassword: newPass })
          });

          const json = await res.json();
          if (!res.ok || !json.success) {
            throw new Error(json.message || 'Failed to update password.');
          }

          passForm.reset();
          validatePasswordInputs();
          showAdminToast(json.message || 'Password updated securely in database!');
        } catch (err) {
          showAdminToast(err.message || 'Failed to update password.', 'error');
        } finally {
          if (updatePassBtn) {
            updatePassBtn.disabled = false;
            updatePassBtn.textContent = 'Update Password';
          }
        }
      });
    }
  }

  // Keyboard shortcut Ctrl+K to focus search
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      const search = document.getElementById('adminGlobalSearch');
      if (search) {
        search.focus();
        search.select();
      }
    }
  });

  /* =========================================================================
     11. INITIALIZATION
     ========================================================================= */

  document.addEventListener('DOMContentLoaded', async () => {
    hydrateAdminUser();
    if (useApi) {
      await Promise.allSettled([
        loadLiveBanners(),
        loadLiveProducts(),
        loadLiveOrders(),
        loadUsersFromDb()
      ]);
    }
    initDashboard();
    setupBannerImageControls();
    setupProductImageControls();
    renderBanners();
    renderProducts();
    renderUsers();
    renderOrders();
    initAdminCancelModal();
    initAdminProfilePage();
  });

}());
