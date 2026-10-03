import express from 'express';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import adminAuthenticate from '../../../middleware/adminAuthMiddleware.js';

import prisma from '../../../config/prisma.js';
import { AdminUserService } from '../services/AdminUserService.js';

const router = express.Router();
const userService = new AdminUserService();

// Site config
const site = {
  name: 'Kishor Enterprises',
  tagline: 'Official Electronics Store',
  phone: '9963657799',
  wa: 'https://wa.me/919963657799',
};

// Protect all admin routes with JWT admin authentication
router.use(adminAuthenticate);

async function getAdminUser(req) {
  const tokenUser = req.user || {};
  const userId = tokenUser.userId || tokenUser.id;
  if (userId) {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, username: true, email: true, phone_number: true, role: true }
      });
      if (dbUser) {
        const name = dbUser.username || 'Admin User';
        const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'AU';
        return {
          id: dbUser.id,
          username: dbUser.username,
          email: dbUser.email,
          phone_number: dbUser.phone_number || '',
          role: dbUser.role || 'ADMIN',
          avatar: initials
        };
      }
    } catch (e) {
      // fallback
    }
  }
  const name = tokenUser.username || (tokenUser.email ? tokenUser.email.split('@')[0] : 'Admin User');
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'AU';
  return {
    id: userId || 'USR-ADMIN',
    username: name,
    email: tokenUser.email || 'admin@enterprisestore.com',
    phone_number: tokenUser.phone_number || '',
    role: tokenUser.role || 'ADMIN',
    avatar: initials
  };
}

// Root admin redirects to dashboard
router.get('/', (req, res) => {
  res.redirect('/admin/dashboard');
});

// Dashboard
router.get('/dashboard', async (req, res) => {
  const adminUser = await getAdminUser(req);
  const useApi = req.query.api === 'false' ? false : true;
  res.render('pages/admin/dashboard', {
    title: `Admin Dashboard — ${site.name}`,
    pageLabel: 'Dashboard',
    activeNav: 'dashboard',
    site,
    adminUser,
    useApi
  });
});

// Banner Management
router.get('/banners', async (req, res) => {
  const adminUser = await getAdminUser(req);
  const useApi = req.query.api === 'false' ? false : true;
  res.render('pages/admin/banners', {
    title: `Banner Management — ${site.name}`,
    pageLabel: 'Banners',
    activeNav: 'banners',
    site,
    adminUser,
    useApi
  });
});

// Product & Stock Management
router.get('/products', async (req, res) => {
  const adminUser = await getAdminUser(req);
  const useApi = req.query.api === 'false' ? false : true;
  res.render('pages/admin/products', {
    title: `Product & Stock Management — ${site.name}`,
    pageLabel: 'Products',
    activeNav: 'products',
    site,
    adminUser,
    useApi
  });
});

// Registered Users
router.get('/users', async (req, res) => {
  const adminUser = await getAdminUser(req);
  const useApi = req.query.api === 'false' ? false : true;
  let totalUsers = 0;
  let initialUsers = [];
  try {
    const result = await userService.list({ limit: 100 });
    totalUsers = result.pagination?.total || result.data?.length || 0;
    initialUsers = result.data || [];
  } catch (err) {
    console.error('[adminRoutes.users Error]:', err);
  }

  res.render('pages/admin/users', {
    title: `Registered Users — ${site.name}`,
    pageLabel: 'Users',
    activeNav: 'users',
    site,
    adminUser,
    totalUsers,
    initialUsers,
    useApi
  });
});

// Order Management
router.get('/orders', async (req, res) => {
  const adminUser = await getAdminUser(req);
  const useApi = req.query.api === 'false' ? false : true;
  res.render('pages/admin/orders', {
    title: `Order Management — ${site.name}`,
    pageLabel: 'Orders',
    activeNav: 'orders',
    site,
    adminUser,
    useApi
  });
});

// Admin Profile
router.get('/profile', async (req, res) => {
  const adminUser = await getAdminUser(req);
  const useApi = req.query.api === 'false' ? false : true;
  res.render('pages/admin/profile', {
    title: `Admin Profile — ${site.name}`,
    pageLabel: 'Admin Profile',
    activeNav: 'profile',
    site,
    adminUser,
    useApi
  });
});

export default router;
