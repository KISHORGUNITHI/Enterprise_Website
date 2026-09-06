# Current Project Status & Documentation Sync (uptodate)

## 1. Project Status Snapshot (September 2026)

The **Enterprise Store** (Kishor Enterprises) platform is currently in a robust **Hybrid Stage**:
- **Storefront & UI Layer**: 100% complete for core shopping pages (Landing Page, Store Hub, Category PLP, Product PDP, Split-screen Auth, Orders View, Profile & Address Book, WhatsApp float, Sticky Header & Navigation).
- **Backend & Database Layer**: Core authentication (Registration, Login, Logout) and profile retrieval/creation are live on **Express 5 + Prisma ORM + PostgreSQL**.
- **Transitional Layer**: Product catalog, categories, and order histories are currently served via client-side mock data modules (`frontend/assets/data/*.js`) pending database catalog migration.
- **Stub Layer**: Cart (`/cart`), Checkout (`/checkout`), and Password Recovery (`/forgot-password`, `/otp`, `/reset-password`) are configured as stub routes rendering `pages/stub.ejs`.

---

## 2. Component-by-Component Health & Status

| Area | Component / Subsystem | Implementation Status | Data Source | Production Readiness |
|---|---|---|---|---|
| **Storefront** | Marketing Landing Page (`/`) | Complete | EJS + Static Assets | Ready |
| **Storefront** | Store Shopping Hub (`/home`) | Complete | EJS + Data Modules | Ready |
| **Storefront** | Category PLP (`/products/*`) | Complete | `category-plp-data.js` | Functional (Needs DB) |
| **Storefront** | Product Detail (`/product/:id`) | Complete | `product-data.js` | Functional (Needs DB) |
| **Storefront** | WhatsApp & Store Locator | Complete | Inline / Dynamic Config | Ready |
| **Auth** | Split Screen Auth (`/login`) | Complete | Express + Prisma DB | Ready |
| **Auth** | JWT Session & Cookie Management | Complete | `jwtmiddleware.js` | Needs Expiry Fix |
| **Account** | Profile Management (`/profile`) | Complete | `GET/POST /api/profile` | Needs Gender/Phone Update |
| **Account** | Address Book (`/profile/addresses`)| Partial | `GET/POST /api/profile/address` | Needs PUT/DELETE Endpoints |
| **Account** | Order History (`/orders`) | Complete UI | `orders-data.js` | Needs Order DB Model |
| **Commerce** | Shopping Cart (`/cart`) | Stub | None | In Development |
| **Commerce** | Checkout & Payments (`/checkout`)| Stub | None | In Development |
| **Auth** | Password Recovery (`/forgot-password`)| Stub | None | In Development |

---

## 3. Top Technical Debt & Action Items

1. **JWT Expiration Alignment**:
   - `LoginService` currently issues 1-hour tokens while `RegisterService` and cookie options specify 7 days. Standardize login token lifetime to `7d`.
2. **Address Book API Completion**:
   - Add `PUT` and `DELETE` endpoints for `/api/profile/address/:id` so editing and deleting addresses persist to PostgreSQL rather than falling back to `localStorage`.
3. **Database Catalog Migration**:
   - Model `Category`, `Product`, `ProductVariant`, and `ProductImage` in `prisma/schema.prisma` and transition `category-page.js` / `pdp.js` from static data files to REST APIs.
4. **Codebase Clean-Up**:
   - Remove empty unused stub files: `src/features/auth/routes/userRoutes.js` and `src/models/user.js`.
   - Remove obsolete standalone auth templates (`frontend/views/pages/auth/login.ejs` and `register.ejs`) in favor of `auth.ejs`.

---

## 4. Documentation Index & Maintenance Protocol

The `documentations/` directory serves as the single source of truth for the Enterprise Store codebase:

- **`Appflow.md`**: User journeys, site navigation maps, system transitions, and page workflows.
- **`Design.md`**: Design tokens, color palettes, typography scale, UI component specs, responsive breakpoints, accessibility guidelines.
- **`Implementation.md`**: Codebase structure, server configuration, middleware pipeline, feature modules, and client-side scripts.
- **`PRD.md`**: Product vision, user personas, functional/non-functional requirements, KPIs, and phased roadmap.
- **`Rules.md`**: Business logic constraints, validation rules, RBAC permissions, and pricing/EMI formulas.
- **`Schema.md`**: Prisma database schema, current JS mock models, target ER diagram, and REST API contracts.
- **`TechSpec.md`**: Technical stack, architectural patterns, security controls, performance, and integrations.
- **`Tracker.md`**: In-depth feature review, bug findings, immediate updates, and sprint task checklist.
- **`uptodate.md`**: Executive project status summary, health matrix, technical debt tracking, and sync guidelines.

### Maintenance Protocol:
Whenever code changes, new features are implemented, or database migrations are run:
1. Update `Tracker.md` to reflect the completed tasks.
2. If database models change, update `prisma/schema.prisma` and `Schema.md`.
3. If new routes or APIs are added, update `Implementation.md`, `TechSpec.md`, and `Appflow.md`.
4. Run a sanity verification to keep `uptodate.md` synchronized with the latest deployment state.
