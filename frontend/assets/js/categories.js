/**
 * categories.js — Renders category cards into #categoriesGrid
 * Reads window.categoriesData from categories.js (data file must load first).
 */

(function () {
  'use strict';

  const grid = document.getElementById('categoriesGrid');
  if (!grid || !window.categoriesData) return;

  const arrowSVG = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M3 8h10M9 4l4 4-4 4"/>
  </svg>`;

  grid.innerHTML = window.categoriesData.map((cat) => `
    <a
      href="${cat.href}"
      class="categories__card"
      role="listitem"
      aria-label="${cat.label}: ${cat.description}"
      style="--card-color: ${cat.color}; --card-bg: ${cat.bgColor};"
    >
      <div class="categories__card-icon" aria-hidden="true">
        ${cat.icon}
      </div>
      <div>
        <p class="categories__card-label">${cat.label}</p>
        <p class="categories__card-desc">${cat.description}</p>
      </div>
      <div class="categories__card-arrow" aria-hidden="true">
        ${arrowSVG}
      </div>
    </a>
  `).join('');

})();
