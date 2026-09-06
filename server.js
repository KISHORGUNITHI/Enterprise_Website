import express from 'express';
import path from 'path';
import {fileURLToPath} from 'url';
import "dotenv/config"
import authRoutes from './src/features/auth/routes/authRoutes.js'
import profileRoutes from './src/features/profile/routes/profileRoutes.js'
import productRoutes from './src/features/products/routes/productRoutes.js'
import jwtAuthenticate from './src/middleware/jwtmiddleware.js'

const app=express();
const PORT = process.env.PORT || 3001;

// Fix for __dirname when using ES modules
const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);

// Req Folder Paths generation
const viewsPath=path.join(__dirname,'frontend/views');
const publicPath=path.join(__dirname,'frontend');

// Setting EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', viewsPath);

app.use(express.json());
app.use(express.static(publicPath));
app.use(express.urlencoded({ extended: true }));

// Return malformed JSON as an API error instead of Express' HTML stack trace.
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({
      success: false,
      message: 'Request body must be valid JSON.'
    });
  }
  next(error);
});

// Authentication Routes
app.use("/",authRoutes);

// Profile API Routes
app.use("/api", profileRoutes);

// Product API Routes
app.use("/api", productRoutes);

// ─── Site-wide constants ─────────────────────────────────────────────────────
const site = {
  name:    'Kishor Enterprises',
  tagline: 'Official Electronics Store',
  phone:   '9963657799',
  wa:      'https://wa.me/919963657799',
};

// ─── Helper: render stub for pages not yet designed ──────────────────────────
function stub(label) {
  return (req, res) => {
    res.render('pages/stub', {
      title:       `${label} — ${site.name}`,
      pageLabel:   label,
      currentPath: req.path,
      site,
    });
  };
}

// =====================================================================
//  BUILT PAGES
// =====================================================================

// Landing — marketing / pre-login
app.get('/', (req, res) => {
  res.render('pages/landing', {
    title:       `${site.name} — ${site.tagline}`,
    description: 'Premium electronics at best prices. Mobiles, TVs, ACs, Refrigerators and more with 0% EMI and official warranty.',
    site,
  });
});

// Home — main shopping hub (fully built)
app.get('/home', (req, res) => {
  res.render('pages/home', {
    title:       `Home — ${site.name}`,
    description: 'Shop mobiles, TVs, ACs, refrigerators and more at Enterprise Store.',
    site,
  });
});

// =====================================================================
//  STUB ROUTES — render when designs are provided these become real pages
// =====================================================================

// Auth — combined /auth page + aliases
// app.get('/auth', (req, res) => {
//   res.render('pages/auth/auth', { title: `Sign In — ${site.name}`, site });
// });
// app.get('/login', (req, res) => {
//   res.render('pages/auth/auth', { title: `Login — ${site.name}`, site });
// });
// app.get('/signup', (req, res) => {
//   res.render('pages/auth/auth', { title: `Create Account — ${site.name}`, site });
// });
// app.get('/forgot-password', stub('Forgot Password'));
// app.get('/otp',             stub('OTP Verification'));
// app.get('/reset-password',  stub('Reset Password'));

// Products — real category page (header + strip + content area)
app.get('/products', (req, res) => {
  res.render('pages/products/category', {
    title:          `All Products — ${site.name}`,
    pageLabel:      'All Products',
    activeCategory: 'all',
    slug:           'all',
    site,
  });
});

const categoryRoutes = [
  { path: '/products/mobiles',       label: 'Mobiles',            slug: 'mobiles'        },
  { path: '/products/tvs',           label: 'TVs',                slug: 'tvs'            },
  { path: '/products/acs',           label: 'Air Conditioners',   slug: 'acs'            },
  { path: '/products/home-theatres', label: 'Home Theatres',      slug: 'home-theatres'  },
  { path: '/products/kitchen',       label: 'Kitchen Appliances', slug: 'kitchen'        },
  { path: '/products/refrigerators', label: 'Refrigerators',      slug: 'refrigerators'  },
];

categoryRoutes.forEach(({ path: routePath, label, slug }) => {
  app.get(routePath, (req, res) => {
    res.render('pages/products/category', {
      title:          `${label} — ${site.name}`,
      pageLabel:      label,
      activeCategory: slug,
      slug,
      site,
    });
  });
});
// Product detail page
app.get('/product/:id', (req, res) => {
  res.render('pages/products/detail', {
    title:     `Product Details — ${site.name}`,
    productId: req.params.id,
    site,
  });
});

// Shopping
app.get('/cart',     stub('Shopping Cart'));
app.get('/checkout', stub('Checkout'));

// Account
app.get('/orders', (req, res) => {
  res.render('pages/account/orders', {
    title: `My Orders — ${site.name}`,
    site,
  });
});
app.get('/profile', (req, res) => {
  res.render('pages/account/profile', {
    title: `My Profile — ${site.name}`,
    site,
    user: null,
  });
});

app.get('/profile/addresses', (req, res) => {
  res.render('pages/account/profile', {
    title: `Manage Addresses — ${site.name}`,
    site,
    user: null,
  });
});

// =====================================================================
//  404
// =====================================================================

app.get('/404', (req, res) => {
  res.status(404).render('pages/stub', {
    title:       `Page Not Found — ${site.name}`,
    pageLabel:   '404 — Not Found',
    currentPath: req.path,
    site,
  });
});

app.use((req, res) => {
  res.status(404).render('pages/stub', {
    title:       `Page Not Found — ${site.name}`,
    pageLabel:   '404 — Not Found',
    currentPath: req.path,
    site,
  });
});

// ─── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  Enterprise Store  →  http://localhost:${PORT}\n`);
});
