/**
 * home-hero.js — Home page banner carousel
 * Powered by Circular Doubly Linked List (CircularBannerList).
 * Connects with Admin banners via GET /api/banners?category=all
 */

(async function () {
  'use strict';

  const INTERVAL = 4500;

  const track    = document.getElementById('homeHeroTrack');
  const dotsWrap = document.getElementById('homeHeroDots');
  const prevBtn  = document.getElementById('homeHeroPrev');
  const nextBtn  = document.getElementById('homeHeroNext');
  const sliderEl = document.getElementById('homeHeroSlider');

  if (!track) return;

  // Initialize Circular Doubly Linked List data structure
  const bannerList = typeof window.CircularBannerList === 'function'
    ? new window.CircularBannerList()
    : {
        items: [],
        index: 0,
        fromArray(arr) { this.items = arr; this.index = 0; return this; },
        next() { this.index = (this.index + 1) % (this.items.length || 1); return { data: this.items[this.index] }; },
        prev() { this.index = (this.index - 1 + this.items.length) % (this.items.length || 1); return { data: this.items[this.index] }; },
        getCurrentIndex() { return this.index; },
        goToIndex(i) { this.index = ((i % this.items.length) + this.items.length) % (this.items.length || 1); return { data: this.items[this.index] }; },
        toArray() { return this.items; },
        isEmpty() { return this.items.length === 0; }
      };

  // ─── Inline SVG illustrations ─────────────────────────────────────────────
  const icons = {
    deals: `<svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="80" cy="80" r="60" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/>
      <path d="M55 80 L80 55 L105 80 L80 105 Z" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
      <text x="80" y="86" text-anchor="middle" font-size="22" font-weight="800" fill="rgba(255,255,255,0.85)" font-family="Arial,sans-serif">%</text>
    </svg>`,
    mobile: `<svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="80" cy="80" r="60" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/>
      <rect x="56" y="36" width="48" height="88" rx="8" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
      <rect x="63" y="48" width="34" height="56" rx="4" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
      <circle cx="80" cy="114" r="4" fill="rgba(255,255,255,0.4)"/>
    </svg>`,
    emi: `<svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="80" cy="80" r="60" fill="rgba(34,197,94,0.1)" stroke="rgba(34,197,94,0.25)" stroke-width="1.5"/>
      <rect x="45" y="60" width="70" height="48" rx="8" fill="rgba(255,255,255,0.06)" stroke="rgba(34,197,94,0.4)" stroke-width="2"/>
      <text x="80" y="92" text-anchor="middle" font-size="24" font-weight="900" fill="rgba(34,197,94,0.9)" font-family="Arial,sans-serif">0%</text>
    </svg>`,
    tv: `<svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="80" cy="80" r="60" fill="rgba(167,139,250,0.1)" stroke="rgba(167,139,250,0.2)" stroke-width="1.5"/>
      <rect x="35" y="50" width="90" height="60" rx="6" fill="rgba(255,255,255,0.06)" stroke="rgba(167,139,250,0.5)" stroke-width="2"/>
      <rect x="43" y="58" width="74" height="44" rx="3" fill="rgba(167,139,250,0.08)"/>
      <path d="M60 110 L100 110" stroke="rgba(167,139,250,0.5)" stroke-width="3" stroke-linecap="round"/>
      <path d="M75 110 L75 120" stroke="rgba(167,139,250,0.4)" stroke-width="2" stroke-linecap="round"/>
      <path d="M85 110 L85 120" stroke="rgba(167,139,250,0.4)" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    ac: `<svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="80" cy="80" r="60" fill="rgba(96,165,250,0.1)" stroke="rgba(96,165,250,0.25)" stroke-width="1.5"/>
      <rect x="30" y="56" width="100" height="48" rx="8" fill="rgba(255,255,255,0.06)" stroke="rgba(96,165,250,0.4)" stroke-width="2"/>
      <line x1="42" y1="80" x2="118" y2="80" stroke="rgba(96,165,250,0.4)" stroke-width="2" stroke-linecap="round"/>
      <line x1="42" y1="88" x2="118" y2="88" stroke="rgba(96,165,250,0.4)" stroke-width="2" stroke-linecap="round"/>
      <circle cx="116" cy="68" r="3" fill="#60a5fa"/>
    </svg>`,
    audio: `<svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="80" cy="80" r="60" fill="rgba(251,191,36,0.1)" stroke="rgba(251,191,36,0.25)" stroke-width="1.5"/>
      <rect x="25" y="70" width="110" height="24" rx="6" fill="rgba(255,255,255,0.06)" stroke="rgba(251,191,36,0.4)" stroke-width="2"/>
      <circle cx="48" cy="82" r="6" fill="rgba(251,191,36,0.6)"/>
      <circle cx="112" cy="82" r="6" fill="rgba(251,191,36,0.6)"/>
    </svg>`
  };

  // ─── Fetch live banners or fallback ───────────────────────────────────────
  async function loadBanners() {
    try {
      const res = await fetch('/api/banners?category=all');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const mapped = json.data.map(b => {
            const rawSlug = (b.slug || 'all').toLowerCase();
            let href = '/products';
            let icon = 'deals';

            if (rawSlug === 'mobiles' || rawSlug.includes('mobile')) {
              href = '/products/mobiles';
              icon = 'mobile';
            } else if (rawSlug === 'tvs' || rawSlug.includes('tv')) {
              href = '/products/tvs';
              icon = 'tv';
            } else if (rawSlug === 'acs' || rawSlug.includes('ac')) {
              href = '/products/acs';
              icon = 'ac';
            } else if (rawSlug === 'home-theatres' || rawSlug.includes('theatre') || rawSlug.includes('audio')) {
              href = '/products/home-theatres';
              icon = 'audio';
            } else if (rawSlug.startsWith('/')) {
              href = rawSlug;
            }

            return {
              id: b.id,
              title: b.title,
              eyebrow: b.eyebrow,
              subtitle: b.subtitle || '',
              badge: b.badge || 'Trending',
              cta: { label: b.ctaText || 'Shop Now', href },
              ctaAlt: { label: 'Explore Store', href: '/products' },
              bg: b.bgGradient || 'linear-gradient(135deg, #0d1e4d 0%, #1e3d8f 60%, #2f52a0 100%)',
              accent: b.accentColor || '#f58500',
              icon
            };
          });

          bannerList.fromArray(mapped);
          return;
        }
      }
    } catch (e) {
      console.warn('Could not load dynamic banners, using local fallback:', e);
    }

    // Fallback to static mock banners if DB is offline
    if (window.homeBannersData && window.homeBannersData.length > 0) {
      bannerList.fromArray(window.homeBannersData);
    }
  }

  // ─── Build slides from Circular Linked List ───────────────────────────────
  function buildSlides() {
    const banners = bannerList.toArray();
    if (!banners.length) return;

    track.innerHTML = banners.map((b, i) => `
      <div
        class="home-hero__slide${i === 0 ? ' active' : ''}"
        role="tabpanel"
        aria-label="Slide ${i + 1}: ${b.title}"
        aria-hidden="${i !== 0}"
        data-index="${i}"
        data-banner-id="${b.id || ''}"
      >
        <div class="home-hero__slide-bg" style="background:${b.bg};"></div>
        <div class="home-hero__slide-overlay"></div>

        <div class="home-hero__content">
          ${b.badge ? `<div class="home-hero__badge">${b.badge}</div>` : ''}
          <p class="home-hero__eyebrow">${b.eyebrow}</p>
          <h2 class="home-hero__title">${b.title}</h2>
          <p class="home-hero__subtitle">${b.subtitle}</p>
          <div class="home-hero__ctas">
            <a href="${b.cta.href}" class="btn btn--accent btn--lg" data-banner-cta="${b.id || ''}">
              ${b.cta.label}
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"/>
              </svg>
            </a>
            <a href="${b.ctaAlt.href}" class="btn btn--outline-inverse">
              ${b.ctaAlt.label}
            </a>
          </div>
        </div>

        <div class="home-hero__illustration" aria-hidden="true">
          ${icons[b.icon] || icons.deals}
        </div>

      </div>
    `).join('');

    // Optional click analytics
    track.querySelectorAll('[data-banner-cta]').forEach(ctaEl => {
      ctaEl.addEventListener('click', () => {
        const bid = ctaEl.dataset.bannerCta;
        if (bid) {
          fetch(`/api/banners/${encodeURIComponent(bid)}/click`, { method: 'POST' }).catch(() => {});
        }
      });
    });
  }

  // ─── Build dots ────────────────────────────────────────────────────────────
  function buildDots() {
    const banners = bannerList.toArray();
    if (!dotsWrap || !banners.length) return;

    dotsWrap.innerHTML = banners.map((_, i) => `
      <button class="home-hero__dot${i === 0 ? ' active' : ''}"
        role="tab" aria-selected="${i === 0}"
        aria-label="Go to slide ${i + 1}" data-dot="${i}">
      </button>
    `).join('');

    dotsWrap.querySelectorAll('.home-hero__dot').forEach(d => {
      d.addEventListener('click', () => {
        const idx = parseInt(d.dataset.dot, 10);
        bannerList.goToIndex(idx);
        renderCurrentSlide();
        resetTimer();
      });
    });
  }

  // ─── Render active slide using Circular Linked List current node ───────────
  function renderCurrentSlide() {
    const current = bannerList.getCurrentIndex();
    const slides = track.querySelectorAll('.home-hero__slide');
    const dots   = dotsWrap ? dotsWrap.querySelectorAll('.home-hero__dot') : [];

    slides.forEach((s, idx) => {
      const isActive = idx === current;
      s.classList.toggle('active', isActive);
      s.setAttribute('aria-hidden', String(!isActive));
    });

    if (dots.length) {
      dots.forEach((d, idx) => {
        const isActive = idx === current;
        d.classList.toggle('active', isActive);
        d.setAttribute('aria-selected', String(isActive));
      });
    }

    track.style.transform = `translateX(-${current * 100}%)`;
  }

  let timer = null;
  let paused = false;

  // Next transition: advances circular linked list (tail -> head loop)
  function stepNext() {
    bannerList.next();
    renderCurrentSlide();
  }

  // Prev transition: rewinds circular linked list (head -> tail loop)
  function stepPrev() {
    bannerList.prev();
    renderCurrentSlide();
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      stepPrev();
      resetTimer();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      stepNext();
      resetTimer();
    });
  }

  if (sliderEl) {
    sliderEl.addEventListener('mouseenter', () => { paused = true; });
    sliderEl.addEventListener('mouseleave', () => { paused = false; });

    // Touch swipe
    let tx = 0;
    sliderEl.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
    sliderEl.addEventListener('touchend', e => {
      const d = tx - e.changedTouches[0].clientX;
      if (Math.abs(d) > 40) {
        d > 0 ? stepNext() : stepPrev();
        resetTimer();
      }
    }, { passive: true });
  }

  // ─── Auto-play ─────────────────────────────────────────────────────────────
  function startTimer() {
    if (bannerList.toArray().length <= 1) return;
    timer = setInterval(() => {
      if (!paused) stepNext();
    }, INTERVAL);
  }

  function resetTimer() {
    clearInterval(timer);
    startTimer();
  }

  // ─── Init ──────────────────────────────────────────────────────────────────
  await loadBanners();
  buildSlides();
  buildDots();
  renderCurrentSlide();
  startTimer();

  // Inject illustration styles once
  if (!document.getElementById('homeHeroIllustrationStyle')) {
    const style = document.createElement('style');
    style.id = 'homeHeroIllustrationStyle';
    style.textContent = `
      .home-hero__illustration {
        position: absolute;
        right: max(var(--space-6), calc((100vw - var(--container-xl)) / 2 + var(--space-6)));
        top: 50%;
        transform: translateY(-50%);
        width: 200px;
        height: 200px;
        opacity: 0;
        transition: opacity 0.6s ease 0.4s;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .home-hero__slide.active .home-hero__illustration { opacity: 1; }
      .home-hero__illustration svg { width: 100%; height: 100%; }
      @media(max-width:768px){ .home-hero__illustration { display: none; } }
    `;
    document.head.appendChild(style);
  }

})();
