# Feature Tracker & In-Depth Codebase Review (Tracker)

## 1. Feature Status Summary Table

| Feature Area | Module / Route | Current State | Status | Immediate Update Needed? |
|---|---|---|---|---|
| **Marketing Landing Page** | `/` | Fully built with 9 modular partials | Completed | No (Stable) |
| **Store Shopping Hub** | `/home` | Header, Category Strip, 7 carousels | Completed | No (Stable) |
| **Category Browsing (PLP)** | `/products/:category` | Filter chips, sort, grid, pagination | Completed (Static) | Yes (Connect to DB) |
| **Product Detail Page (PDP)**| `/product/:id` | Gallery, variant select, specs, EMI | Completed (Static) | Yes (Connect to DB) |
| **User Authentication** | `/login`, `/register`, `/logout` | Database + JWT + Cookie auth | Completed | **Yes (Fix token expiry mismatch)** |
| **Password Recovery** | `/forgot-password`, `/otp`, `/reset-password` | Stub pages only | **Missing** | Yes |
| **User Profile Info** | `/profile` (`GET/POST /api/profile`) | Fetches & updates username | Incomplete | **Yes (Add gender & phone update)** |
| **Address Book** | `/profile/addresses` | List & Create APIs built; Edit/Delete local | Incomplete | **Yes (Add PUT/DELETE API endpoints)** |
| **Shopping Cart** | `/cart` | Stub page | **Missing** | Yes |
| **Checkout & Payments** | `/checkout` | Stub page | **Missing** | Yes |
| **Orders & History** | `/orders` | Complete UI with search & drawer | Incomplete (Mock) | Yes (DB model & orders API) |
| **WhatsApp Inquiry Tool** | Widget / Float | Encodes store context | Completed | No (Stable) |
| **Physical Store Locator** | Partial / Modal | Map links, hours, phone | Completed | No (Stable) |

---

## 2. In-Depth Feature Review & Recommendations

---

### Feature 1: User Authentication & Session Management
1. **Current Implementation & Purpose**:
   - Split-screen UI (`auth.ejs`) supporting login and registration.
   - Backend controller (`authcontroller.js`), service (`authServices.js`), repository (`userRepository.js`), middleware (`jwtmiddleware.js`).
   - Session stored in HTTP-only `authToken` cookie.
2. **Requirements Match**: Matches basic registration and login requirements, but has a critical session discrepancy.
3. **Inconsistencies & Deficiencies**:
   - **Critical Bug / Token Expiry Mismatch**:
     - `RegisterService` issues JWT with `expiresIn: '7d'`.
     - `LoginService` issues JWT with `expiresIn: '1h'`.
     - The `authToken` cookie `maxAge` is `7 days`.
     - *Result*: Users who log in get locked out after 1 hour (HTTP 401) while the cookie persists for 7 days.
   - **Empty / Dead Code Files**:
     - `src/features/auth/routes/userRoutes.js` is 0 bytes (empty).
     - `src/models/user.js` is 0 bytes (empty).
   - **Legacy Auth Templates**:
     - `frontend/views/pages/auth/login.ejs` and `register.ejs` are duplicate templates not used by the routing layer (`auth.ejs` is used instead).
4. **Suggestions for Improvement**:
   - **Security**: Standardize JWT expiration to 7 days (or implement 15-minute access token + 7-day refresh token rotation).
   - **Maintainability**: Remove or consolidate empty files (`userRoutes.js`, `models/user.js`) and unused legacy templates.
5. **Missing Edge Cases & Validation**:
   - Backend does not validate phone number format (only checks uniqueness on PostgreSQL).
   - Email format is validated on registration but not sanitized on login (case insensitivity).
6. **New Functionality**:
   - Implement Password Reset via Email/SMS OTP (`/forgot-password`, `/otp`, `/reset-password`).
   - Social Login (Google / Apple OAuth).
7. **Priority**: **IMMEDIATE UPDATE REQUIRED** (Token Expiration & Validation Fix).

---

### Feature 2: User Profile & Address Book Management
1. **Current Implementation & Purpose**:
   - Profile UI (`profile.ejs` & `profile.js`) allows users to view personal details and manage saved addresses.
   - Backend routes: `GET /api/profile`, `POST /api/profile`, `GET /api/profile/addresses`, `POST /api/profile/address`.
2. **Requirements Match**: Partially matches; address creation and retrieval work via database, but update and delete operations fall back to browser `localStorage`.
3. **Inconsistencies & Deficiencies**:
   - **Missing Backend Endpoints**:
     - `PUT /api/profile/address/:id` (Update existing address).
     - `DELETE /api/profile/address/:id` (Delete address).
     - `PATCH /api/profile/address/:id/default` (Set default address).
   - **Incomplete Profile Update**:
     - Backend `POST /api/profile` only accepts and updates `username`. It ignores `gender` and `phone_number` even though the UI has gender radio buttons and the database supports `Gender` enum.
   - **Default Address Race Condition**:
     - When a new address is created with `is_default: true`, existing default addresses in PostgreSQL are not atomically unset in `addressRepository.js`.
4. **Suggestions for Improvement**:
   - Implement full RESTful address endpoints in `profileController.js`, `profileServices.js`, and `addressRepository.js`.
   - Update `profile.js` to call API for edit/delete actions and remove reliance on `localStorage.userAddresses`.
5. **Missing Edge Cases & Validation**:
   - Check that the address being edited or deleted actually belongs to the requesting `req.user.userId`.
   - Postal code validation (must be 6 digits).
6. **New Functionality**:
   - Add profile avatar photo upload (Multer / Cloudinary / S3).
   - Change password sub-panel inside profile settings.
7. **Priority**: **IMMEDIATE UPDATE REQUIRED** (Complete CRUD APIs & Default Address Logic).

---

### Feature 3: Product Catalog, Category Browsing (PLP) & Product Detail (PDP)
1. **Current Implementation & Purpose**:
   - Category pages (`/products`, `/products/:category`) with filters, sort, and pagination.
   - PDP (`/product/:id`) with gallery, variant selector, specs table, EMI partner info.
   - Uses static mock data files (`frontend/assets/data/product-data.js`, `category-plp-data.js`).
2. **Requirements Match**: UI/UX matches product requirements perfectly; however, data is decoupled from the database.
3. **Inconsistencies & Deficiencies**:
   - Products are not stored in PostgreSQL.
   - Category routes in `server.js` are statically hardcoded (`categoryRoutes` array).
   - Product stock levels are hardcoded (no real inventory tracking).
4. **Suggestions for Improvement**:
   - Create `Category`, `Product`, `ProductVariant`, and `ProductImage` models in `schema.prisma`.
   - Implement REST APIs:
     - `GET /api/products` (with query params: `category`, `brand`, `minPrice`, `maxPrice`, `sort`, `page`, `limit`).
     - `GET /api/products/:id` (full product detail with variants and specifications).
     - `GET /api/categories` (dynamic category tree).
   - Update PLP (`category-page.js`) and PDP (`pdp.js`) to fetch from API endpoints.
5. **Missing Edge Cases & Validation**:
   - Out-of-stock badge and disabling "Add to Cart" / "Buy Now" for out-of-stock items.
   - Handling non-existent product IDs gracefully with 404 views.
6. **New Functionality**:
   - Product reviews and ratings submission from authenticated buyers.
   - Product search with fuzzy search / PostgreSQL Full-Text Search.
7. **Priority**: **HIGH PRIORITY / NEXT PHASE** (Catalog DB Migration).

---

### Feature 4: Shopping Cart & Checkout
1. **Current Implementation & Purpose**:
   - Currently stub routes (`/cart`, `/checkout`) displaying the generic `pages/stub` template.
   - "Buy Now" buttons on PDP redirect to `/checkout` without passing cart context.
2. **Requirements Match**: Incomplete (Not yet built).
3. **Inconsistencies & Deficiencies**:
   - No cart state management (guest session cart or DB cart for authenticated users).
   - No checkout pipeline (Address Selection → Payment Choice → Order Placement).
4. **Suggestions for Improvement**:
   - Create `Cart` and `CartItem` models in database.
   - Build `/cart` page with item list, quantity adjusters, promo code input, price breakdown.
   - Build multi-step `/checkout` page integrating saved addresses and payment selection.
5. **Missing Edge Cases & Validation**:
   - Stock verification during checkout before accepting payment.
   - Cart item price changes between adding to cart and checkout.
6. **New Functionality**:
   - Razorpay / UPI payment gateway integration.
   - Cash on Delivery (COD) OTP verification.
7. **Priority**: **HIGH PRIORITY / NEXT PHASE**.

---

### Feature 5: Orders & Order Tracking
1. **Current Implementation & Purpose**:
   - Orders page (`/orders`) with status filter tabs, search input, and sliding detail drawer with order tracking timeline.
   - Reads from mock dataset (`frontend/assets/data/orders-data.js`).
2. **Requirements Match**: UI is complete; backend data connection is pending.
3. **Inconsistencies & Deficiencies**:
   - No `Order` or `OrderItem` database tables.
   - Orders cannot be placed dynamically through the frontend.
4. **Suggestions for Improvement**:
   - Add `Order`, `OrderItem`, and `Payment` models in Prisma schema.
   - Implement `GET /api/orders` and `GET /api/orders/:id` endpoints.
   - Connect `orders.js` to fetch authenticated user orders from the API.
5. **Missing Edge Cases & Validation**:
   - Order cancellation permissions (allow cancellation only if status is `Processing` or `Confirmed`).
   - Invoice PDF generation and download.
6. **New Functionality**:
   - Live SMS / WhatsApp delivery tracking updates.
7. **Priority**: **MEDIUM PRIORITY / PLANNED**.

---

## 3. Actionable Task Breakdown

### Immediate Updates (Sprint 1)
- [ ] **Fix JWT Expiration Inconsistency**: Align `LoginService` token expiration to `7d` matching `RegisterService` and cookie `maxAge`.
- [ ] **Add Full Address Book APIs**:
  - [ ] Implement `PUT /api/profile/address/:id` in `profileRoutes.js` and `profileController.js`.
  - [ ] Implement `DELETE /api/profile/address/:id`.
  - [ ] Implement `PATCH /api/profile/address/:id/default`.
  - [ ] Add atomic default unsetting in `addressRepository.js`.
- [ ] **Enhance Profile Update**: Update `editUser` to support updating `gender` and `phone_number`.
- [ ] **Clean Up Dead Code**: Remove empty `src/features/auth/routes/userRoutes.js` and `src/models/user.js`.

### High Priority Improvements (Sprint 2)
- [ ] **Catalog Database Schema**: Add `Product`, `Category`, `ProductVariant`, and `ProductImage` to `schema.prisma`.
- [ ] **Product APIs**: Implement `GET /api/products` and `GET /api/products/:id`.
- [ ] **Dynamic PLP & PDP**: Connect `category-page.js` and `pdp.js` to backend product APIs.

### Medium Priority Enhancements (Sprint 3)
- [ ] **Cart & Checkout Feature**: Build `/cart` and `/checkout` pages, database cart persistence, and order placement workflow.
- [ ] **Payment Integration**: Integrate Razorpay payment gateway with server-side webhook verification.
- [ ] **Password Recovery**: Implement `/forgot-password`, `/otp`, `/reset-password` with email/SMS service.
