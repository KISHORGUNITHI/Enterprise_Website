/**
 * category-banner.js — Dynamic Category PLP Promo Banner Carousel
 * Powered by Circular Doubly Linked List (CircularBannerList).
 * Connects directly to GET /api/banners?category=<slug>
 */

(async function () {
  'use strict';

  const bannerWrap = document.getElementById('plpPromoBanner');
  const track = document.getElementById('plpBannerTrack');
  const prevBtn = document.getElementById('plpBannerPrev');
  const nextBtn = document.getElementById('plpBannerNext');
  const dotsWrap = document.getElementById('plpBannerDots');
  const sliderWrap = document.getElementById('plpBannerSliderWrap');

  if (!bannerWrap || !track) return;

  const slug = (bannerWrap.dataset.categorySlug || document.body.dataset.slug || '').trim().toLowerCase();
  if (!slug) return;

  // Initialize Circular Doubly Linked List
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

  const emojiMap = {
    mobiles: '📱',
    tvs: '📺',
    acs: '❄️',
    'home-theatres': '🔊',
    kitchen: '🍳',
    refrigerators: '🧊',
    all: '⚡'
  };

  const categoryEmoji = emojiMap[slug] || '✨';

  // ─── Fetch category banners from API ───────────────────────────────────────
  try {
    const res = await fetch(`/api/banners?category=${encodeURIComponent(slug)}`);
    if (!res.ok) return;

    const json = await res.json();
    if (!json.success || !Array.isArray(json.data) || json.data.length === 0) {
      // No custom DB banners found for this category; preserve SSR default banner
      return;
    }

    const mapped = json.data.map(b => ({
      id: b.id,
      title: b.title,
      eyebrow: b.eyebrow,
      subtitle: b.subtitle || '',
      ctaText: b.ctaText || 'Shop Now',
      badge: b.badge || '',
      bgGradient: b.bgGradient || 'linear-gradient(135deg, #0d1e4d 0%, #1e3d8f 100%)',
      accentColor: b.accentColor || '#f58500',
      slug: b.slug
    }));

    bannerList.fromArray(mapped);
    renderSlides();
  } catch (err) {
    console.warn('Could not fetch category banners from API:', err);
  }

  // ─── Render slides from Circular Linked List ──────────────────────────────
  function renderSlides() {
    const banners = bannerList.toArray();
    if (!banners.length) return;

    track.innerHTML = banners.map((b, i) => `
      <div class="plp-banner__slide${i === 0 ? ' active' : ''}" data-index="${i}">
        <div class="plp-banner__bg" style="background: ${b.bgGradient};" aria-hidden="true"></div>
        <div class="plp-banner__overlay" aria-hidden="true"></div>

        <div class="plp-banner__content">
          ${b.badge ? `<span class="badge badge--pill badge--accent" style="margin-bottom:8px; display:inline-block; font-size:11px;">${b.badge}</span><br/>` : ''}
          <span class="plp-banner__eyebrow">${b.eyebrow}</span>
          <h1 class="plp-banner__title">${b.title}</h1>
          <p class="plp-banner__subtitle">${b.subtitle}</p>
          <a href="#plpGrid" class="plp-banner__cta" data-cat-cta="${b.id || ''}">
            ${b.ctaText}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </a>
        </div>

        <div class="plp-banner__illustration" aria-hidden="true">
          <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="80" cy="80" r="64" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.12)" stroke-width="1.5" />
            <circle cx="80" cy="80" r="44" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" stroke-width="1" />
            <text x="80" y="88" text-anchor="middle" font-size="38" font-weight="900" fill="rgba(255,255,255,0.25)" font-family="system-ui,sans-serif">
              ${categoryEmoji}
            </text>
          </svg>
        </div>
      </div>
    `).join('');

    // Optional click analytics
    track.querySelectorAll('[data-cat-cta]').forEach(cta => {
      cta.addEventListener('click', () => {
        const bid = cta.dataset.catCta;
        if (bid) fetch(`/api/banners/${encodeURIComponent(bid)}/click`, { method: 'POST' }).catch(() => {});
      });
    });

    // If more than 1 banner, enable circular navigation controls
    if (banners.length > 1) {
      if (prevBtn) prevBtn.style.display = 'flex';
      if (nextBtn) nextBtn.style.display = 'flex';
      if (dotsWrap) {
        dotsWrap.style.display = 'flex';
        dotsWrap.innerHTML = banners.map((_, i) => `
          <button class="plp-banner__dot${i === 0 ? ' active' : ''}"
            aria-label="Go to banner ${i + 1}" data-cat-dot="${i}">
          </button>
        `).join('');

        dotsWrap.querySelectorAll('[data-cat-dot]').forEach(d => {
          d.addEventListener('click', () => {
            const idx = parseInt(d.dataset.catDot, 10);
            bannerList.goToIndex(idx);
            updateView();
            resetTimer();
          });
        });
      }

      setupControls();
    } else {
      if (prevBtn) prevBtn.style.display = 'none';
      if (nextBtn) nextBtn.style.display = 'none';
      if (dotsWrap) dotsWrap.style.display = 'none';
    }
  }

  // ─── Update slide view ─────────────────────────────────────────────────────
  function updateView() {
    const current = bannerList.getCurrentIndex();
    const slides = track.querySelectorAll('.plp-banner__slide');
    const dots = dotsWrap ? dotsWrap.querySelectorAll('.plp-banner__dot') : [];

    slides.forEach((s, idx) => {
      s.classList.toggle('active', idx === current);
    });

    if (dots.length) {
      dots.forEach((d, idx) => {
        d.classList.toggle('active', idx === current);
      });
    }

    track.style.transform = `translateX(-${current * 100}%)`;
  }

  let timer = null;
  let paused = false;
  const INTERVAL = 5000;

  function nextSlide() {
    bannerList.next();
    updateView();
  }

  function prevSlide() {
    bannerList.prev();
    updateView();
  }

  function startTimer() {
    if (bannerList.toArray().length <= 1) return;
    timer = setInterval(() => {
      if (!paused) nextSlide();
    }, INTERVAL);
  }

  function resetTimer() {
    clearInterval(timer);
    startTimer();
  }

  function setupControls() {
    if (prevBtn) {
      prevBtn.onclick = () => { prevSlide(); resetTimer(); };
    }
    if (nextBtn) {
      nextBtn.onclick = () => { nextSlide(); resetTimer(); };
    }

    if (sliderWrap) {
      sliderWrap.addEventListener('mouseenter', () => { paused = true; });
      sliderWrap.addEventListener('mouseleave', () => { paused = false; });

      let tx = 0;
      sliderWrap.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
      sliderWrap.addEventListener('touchend', e => {
        const d = tx - e.changedTouches[0].clientX;
        if (Math.abs(d) > 40) {
          d > 0 ? nextSlide() : prevSlide();
          resetTimer();
        }
      }, { passive: true });
    }

    startTimer();
  }

})();
