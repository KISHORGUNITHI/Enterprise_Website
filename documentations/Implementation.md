# System Implementation & Architecture (Implementation)

## 1. Project Directory Structure

```text
Enterprise_Website/
├── documentations/                   # System & project documentation
│   ├── Appflow.md
│   ├── Design.md
│   ├── Implementation.md
│   ├── PRD.md
│   ├── Rules.md
│   ├── Schema.md
│   ├── TechSpec.md
│   ├── Tracker.md
│   └── uptodate.md
├── frontend/                         # Client-facing static assets & templates
│   ├── assets/
│   │   ├── css/                      # Modular CSS stylesheets (design tokens + components)
│   │   │   ├── variables.css         # CSS custom properties / design tokens
│   │   │   ├── base.css              # Reset and base typography
│   │   │   ├── utilities.css         # Utility classes
│   │   │   ├── navbar.css            # Navigation styling
│   │   │   ├── home-*.css            # Home-specific section styling
│   │   │   ├── category-*.css        # PLP & category header styling
│   │   │   ├── pdp.css               # Product details page styling
│   │   │   ├── profile.css           # Profile & address manager styling
│   │   │   ├── orders.css            # Order history styling
│   │   │   ├── auth-pages.css        # Login / Register split screen styling
│   │   │   └── responsive.css        # Responsive overrides & media queries
│   │   ├── data/                     # Client-side mock datasets
│   │   │   ├── banners.js            # Landing hero banners
│   │   │   ├── home-banners.js       # Home hero banners
│   │   │   ├── categories.js         # Category metadata
│   │   │   ├── category-plp-data.js  # PLP product list by category
│   │   │   ├── home-products.js      # Home carousel product lists
│   │   │   ├── product-data.js       # Full PDP product catalog records
│   │   │   └── orders-data.js        # Mock order history items
│   │   └── js/                       # Modular client-side interaction scripts
│   │       ├── auth-guard.js         # Global login required modal & pending route memory
│   │       ├── home-header.js        # Sticky header scroll sync & suggestions
│   │       ├── home-slider.js        # Horizontal drag/scroll product carousels
│   │       ├── hero-slider.js        # Landing hero banner carousel
│   │       ├── category-page.js      # PLP filtering, sorting, and pagination
│   │       ├── pdp.js                # PDP variant switcher, image gallery, specs
│   │       ├── profile.js            # Profile fetching, update, and address book
│   │       ├── orders.js             # Orders list filtering, searching, detail drawer
│   │       ├── navbar.js             # Mobile menu drawer and smooth scroll
│   │       └── whatsapp.js           # WhatsApp widget chat launcher
│   └── views/                        # EJS Server-Side Rendered Templates
│       ├── pages/                    # Top-level page views
│       │   ├── landing.ejs           # Pre-login marketing landing page (/)
│       │   ├── home.ejs              # Main shopping hub (/home)
│       │   ├── auth/                 # Auth views (auth.ejs, login.ejs, register.ejs)
│       │   ├── products/             # Category (category.ejs) and detail (detail.ejs)
│       │   ├── account/              # Orders (orders.ejs) and profile (profile.ejs)
│       │   └── stub.ejs              # Generic placeholder template for unfinished routes
│       └── partials/                 # Modular, reusable template partials (27 partials)
├── prisma/                           # Database ORM & Migrations
│   ├── schema.prisma                 # Prisma schema definition (User, Address, Enums)
│   └── migrations/                   # SQL migration history
├── src/                              # Backend application source code
│   ├── config/
│   │   └── prisma.js                 # Prisma client instance with @prisma/adapter-pg pool
│   ├── features/                     # Feature-based modular architecture
│   │   ├── auth/                     # Authentication feature module
│   │   │   ├── controllers/
│   │   │   │   └── authcontroller.js # Register, Login, Logout controller methods
│   │   │   ├── services/
│   │   │   │   └── authServices.js   # Password hashing, validation, JWT issuing
│   │   │   ├── repositories/
│   │   │   │   └── userRepository.js # Prisma User queries (findByEmail, createUser)
│   │   │   └── routes/
│   │   │       ├── authRoutes.js     # /register, /login, /logout route endpoints
│   │   │       └── userRoutes.js     # Unused stub file
│   │   └── profile/                  # Profile & Address feature module
│   │       ├── controllers/
│   │       │   └── profileController.js # Profile and Address controller methods
│   │       ├── services/
│   │       │   └── profileServices.js   # Profile business logic and address handling
│   │       ├── repositories/
│   │       │   ├── userRepository.js    # Profile user findById, updateUser
│   │       │   └── addressRepository.js # Address createAddress, getAddresses
│   │       └── routes/
│   │           └── profileRoutes.js  # /api/profile, /api/profile/address(es)
│   ├── middleware/
│   │   └── jwtmiddleware.js          # Cookie-based JWT authentication middleware
│   └── models/
│       └── user.js                   # Empty model placeholder
├── package.json                      # Node.js project manifest & scripts
├── prisma.config.ts                  # Prisma configuration
├── server.js                         # Application entrypoint & HTTP server configuration
└── README.md                         # Project introduction
```

---

## 2. Server Architecture (`server.js`)

The backend is built with **Express 5.2.1** running in ES Module (`"type": "module"`) mode on Node.js.

### Server Pipeline & Middleware Configuration
1. **Body Parsing**:
   - `express.json()` for parsing incoming JSON request bodies.
   - `express.urlencoded({ extended: true })` for URL-encoded form submissions.
   - Custom JSON Syntax Error handler converting malformed JSON errors into standard API JSON responses (`{ success: false, message: 'Request body must be valid JSON.' }`).
2. **Static Asset Serving**:
   - `express.static(path.join(__dirname, 'frontend'))` serves CSS, JS, SVG icons, and mock data files.
3. **Template Engine Configuration**:
   - EJS configured with `app.set('view engine', 'ejs')` pointing to `frontend/views`.
4. **Route Mounting**:
   - `authRoutes` mounted at `/` (handling `/login`, `/register`, `/logout`).
   - `profileRoutes` mounted at `/api` (handling `/api/profile`, `/api/profile/address`, `/api/profile/addresses`).
   - View Routes for Landing (`/`), Home (`/home`), Categories (`/products`, `/products/:slug`), Product Details (`/product/:id`), Orders (`/orders`), Profile (`/profile`, `/profile/addresses`), and Stubs (`/cart`, `/checkout`, `/forgot-password`, `/404`).

---

## 3. Backend Feature Modules

### 1. Authentication Feature (`src/features/auth`)
- **Controller (`authcontroller.js`)**:
  - `register`: Validates payload, invokes `RegisterService`, sets `authToken` HTTP-only cookie, returns sanitized user data.
  - `login`: Validates credentials, invokes `LoginService`, sets `authToken` cookie, returns sanitized user data.
  - `logout`: Clears `authToken` cookie and returns success status.
  - Error Handling: Intercepts Prisma database unreachable errors (`P1001` or database connection failures) and maps them cleanly to HTTP 503 Service Unavailable.
- **Service (`authServices.js`)**:
  - `RegisterService.registerUser`: Checks `password === confirmPassword`, verifies username length >= 3, validates uniqueness of email, checks password length >= 8, hashes password using `bcrypt.hash(password, 10)`, persists user via `userRepository`, signs JWT with 7-day expiration.
  - `LoginService.loginUser`: Retrieves user by email, executes `bcrypt.compare`, signs JWT token with payload `{ userId, email, role }`.
- **Repository (`userRepository.js`)**:
  - Encapsulates Prisma queries: `findByEmail(email)`, `createUser(userData)`.

### 2. User Profile & Address Feature (`src/features/profile`)
- **Controller (`profileController.js`)**:
  - `getProfile`: Reads authenticated `req.user.userId`, fetches user, returns sanitized profile.
  - `updateProfile`: Reads new `username` from `req.body`, executes update, returns updated profile.
  - `address`: Reads address payload from `req.body`, associates with `req.user.userId`, persists address.
  - `getAddresses`: Fetches all addresses belonging to the authenticated user ordered by `created_at desc`.
- **Service (`profileServices.js`)**:
  - `getUser(id)`: Fetches user, excludes `password_hash`.
  - `editUser(id, username)`: Updates username, excludes `password_hash`.
  - `createAddress(userId, addressData)`: Calls `addressRepository.createAddress`.
  - `getAddresses(userId)`: Calls `addressRepository.getAddresses`.
- **Repositories**:
  - `userRepository.js`: `findById(id)`, `updateUser(id, data)`.
  - `addressRepository.js`: `createAddress(userId, data)`, `getAddresses(userId)`.

### 3. Middleware (`src/middleware/jwtmiddleware.js`)
- Custom cookie extraction parses `req.headers.cookie` for `authToken`.
- Verifies token against `process.env.JWT_SECRET` via `jwt.verify()`.
- Injects decoded payload into `req.user`.
- Rejects unauthenticated requests with HTTP 401 `{ success: false, message: 'Access Denied!' }`.

---

## 4. Database Connection & Pooling (`src/config/prisma.js`)

- Utilizes PostgreSQL connection pooling with the `pg` driver (`pg.Pool`).
- Configured with `ssl: { rejectUnauthorized: false }` for cloud PostgreSQL environments.
- Bridges the connection pool to Prisma Client via `@prisma/adapter-pg` (`PrismaPg`).

---

## 5. Client-Side Implementation Details

### 1. View Engine & Modular Partial Decomposition
- `landing.ejs` and `home.ejs` assemble 27 separate partials from `frontend/views/partials/`.
- Each partial encapsulates its markup and links to component-specific CSS and JS.

### 2. Client-Side State & Storage Synchronization
- `localStorage.authUser`: Stores user profile snapshot (`{ id, username, email, phone_number, gender, role }`) on login/registration for instant UI hydration.
- `localStorage.pendingRoute`: Stores target URL when restricted actions are triggered by guest users; evaluated on successful login to redirect the user seamlessly.
- `localStorage.userAddresses`: Local address store fallback if backend API is unreachable or during transitional state updates.

### 3. Asynchronous Communication (Fetch API)
- Client scripts use `fetch()` with `credentials: 'same-origin'` and `headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }`.
- Automatically catches HTTP 401 responses on protected pages to redirect users to `/login`.
