/**
 * hero-slider.js — Enterprise Store Hero Carousel
 * Reads bannersData from window.bannersData (banners.js must load first).
 * Features: auto-play, manual arrows, dot nav, progress bar, pause on hover, touch/drag.
 */

(function () {
  'use strict';

  // ─── Config ────────────────────────────────────────────────────────────────
  const AUTOPLAY_INTERVAL = 5000; // ms per slide
  const TRANSITION_SPEED  = 700;  // must match hero.css transition

  // ─── SVG Illustrations (inline, no image files needed) ────────────────────
  const illustrations = {
    smartphone: `
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="55" y="20" width="90" height="160" rx="16" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
        <rect x="65" y="38" width="70" height="108" rx="6" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
        <circle cx="100" cy="165" r="7" fill="rgba(255,255,255,0.25)" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
        <rect x="82" y="26" width="22" height="4" rx="2" fill="rgba(255,255,255,0.3)"/>
        <!-- Screen content -->
        <rect x="72" y="46" width="56" height="8" rx="4" fill="rgba(255,255,255,0.25)"/>
        <rect x="72" y="62" width="40" height="5" rx="2.5" fill="rgba(255,255,255,0.12)"/>
        <rect x="72" y="74" width="48" height="5" rx="2.5" fill="rgba(255,255,255,0.12)"/>
        <rect x="72" y="92" width="56" height="30" rx="6" fill="rgba(245,133,0,0.3)" stroke="rgba(245,133,0,0.5)" stroke-width="1"/>
        <rect x="72" y="130" width="24" height="10" rx="5" fill="rgba(255,255,255,0.2)"/>
        <rect x="104" y="130" width="24" height="10" rx="5" fill="rgba(30,61,143,0.5)" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
      </svg>`,
    festival: `
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- TV -->
        <rect x="25" y="55" width="150" height="100" rx="10" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
        <rect x="35" y="65" width="130" height="75" rx="5" fill="rgba(255,255,255,0.05)"/>
        <!-- TV legs -->
        <rect x="70" y="155" width="10" height="20" rx="3" fill="rgba(255,255,255,0.2)"/>
        <rect x="120" y="155" width="10" height="20" rx="3" fill="rgba(255,255,255,0.2)"/>
        <rect x="55" y="173" width="90" height="5" rx="2.5" fill="rgba(255,255,255,0.15)"/>
        <!-- Screen content lines -->
        <rect x="50" y="78" width="80" height="6" rx="3" fill="rgba(245,133,0,0.6)"/>
        <rect x="50" y="92" width="100" height="4" rx="2" fill="rgba(255,255,255,0.2)"/>
        <rect x="50" y="104" width="70" height="4" rx="2" fill="rgba(255,255,255,0.15)"/>
        <rect x="50" y="120" width="40" height="12" rx="6" fill="rgba(245,133,0,0.4)" stroke="rgba(245,133,0,0.7)" stroke-width="1"/>
        <!-- Stars decoration -->
        <circle cx="160" cy="45" r="4" fill="rgba(245,133,0,0.8)"/>
        <circle cx="40" cy="40" r="3" fill="rgba(255,255,255,0.4)"/>
        <circle cx="175" cy="70" r="2" fill="rgba(255,255,255,0.3)"/>
      </svg>`,
    emi: `
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Card -->
        <rect x="30" y="60" width="140" height="90" rx="12" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.25)" stroke-width="2"/>
        <rect x="30" y="75" width="140" height="22" fill="rgba(255,255,255,0.06)"/>
        <!-- Chip -->
        <rect x="48" y="92" width="28" height="20" rx="4" fill="rgba(34,197,94,0.4)" stroke="rgba(34,197,94,0.6)" stroke-width="1.5"/>
        <rect x="53" y="97" width="18" height="10" rx="2" fill="rgba(34,197,94,0.25)"/>
        <!-- Card number dots -->
        <circle cx="55"  cy="125" r="3" fill="rgba(255,255,255,0.35)"/>
        <circle cx="67"  cy="125" r="3" fill="rgba(255,255,255,0.35)"/>
        <circle cx="79"  cy="125" r="3" fill="rgba(255,255,255,0.35)"/>
        <circle cx="91"  cy="125" r="3" fill="rgba(255,255,255,0.35)"/>
        <circle cx="109" cy="125" r="3" fill="rgba(255,255,255,0.35)"/>
        <circle cx="121" cy="125" r="3" fill="rgba(255,255,255,0.35)"/>
        <!-- 0% text -->
        <text x="100" y="80" text-anchor="middle" font-size="14" font-weight="700" fill="rgba(34,197,94,0.9)">0% EMI</text>
        <!-- Verified badge -->
        <circle cx="148" cy="68" r="14" fill="rgba(34,197,94,0.3)" stroke="rgba(34,197,94,0.5)" stroke-width="1.5"/>
        <path d="M141 68 l5 5 l10-10" stroke="rgba(34,197,94,1)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      </svg>`,
    exchange: `
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Old phone -->
        <rect x="28" y="50" width="62" height="100" rx="10" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/>
        <rect x="36" y="62" width="46" height="72" rx="4" fill="rgba(255,255,255,0.04)"/>
        <!-- New phone -->
        <rect x="110" y="40" width="64" height="110" rx="12" fill="rgba(167,139,250,0.2)" stroke="rgba(167,139,250,0.5)" stroke-width="2"/>
        <rect x="118" y="54" width="48" height="80" rx="5" fill="rgba(167,139,250,0.1)"/>
        <!-- Exchange arrows -->
        <path d="M98 88 L108 88 M108 88 L104 83 M108 88 L104 93" stroke="rgba(255,255,255,0.7)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M102 108 L92 108 M92 108 L96 103 M92 108 L96 113" stroke="rgba(167,139,250,0.9)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <!-- Value badge -->
        <rect x="90" y="140" width="60" height="22" rx="11" fill="rgba(167,139,250,0.3)" stroke="rgba(167,139,250,0.5)" stroke-width="1"/>
        <text x="120" y="155" text-anchor="middle" font-size="10" font-weight="700" fill="rgba(255,255,255,0.9)">Best Value</text>
      </svg>`,
    warranty: `
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Shield -->
        <path d="M100 25 L155 50 L155 100 C155 135 130 160 100 175 C70 160 45 135 45 100 L45 50 Z" fill="rgba(96,165,250,0.15)" stroke="rgba(96,165,250,0.45)" stroke-width="2"/>
        <path d="M100 38 L143 58 L143 100 C143 128 125 149 100 162 C75 149 57 128 57 100 L57 58 Z" fill="rgba(96,165,250,0.08)" stroke="rgba(96,165,250,0.25)" stroke-width="1.5"/>
        <!-- Checkmark -->
        <path d="M78 100 l16 16 l28-32" stroke="rgba(96,165,250,0.95)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        <!-- Stars around shield -->
        <circle cx="30"  cy="80"  r="3" fill="rgba(96,165,250,0.4)"/>
        <circle cx="170" cy="90"  r="3" fill="rgba(96,165,250,0.4)"/>
        <circle cx="35"  cy="130" r="2" fill="rgba(255,255,255,0.25)"/>
        <circle cx="165" cy="60"  r="2" fill="rgba(255,255,255,0.25)"/>
      </svg>`,
  };

  // ─── DOM refs ──────────────────────────────────────────────────────────────
  const track       = document.getElementById('heroTrack');
  const dotsWrapper = document.getElementById('heroDots');
  const prevBtn     = document.getElementById('heroPrev');
  const nextBtn     = document.getElementById('heroNext');
  const progressBar = document.getElementById('heroProgressBar');
  const sliderEl    = document.getElementById('heroSlider');

  if (!track || !window.bannersData) return;

  const banners = window.bannersData;
  const total   = banners.length;
  let current   = 0;
  let autoTimer = null;
  let progressTimer = null;
  let progressVal   = 0;
  let isPaused = false;

  // ─── Build slides ──────────────────────────────────────────────────────────
  function buildSlides() {
    track.innerHTML = banners.map((banner, i) => `
      <div
        class="hero__slide${i === 0 ? ' active' : ''}"
        role="tabpanel"
        aria-label="Slide ${i + 1}: ${banner.title}"
        aria-hidden="${i !== 0}"
        data-index="${i}"
        style="--slide-accent: ${banner.accentColor};"
      >
        <!-- Background -->
        <div class="hero__slide-bg" style="background: ${banner.bgGradient};"></div>
        <div class="hero__slide-overlay"></div>

        <!-- Content -->
        <div class="hero__content">
          <div class="hero__text">

            <div class="hero__badge">
              <svg class="hero__badge-icon" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M8 0l1.8 5.5H16l-4.6 3.3 1.8 5.5L8 11l-5.2 3.3 1.8-5.5L0 5.5h6.2z"/>
              </svg>
              ${banner.badge}
            </div>

            <p class="hero__eyebrow">
              <span class="hero__eyebrow-dot"></span>
              ${banner.eyebrow}
            </p>

            <h1 class="hero__title">${banner.title}</h1>
            <p class="hero__subtitle">${banner.subtitle}</p>

            <div class="hero__cta-group">
              <a
                href="${banner.cta_primary.href}"
                class="btn btn--accent btn--lg"
              >
                ${banner.cta_primary.label}
                <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"/>
                </svg>
              </a>
              <a
                href="${banner.cta_secondary.href}"
                class="btn btn--outline-inverse btn--lg"
              >
                ${banner.cta_secondary.label}
              </a>
            </div>

          </div>

          <div class="hero__illustration" aria-hidden="true">
            <div class="hero__illustration-inner">
              <div class="hero__illustration-ring"></div>
              <div class="hero__illustration-ring"></div>
              <div class="hero__illustration-svg">
                ${illustrations[banner.illustration] || ''}
              </div>
            </div>
          </div>
        </div>

      </div>
    `).join('');
  }

  // ─── Build dots ────────────────────────────────────────────────────────────
  function buildDots() {
    dotsWrapper.innerHTML = banners.map((_, i) => `
      <button
        class="hero__dot${i === 0 ? ' active' : ''}"
        role="tab"
        aria-selected="${i === 0}"
        aria-label="Go to slide ${i + 1}"
        data-dot="${i}"
      ></button>
    `).join('');

    dotsWrapper.querySelectorAll('.hero__dot').forEach((dot) => {
      dot.addEventListener('click', () => goTo(parseInt(dot.dataset.dot)));
    });
  }

  // ─── Go to slide ───────────────────────────────────────────────────────────
  function goTo(index) {
    const slides = track.querySelectorAll('.hero__slide');
    const dots   = dotsWrapper.querySelectorAll('.hero__dot');

    slides[current].classList.remove('active');
    slides[current].setAttribute('aria-hidden', 'true');
    dots[current].classList.remove('active');
    dots[current].setAttribute('aria-selected', 'false');

    current = (index + total) % total;

    slides[current].classList.add('active');
    slides[current].setAttribute('aria-hidden', 'false');
    dots[current].classList.add('active');
    dots[current].setAttribute('aria-selected', 'true');

    track.style.transform = `translateX(-${current * 100}%)`;

    resetProgress();
  }

  // ─── Auto-play ─────────────────────────────────────────────────────────────
  function startAutoPlay() {
    stopAutoPlay();
    autoTimer = setInterval(() => {
      if (!isPaused) goTo(current + 1);
    }, AUTOPLAY_INTERVAL);
    startProgress();
  }

  function stopAutoPlay() {
    clearInterval(autoTimer);
    stopProgress();
  }

  // ─── Progress bar ──────────────────────────────────────────────────────────
  function startProgress() {
    stopProgress();
    progressVal = 0;
    const step = 100 / (AUTOPLAY_INTERVAL / 100);

    progressTimer = setInterval(() => {
      if (isPaused) return;
      progressVal = Math.min(progressVal + step, 100);
      progressBar.style.width = progressVal + '%';
    }, 100);
  }

  function stopProgress() {
    clearInterval(progressTimer);
  }

  function resetProgress() {
    progressVal = 0;
    progressBar.style.width = '0%';
    startProgress();
  }

  // ─── Controls ──────────────────────────────────────────────────────────────
  prevBtn.addEventListener('click', () => { goTo(current - 1); resetAutoplay(); });
  nextBtn.addEventListener('click', () => { goTo(current + 1); resetAutoplay(); });

  function resetAutoplay() {
    stopAutoPlay();
    startAutoPlay();
  }

  // ─── Pause on hover ────────────────────────────────────────────────────────
  sliderEl.addEventListener('mouseenter', () => { isPaused = true; });
  sliderEl.addEventListener('mouseleave', () => { isPaused = false; });

  // ─── Touch / drag support ──────────────────────────────────────────────────
  let touchStartX = 0;
  let touchEndX   = 0;
  const MIN_SWIPE = 50;

  sliderEl.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  sliderEl.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].clientX;
    const delta = touchStartX - touchEndX;
    if (Math.abs(delta) > MIN_SWIPE) {
      delta > 0 ? goTo(current + 1) : goTo(current - 1);
      resetAutoplay();
    }
  }, { passive: true });

  // Mouse drag support
  let isDragging  = false;
  let dragStartX  = 0;
  let dragStarted = false;

  sliderEl.addEventListener('mousedown', (e) => {
    isDragging  = true;
    dragStartX  = e.clientX;
    dragStarted = false;
  });

  sliderEl.addEventListener('mousemove', () => {
    if (isDragging) dragStarted = true;
  });

  sliderEl.addEventListener('mouseup', (e) => {
    if (!isDragging) return;
    isDragging = false;
    if (!dragStarted) return;
    const delta = dragStartX - e.clientX;
    if (Math.abs(delta) > MIN_SWIPE) {
      delta > 0 ? goTo(current + 1) : goTo(current - 1);
      resetAutoplay();
    }
  });

  sliderEl.addEventListener('mouseleave', () => { isDragging = false; });

  // Prevent link clicks when dragging
  sliderEl.addEventListener('click', (e) => {
    if (dragStarted) e.preventDefault();
    dragStarted = false;
  });

  // ─── Keyboard navigation ───────────────────────────────────────────────────
  sliderEl.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  });

  // ─── Init ──────────────────────────────────────────────────────────────────
  buildSlides();
  buildDots();
  startAutoPlay();

})();
