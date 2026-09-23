/**
 * admin.js — Enterprise Store Admin Panel Interactive Logic
 * Handles real-time API calls, search, filters, modals, drawers, and status updates.
 * Pure API mode - No mock data fallback
 */

(function () {
  'use strict';

  // =========================================================================
  // API HELPER FUNCTIONS
  // =========================================================================

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

    async updateOrderStatus(orderId, status) {
      return this.fetch(`/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
    }
  };

  // =========================================================================
  // UTILITIES & TOAST NOTIFICATIONS
  // =========================================================================

  function formatRupees(num) {
    if (typeof num !== 'number') num = Number(num) || 0;
    return '₹' + num.toLocaleString('en-IN');
  }

  function capitalize(str) {
    return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
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
    if (type === 'error') {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
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
     MOBILE SIDEBAR NAVIGATION
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
     USER PROFILE DROPDOWN & LOGOUT
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

  if (userDropdownBtn) {
    userDropdownBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleUserDropdown();
    });
  }

  // Close dropdown on outside click
  document.addEventListener('click', (e) => {
    if (userDropdownMenu && userDropdownMenu.classList.contains('open')) {
      if (!userDropdownMenu.contains(e.target) && !userDropdownBtn?.contains(e.target)) {
        toggleUserDropdown(false);
      }
    }
  });

  // Admin Logout unified handler
  function performAdminLogout() {
    showAdminToast('Logging out from admin session...', 'warning');
    try {
      fetch('/logout', { method: 'POST', credentials: 'same-origin' })
        .finally(() => {
          localStorage.removeItem('authUser');
          setTimeout(() => {
            window.location.href = '/login';
          }, 600);
        });
    } catch (e) {
      localStorage.removeItem('authUser');
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
     MODAL & DRAWER CONTROLS
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
     DASHBOARD VIEW CONTROLLER
     ========================================================================= */

  function initDashboard() {
    const ordersTbody = document.getElementById('dashboardOrdersTableBody');
    const lowStockTbody = document.getElementById('dashboardLowStockTableBody');

    // Fetch data from API
    Promise.all([API.getOrders({ limit: 5 }), API.getStats()])
      .then(([ordersRes, statsRes]) => {
        // Populate orders table
        if (ordersTbody && ordersRes.data) {
          ordersTbody.innerHTML = ordersRes.data.map(o => `
            <tr>
              <td><strong style="font-family:var(--font-mono); color:var(--color-primary-700);">${o.shortId}</strong></td>
              <td>
                <div style="font-weight:var(--font-semibold);">${o.user.username}</div>
                <div style="font-size:var(--text-xs); color:var(--color-text-muted);">${o.user.phone_number}</div>
              </td>
              <td><strong>${formatRupees(o.totalAmount)}</strong></td>
              <td>
                <span class="order-status order-status--${o.status.toLowerCase()}">
                  <span class="order-status__dot"></span>
                  ${capitalize(o.status.replace(/_/g, ' '))}
                </span>
              </td>
              <td style="font-size:var(--text-xs); color:var(--color-text-muted);">${new Date(o.createdAt).toLocaleDateString()}</td>
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

        // Update stat cards
        if (statsRes.data) {
          const stats = statsRes.data;
          const els = {
            totalProducts: document.getElementById('statTotalProducts'),
            totalUsers: document.getElementById('statTotalUsers'),
            totalOrders: document.getElementById('statTotalOrders'),
            revenue: document.getElementById('statTotalRevenue'),
            lowStock: document.getElementById('statLowStockCount'),
            pending: document.getElementById('statPendingCount'),
            banners: document.getElementById('statActiveBanners')
          };
          if (els.totalProducts) els.totalProducts.textContent = stats.totalProducts;
          if (els.totalUsers) els.totalUsers.textContent = stats.totalUsers;
          if (els.totalOrders) els.totalOrders.textContent = stats.totalOrders;
          if (els.revenue) els.revenue.textContent = formatRupees(stats.totalRevenue);
          if (els.lowStock) els.lowStock.textContent = stats.lowStockProducts;
          if (els.pending) els.pending.textContent = stats.pendingOrders;
          if (els.banners) els.banners.textContent = stats.activeBanners;
        }
      })
      .catch(err => {
        showAdminToast('Failed to load dashboard data', 'error');
        console.error('Dashboard error:', err);
      });
  }

  /* =========================================================================
     BANNER MANAGEMENT VIEW CONTROLLER
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

  function renderBanners() {
    const grid = document.getElementById('bannersGrid');
    const emptyState = document.getElementById('bannersEmptyState');
    const searchInput = document.getElementById('bannerSearchInput');
    const statusFilter = document.getElementById('bannerStatusFilter');

    if (!grid) return;

    const query = (searchInput?.value || '').trim();
    const filterStatus = statusFilter?.value || 'all';

    showAdminToast('Loading banners...', 'info');

    API.getBanners({ search: query, status: filterStatus !== 'all' ? filterStatus : undefined })
      .then(res => {
        if (!res.data || res.data.length === 0) {
          grid.innerHTML = '';
          if (emptyState) emptyState.style.display = 'flex';
          return;
        }

        if (emptyState) emptyState.style.display = 'none';

        grid.innerHTML = res.data.map(b => `
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
                <span class="badge ${b.status === 'ACTIVE' ? 'badge--success' : ''}" style="${b.status !== 'ACTIVE' ? 'background:#f4f4f5; color:#71717a;' : ''}">
                  ${capitalize(b.status)}
                </span>
              </div>

              <!-- Footer Actions -->
              <div class="admin-banner-card__footer">
                <button type="button" class="admin-btn-action" data-toggle-banner="${b.id}">
                  ${b.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
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
          btn.addEventListener('click', () => {
            API.toggleBanner(btn.dataset.toggleBanner)
              .then(res => {
                showAdminToast(`Banner ${res.data.status === 'ACTIVE' ? 'activated' : 'deactivated'}`);
                renderBanners();
              })
              .catch(() => showAdminToast('Failed to toggle banner', 'error'));
          });
        });

        grid.querySelectorAll('[data-delete-banner]').forEach(btn => {
          btn.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this banner?')) {
              API.deleteBanner(btn.dataset.deleteBanner)
                .then(() => {
                  showAdminToast('Banner deleted');
                  renderBanners();
                })
                .catch(() => showAdminToast('Failed to delete banner', 'error'));
            }
          });
        });
      })
      .catch(err => {
        showAdminToast('Failed to load banners', 'error');
        grid.innerHTML = '';
      });
  }

  function resetBannerForm() {
    const form = document.getElementById('bannerForm');
    if (form) form.reset();
    setBannerImage('');
    document.getElementById('bannerTitleInput')?.focus();
  }

  function editBanner(bannerId) {
    API.getBanners()
      .then(res => {
        const banner = res.data?.find(b => b.id === bannerId);
        if (!banner) {
          showAdminToast('Banner not found', 'error');
          return;
        }

        const form = document.getElementById('bannerForm');
        if (form) {
          document.getElementById('bannerTitleInput').value = banner.title;
          document.getElementById('bannerEyebrowInput').value = banner.eyebrow;
          document.getElementById('bannerSubtitleInput').value = banner.subtitle;
          document.getElementById('bannerSlugInput').value = banner.slug;
          document.getElementById('bannerCtaTextInput').value = banner.ctaText;
          document.getElementById('bannerBadgeInput').value = banner.badge || '';
          document.getElementById('bannerBgGradientInput').value = banner.bgGradient || '';
          document.getElementById('bannerAccentColorInput').value = banner.accentColor || '#2563eb';
          setBannerImage(banner.image || '');
          form.dataset.bannerId = bannerId;
        }
        openModal('bannerModal');
      })
      .catch(err => showAdminToast('Failed to load banner details', 'error'));
  }

  // Banner form submission
  const bannerForm = document.getElementById('bannerForm');
  if (bannerForm) {
    bannerForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const bannerId = bannerForm.dataset.bannerId;
      const bannerData = {
        title: document.getElementById('bannerTitleInput').value,
        eyebrow: document.getElementById('bannerEyebrowInput').value,
        subtitle: document.getElementById('bannerSubtitleInput').value,
        slug: document.getElementById('bannerSlugInput').value,
        ctaText: document.getElementById('bannerCtaTextInput').value,
        badge: document.getElementById('bannerBadgeInput').value || null,
        image: currentBannerImage || '',
        bgGradient: document.getElementById('bannerBgGradientInput').value,
        accentColor: document.getElementById('bannerAccentColorInput').value,
        status: 'ACTIVE'
      };

      try {
        if (bannerId) {
          await API.updateBanner(bannerId, bannerData);
          showAdminToast('Banner updated successfully');
        } else {
          await API.createBanner(bannerData);
          showAdminToast('Banner created successfully');
        }
        closeModal('bannerModal');
        resetBannerForm();
        delete bannerForm.dataset.bannerId;
        renderBanners();
      } catch (err) {
        showAdminToast('Failed to save banner', 'error');
      }
    });
  }

  /* =========================================================================
     SEARCH & FILTER LISTENERS
     ========================================================================= */

  const bannerSearchInput = document.getElementById('bannerSearchInput');
  const bannerStatusFilter = document.getElementById('bannerStatusFilter');

  if (bannerSearchInput || bannerStatusFilter) {
    [bannerSearchInput, bannerStatusFilter].forEach(el => {
      if (el) {
        el.addEventListener('change', renderBanners);
        el.addEventListener('keyup', () => {
          clearTimeout(window.bannerSearchTimeout);
          window.bannerSearchTimeout = setTimeout(renderBanners, 300);
        });
      }
    });
  }

  /* =========================================================================
     USER DRAWER
     ========================================================================= */

  function openUserDrawer(userId) {
    const drawer = document.getElementById('userDetailDrawer');
    if (!drawer) return;

    API.getUserDetail(userId)
      .then(res => {
        const user = res.data;
        const content = document.getElementById('userDetailContent');
        if (content) {
          content.innerHTML = `
            <div class="admin-drawer-detail">
              <div class="admin-detail-group">
                <label class="admin-detail-label">Username</label>
                <p>${user.username}</p>
              </div>
              <div class="admin-detail-group">
                <label class="admin-detail-label">Email</label>
                <p>${user.email}</p>
              </div>
              <div class="admin-detail-group">
                <label class="admin-detail-label">Phone</label>
                <p>${user.phone_number || 'N/A'}</p>
              </div>
              <div class="admin-detail-group">
                <label class="admin-detail-label">Role</label>
                <p>${user.role}</p>
              </div>
              <div class="admin-detail-group">
                <label class="admin-detail-label">Joined</label>
                <p>${new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          `;
        }
        drawer.classList.add('open');
      })
      .catch(err => showAdminToast('Failed to load user details', 'error'));
  }

  function closeUserDrawer() {
    const drawer = document.getElementById('userDetailDrawer');
    if (drawer) drawer.classList.remove('open');
  }

  /* =========================================================================
     ORDER DRAWER
     ========================================================================= */

  function openOrderDrawer(orderId) {
    const drawer = document.getElementById('orderDetailDrawer');
    if (!drawer) return;

    API.getOrderDetail(orderId)
      .then(res => {
        const order = res.data;
        const content = document.getElementById('orderDetailContent');
        if (content) {
          content.innerHTML = `
            <div class="admin-drawer-detail">
              <div class="admin-detail-group">
                <label class="admin-detail-label">Order ID</label>
                <p>${order.id}</p>
              </div>
              <div class="admin-detail-group">
                <label class="admin-detail-label">Customer</label>
                <p>${order.user.username}</p>
              </div>
              <div class="admin-detail-group">
                <label class="admin-detail-label">Amount</label>
                <p>${formatRupees(order.totalAmount)}</p>
              </div>
              <div class="admin-detail-group">
                <label class="admin-detail-label">Status</label>
                <select id="orderStatusSelect" style="width:100%; padding:8px; border:1px solid var(--color-border);">
                  <option value="PENDING" ${order.status === 'PENDING' ? 'selected' : ''}>Pending</option>
                  <option value="CONFIRMED" ${order.status === 'CONFIRMED' ? 'selected' : ''}>Confirmed</option>
                  <option value="SHIPPED" ${order.status === 'SHIPPED' ? 'selected' : ''}>Shipped</option>
                  <option value="DELIVERED" ${order.status === 'DELIVERED' ? 'selected' : ''}>Delivered</option>
                  <option value="CANCELLED" ${order.status === 'CANCELLED' ? 'selected' : ''}>Cancelled</option>
                </select>
                <button type="button" style="margin-top:8px; width:100%;" class="btn btn--primary" id="updateOrderStatusBtn">Update Status</button>
              </div>
              <div class="admin-detail-group">
                <label class="admin-detail-label">Date</label>
                <p>${new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          `;

          document.getElementById('updateOrderStatusBtn')?.addEventListener('click', () => {
            const newStatus = document.getElementById('orderStatusSelect').value;
            API.updateOrderStatus(orderId, newStatus)
              .then(() => {
                showAdminToast('Order status updated');
                closeOrderDrawer();
              })
              .catch(() => showAdminToast('Failed to update order status', 'error'));
          });
        }
        drawer.classList.add('open');
      })
      .catch(err => showAdminToast('Failed to load order details', 'error'));
  }

  function closeOrderDrawer() {
    const drawer = document.getElementById('orderDetailDrawer');
    if (drawer) drawer.classList.remove('open');
  }

  // Close drawer when clicking outside
  document.addEventListener('click', (e) => {
    const drawer = document.getElementById('orderDetailDrawer');
    const userDrawer = document.getElementById('userDetailDrawer');
    if (drawer && drawer.classList.contains('open') && !drawer.contains(e.target)) {
      closeOrderDrawer();
    }
    if (userDrawer && userDrawer.classList.contains('open') && !userDrawer.contains(e.target)) {
      closeUserDrawer();
    }
  });

  /* =========================================================================
     PAGE INITIALIZATION
     ========================================================================= */

  document.addEventListener('DOMContentLoaded', () => {
    setupBannerImageControls();
    
    // Initialize page based on current path
    const path = window.location.pathname;
    if (path.includes('/admin/dashboard')) {
      initDashboard();
    } else if (path.includes('/admin/banners')) {
      renderBanners();
    }
  });

})();
