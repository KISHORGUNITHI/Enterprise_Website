# Design System & UI/UX Guidelines (Design)

## 1. Design Philosophy & Aesthetic
Enterprise Store (Kishor Enterprises) employs a modern, clean, high-conversion e-commerce design system tailored for electronics and appliances. The visual language balances trust, technical clarity, and high responsiveness.

- **Primary Brand Personality**: Trustworthy, Authoritative, Professional (Deep Indigo/Navy `#1e3a8a` / `#1d4ed8`).
- **Action / Accent Energy**: Energetic, High-Contrast Call to Action (Vibrant Amber/Orange `#ea580c` / `#f97316`).
- **Surface Strategy**: Multi-layer neutral elevation (Clean white `#ffffff`, slate background `#f8fafc`, surface border `#e2e8f0`).

---

## 2. Design Tokens & Foundations (`variables.css`)

### Color Palette

| Token Name | Hex Value | Usage / Semantic Role |
|---|---|---|
| `--color-primary-900` | `#0f172a` | Deepest brand navy, dark headers, active text |
| `--color-primary-700` | `#1d4ed8` | Primary brand accent, main interactive headers |
| `--color-primary-600` | `#2563eb` | Primary buttons, active tabs, link focus |
| `--color-primary-500` | `#3b82f6` | Hover states, icon highlights |
| `--color-primary-50`  | `#eff6ff` | Light badge background, active navigation background |
| `--color-accent-600`  | `#ea580c` | Urgent action buttons ("Buy Now", special sale badges) |
| `--color-accent-500`  | `#f97316` | Accent tags, star ratings, promo banners |
| `--color-accent-50`   | `#fff7ed` | Light accent highlights, discount chips |
| `--color-success-500` | `#22c55e` | In-stock indicators, successful order status, alerts |
| `--color-warning-500` | `#eab308` | Pending order status, rating stars, alert warnings |
| `--color-danger-500`  | `#ef4444` | Form errors, cancelled status, delete actions |
| `--color-bg-primary`  | `#ffffff` | Card surfaces, modals, elevated white containers |
| `--color-bg-secondary`| `#f8fafc` | Global body background, contrast section canvas |
| `--color-border`      | `#e2e8f0` | Subtle dividers, input borders, card outlines |

### Typography
- **Primary Typeface**: `Inter`, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif.
- **Font Scale**:
  - Display / Hero Headline: `3rem` (48px) – `3.75rem` (60px), line-height 1.1, weight 800.
  - Section Titles (H2): `1.875rem` (30px) – `2.25rem` (36px), line-height 1.2, weight 700.
  - Card Titles / H3: `1.125rem` (18px) – `1.25rem` (20px), line-height 1.35, weight 600.
  - Body Text: `0.9375rem` (15px) – `1rem` (16px), line-height 1.5, weight 400/500.
  - Caption / Metadata: `0.75rem` (12px) – `0.8125rem` (13px), line-height 1.4, weight 500.

### Elevation, Shadows & Radii
- **Border Radii**:
  - Buttons / Inputs: `var(--radius-md)` (`8px`) or `var(--radius-lg)` (`12px`).
  - Cards & Panels: `var(--radius-xl)` (`16px`).
  - Modal Panels / Hero Banners: `var(--radius-2xl)` (`24px`).
  - Pills / Badges / Chips: `var(--radius-full)` (`9999px`).
- **Shadow Scale**:
  - Default Card: `0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px 0 rgba(0, 0, 0, 0.04)`.
  - Card Hover: `0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.06)`.
  - Sticky Headers / Dropdowns: `0 4px 6px -1px rgba(0, 0, 0, 0.07)`.
  - Modals & Drawers: `0 25px 50px -12px rgba(0, 0, 0, 0.25)`.

---

## 3. Key UI Components & Layout Guidelines

### 1. Navigation & Header Hierarchy
- **Desktop Header (`home-header.ejs`)**:
  - Row 1: Brand logo + Physical store address tag + Center search input with instant drop-panel + Quick links (Orders, Account, Help, Cart badge).
  - Row 2 (`home-category-strip.ejs`): Sticky horizontal scroll strip showing 6 categories + "All Products" with real-time active indicators synchronized to page scroll offset.
- **Mobile Navbar (`navbar.ejs` & `home-header.ejs`)**:
  - Hamburger menu activating an off-canvas navigation drawer with focus trapping.
  - Mobile bottom navigation bar for quick access to Home, Categories, Orders, and Profile.

### 2. Product Card Component (`category-product-grid.ejs`, `home-product-section.ejs`)
- **Visual Structure**:
  1. Image Container (with dynamic badge for "Best Seller", "15% Off", "0% EMI").
  2. Brand metadata (`Samsung`, `Apple`, `LG`).
  3. Product title (clamped to 2 lines max).
  4. Star rating badge + numerical score.
  5. Price block: Emphasized sale price (`₹119,999`) with strikethrough original price (`₹134,999`) and green savings tag.
  6. Action CTA: "View Details" / "Add to Cart".
- **Hover Micro-interaction**: Subtle scale (`translateY(-4px)`), elevated shadow, and image zoom.

### 3. Product Detail Page (PDP Layout)
- **Desktop 2-Column Grid**:
  - Left: Sticky multi-image gallery with active thumbnail selector and zoom container.
  - Right: Scrollable buy box with brand badge, title, review score, dynamic variant selection (Storage / RAM chips), color circles, price breakdown, EMI partner badges (TVS Credit, Bajaj Finserv), and Dual CTAs ("Add to Cart" & "Buy Now").
- **Collapsible Specification Tables**: Categorized accordions for General, Display, Performance, Camera, Battery, and Warranty.
- **Mobile Sticky Action Bar**: Bottom fixed bar showing current price and dual purchase buttons on mobile screens.

### 4. Authentication Split View (`auth.ejs`)
- **Desktop**: 50/50 Split layout. Left side provides rich brand context, store advantages, warranty badges; Right side hosts clean white card with animated tab switcher for Login/Register.
- **Mobile**: Clean, centered single card with responsive spacing and quick back button.

### 5. Profile & Address Manager Layout (`profile.ejs`)
- **Sidebar + Content Grid**: Left user card displaying avatar, verified phone badge, navigation items; Right panel dynamically switches between Personal Profile and Address Manager.
- **Address Card**: Structured delivery tile with Default badge, phone, full address, Landmark highlight, and action buttons (Edit, Delete, Set as Default).

---

## 4. Accessibility & Usability Standards
1. **Focus Management**:
   - Explicit `:focus-visible` styling using `outline: 2px solid var(--color-primary-600)` with `outline-offset: 2px`.
   - Modals trap keyboard focus within the modal window while active.
2. **Keyboard Navigation**:
   - `Escape` key dismisses modals, drawers, search suggestions, and mobile navigation sheets.
   - `Tab` and `Shift+Tab` navigate interactive elements in logical order.
3. **Contrast Compliance**:
   - Text elements meet WCAG 2.1 AA contrast ratio (>= 4.5:1 for regular text, >= 3:1 for large headings).
4. **Form Ergonomics**:
   - Clear inline error messages connected with `aria-describedby` or explicit error spans.
   - Inputs include floating/clear labels, contextual placeholders, autocomplete tags, and `inputmode` attributes.

---

## 5. Responsive Breakpoint Standards

| Breakpoint | Target Devices | Layout Behavior |
|---|---|---|
| `< 640px` (`sm`) | Mobile phones | Single-column cards, sticky bottom bar, full-screen sheets |
| `640px – 768px` (`md`) | Large phones / Phablets | 2-column product grid, adjusted padding |
| `768px – 1024px` (`lg`) | Tablets / Small Laptops | 3-column product grid, sidebar filters toggleable |
| `1024px – 1280px` (`xl`) | Desktops | 4-column product grid, fixed sidebar filters, split PDP |
| `> 1280px` (`2xl`) | Large Desktops | Max container width `1280px` / `1440px` centered with auto margins |
