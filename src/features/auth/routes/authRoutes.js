import express from "express"
import { AuthController } from "../controllers/authcontroller.js";

const router         = express.Router();
const authController = new AuthController();

router.post('/register', authController.register.bind(authController));
router.post('/login',    authController.login.bind(authController));
router.post('/logout',   authController.logout.bind(authController));

router.get('/logout', (req, res) => {
  res.clearCookie('authToken', { path: '/' });
  res.redirect('/login');
});

router.get('/api/auth/status', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.user) {
    return res.json({
      success: true,
      isAuthenticated: true,
      user: req.user,
      isAdmin: req.user.role === 'ADMIN' || req.user.role === 'admin'
    });
  }

  return res.json({
    success: true,
    isAuthenticated: false,
    user: null,
    isAdmin: false
  });
});


router.get('/login', (req, res) => {
  if (req.user) {
    return res.redirect(req.user.role === 'ADMIN' || req.user.role === 'admin' ? '/admin/dashboard' : '/home');
  }
  res.render("pages/auth/auth");
});

router.get('/signup', (req, res) => {
  if (req.user) {
    return res.redirect(req.user.role === 'ADMIN' || req.user.role === 'admin' ? '/admin/dashboard' : '/home');
  }
  res.render("pages/auth/auth");
});

router.get('/auth', (req, res) => {
  if (req.user) {
    return res.redirect(req.user.role === 'ADMIN' || req.user.role === 'admin' ? '/admin/dashboard' : '/home');
  }
  res.render("pages/auth/auth");
});

export default router;