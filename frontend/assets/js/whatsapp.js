/**
 * whatsapp.js — WhatsApp section behavior
 * Reads phone input and builds a personalized wa.me URL for the Join button.
 */

(function () {
  'use strict';

  // ─── Page load reveal — always runs, regardless of which page this is on ──
  document.body.classList.add('page-loaded');

  const joinBtn    = document.getElementById('joinWhatsAppBtn');
  const phoneInput = document.querySelector('.whatsapp-section__input');

  if (!joinBtn || !phoneInput) return;

  const BASE_WA_URL = 'https://wa.me/919963657799';

  // ─── Numeric-only input enforcement ─────────────────────────────────────
  phoneInput.addEventListener('input', () => {
    // Strip anything that's not a digit
    phoneInput.value = phoneInput.value.replace(/\D/g, '');
  });

  // ─── Update Join button href based on phone number ───────────────────────
  function updateJoinLink() {
    const raw = phoneInput.value.trim();

    if (raw.length === 10) {
      // Build a personalized join link
      const personalizedUrl = `https://wa.me/919963657799?text=Hi%20Enterprise%20Store%2C%0AI%20want%20to%20receive%20your%20latest%20deals%20and%20offers%20on%20WhatsApp.%0A%0AMy%20number%3A%20%2B91${raw}`;
      joinBtn.setAttribute('href', personalizedUrl);
      joinBtn.classList.remove('btn--disabled');
    } else {
      // Fall back to default channel link
      joinBtn.setAttribute('href', BASE_WA_URL);
    }
  }

  phoneInput.addEventListener('input',  updateJoinLink);
  phoneInput.addEventListener('change', updateJoinLink);

  // ─── Store status badge ───────────────────────────────────────────────────
  // Reuse from location section if not already done
  const storeStatus = document.getElementById('storeStatus');
  if (storeStatus && !storeStatus.innerHTML.trim()) {
    setStoreStatus(storeStatus);
  }

  function setStoreStatus(el) {
    const now  = new Date();
    const day  = now.getDay();   // 0=Sun, 1=Mon, ... 6=Sat
    const hour = now.getHours();

    let isOpen = false;
    if (day >= 1 && day <= 6) {
      // Mon–Sat: 10am–9pm
      isOpen = hour >= 10 && hour < 21;
    } else if (day === 0) {
      // Sunday: 11am–7pm
      isOpen = hour >= 11 && hour < 19;
    }

    el.innerHTML = `
      <span class="location__status-badge location__status-badge--${isOpen ? 'open' : 'closed'}">
        <span class="location__status-dot location__status-dot--${isOpen ? 'open' : 'closed'}" aria-hidden="true"></span>
        ${isOpen ? 'Store is Open Now' : 'Store is Closed'}
      </span>`;
  }

  // ─── Intersection-based store status for location section ────────────────
  const locationSection = document.getElementById('location');
  if (locationSection && storeStatus) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setStoreStatus(storeStatus);
          io.disconnect();
        }
      });
    }, { threshold: 0.1 });
    io.observe(locationSection);
  }

  // ─── Scroll-reveal observer (page-level, runs on any page) ─────────────────
  const revealEls = document.querySelectorAll('.reveal, .reveal--left, .reveal--right');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    // Fallback: just show everything
    revealEls.forEach((el) => el.classList.add('visible'));
  }

  // ─── Animated counters (Achievements section) ────────────────────────────
  function animateCounter(el) {
    const target   = parseInt(el.dataset.target, 10);
    const suffix   = el.dataset.suffix || '';
    const format   = el.dataset.format;
    const duration = 2000;
    const steps    = 60;
    const stepTime = duration / steps;
    let current    = 0;

    const timer = setInterval(() => {
      current += target / steps;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }

      let display = Math.floor(current);
      if (format === 'compact' && display >= 1000) {
        display = (display / 1000).toFixed(0) + 'K';
      }
      el.textContent = display + suffix;
    }, stepTime);
  }

  const counters = document.querySelectorAll('.achievements__number[data-target]');
  if (counters.length && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    counters.forEach((counter) => counterObserver.observe(counter));
  } else {
    counters.forEach((counter) => {
      const suffix = counter.dataset.suffix || '';
      counter.textContent = counter.dataset.target + suffix;
    });
  }

  // ─── Page load reveal ────────────────────────────────────────────────────
  // (page-loaded is already added at top of this IIFE — this is a no-op safety call)
  document.body.classList.add('page-loaded');

})();
