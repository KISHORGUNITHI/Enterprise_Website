/**
 * home-hero.js — Home page banner carousel
 * Reads window.homeBannersData from home-banners.js
 */

(function () {
  'use strict';

  const INTERVAL = 4500;

  const track    = document.getElementById('homeHeroTrack');
  const dotsWrap = document.getElementById('homeHeroDots');
  const prevBtn  = document.getElementById('homeHeroPrev');
  const nextBtn  = document.getElementById('homeHeroNext');
  const sliderEl = document.getElementById('homeHeroSlider');

  if (!track || !window.homeBannersData) return;

  const banners = window.homeBannersData;
  const total   = banners.length;
  let current   = 0;
  let timer     = null;
  let paused    = false;

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
  };

  // ─── Build slides ──────────────────────────────────────────────────────────
  function buildSlides() {
    track.innerHTML = banners.map((b, i) => `
      <div
        class="home-hero__slide${i === 0 ? ' active' : ''}"
        role="tabpanel"
        aria-label="Slide ${i + 1}: ${b.title}"
        aria-hidden="${i !== 0}"
        data-index="${i}"
      >
        <div class="home-hero__slide-bg" style="background:${b.bg};"></div>
        <div class="home-hero__slide-overlay"></div>

        <div class="home-hero__content">
          <div class="home-hero__badge">${b.badge}</div>
          <p class="home-hero__eyebrow">${b.eyebrow}</p>
          <h2 class="home-hero__title">${b.title}</h2>
          <p class="home-hero__subtitle">${b.subtitle}</p>
          <div class="home-hero__ctas">
            <a href="${b.cta.href}" class="btn btn--accent btn--lg">
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
          ${icons[b.icon] || ''}
        </div>

      </div>
    `).join('');
  }

  // ─── Build dots ────────────────────────────────────────────────────────────
  function buildDots() {
    dotsWrap.innerHTML = banners.map((_, i) => `
      <button class="home-hero__dot${i === 0 ? ' active' : ''}"
        role="tab" aria-selected="${i === 0}"
        aria-label="Go to slide ${i + 1}" data-dot="${i}">
      </button>
    `).join('');

    dotsWrap.querySelectorAll('.home-hero__dot').forEach(d => {
      d.addEventListener('click', () => { goTo(parseInt(d.dataset.dot)); resetTimer(); });
    });
  }

  // ─── Navigate ──────────────────────────────────────────────────────────────
  function goTo(index) {
    const slides = track.querySelectorAll('.home-hero__slide');
    const dots   = dotsWrap.querySelectorAll('.home-hero__dot');

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
  }

  prevBtn.addEventListener('click', () => { goTo(current - 1); resetTimer(); });
  nextBtn.addEventListener('click', () => { goTo(current + 1); resetTimer(); });

  sliderEl.addEventListener('mouseenter', () => { paused = true; });
  sliderEl.addEventListener('mouseleave', () => { paused = false; });

  // Touch swipe
  let tx = 0;
  sliderEl.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  sliderEl.addEventListener('touchend', e => {
    const d = tx - e.changedTouches[0].clientX;
    if (Math.abs(d) > 40) { d > 0 ? goTo(current + 1) : goTo(current - 1); resetTimer(); }
  }, { passive: true });

  // ─── Auto-play ─────────────────────────────────────────────────────────────
  function startTimer() {
    timer = setInterval(() => { if (!paused) goTo(current + 1); }, INTERVAL);
  }

  function resetTimer() {
    clearInterval(timer);
    startTimer();
  }

  // ─── Init ──────────────────────────────────────────────────────────────────
  buildSlides();
  buildDots();
  startTimer();

  // Inject illustration styles once
  const style = document.createElement('style');
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

})();
