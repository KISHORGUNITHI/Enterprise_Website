import { RegisterService, LoginService, LogoutService } from "../services/authServices.js"

const registerService = new RegisterService();
const loginService = new LoginService();
const logoutService = new LogoutService();

// Shared cookie options — httpOnly so JS can't touch it
const COOKIE_NAME = 'authToken';
const cookieOptions = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production', // HTTPS only in prod
  sameSite: 'lax',
  maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days in ms
  path:     '/',
};

export class AuthController {
  async register(req, res) {
    try {
      const result = await registerService.registerUser(req.body);
      res.cookie(COOKIE_NAME, result.token, cookieOptions);
      const { token, ...safeResult } = result;
      return res.status(201).json({
        success: true,
        message: "Registered successfully",
        data:    safeResult,
        token:   result.token,
      });
    } catch (error) {
      console.error('[AuthController.register Error]:', error);

      // Handle Unique Constraint Violations (e.g. email or phone_number already taken)
      if (error.code === 'P2002') {
        const target = error.meta?.target || [];
        const field = Array.isArray(target) ? target.join(', ') : String(target);
        const msg = field.includes('phone')
          ? 'Phone number already registered'
          : field.includes('email')
          ? 'Email already exists'
          : 'An account with these credentials already exists';
        return res.status(409).json({
          success: false,
          message: msg,
        });
      }

      const isDbConnError = error.message?.includes("Can't reach database") ||
                            error.code === 'P1001' ||
                            error.code === 'P1017' ||
                            error.code === 'ECONNRESET' ||
                            error.name === 'PrismaClientInitializationError';

      if (isDbConnError) {
        return res.status(503).json({
          success: false,
          message: 'Service temporarily unavailable. Please try again later.',
        });
      }

      return res.status(error.message === "Email already exists" ? 409 : 400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async login(req, res) {
    try {
      const result = await loginService.loginUser(req.body);
      res.cookie(COOKIE_NAME, result.token, cookieOptions);
      const { token, ...safeResult } = result;
      return res.json({
        success: true,
        data:    safeResult,
        token:   result.token,
      });
    } catch (error) {
      console.error('[AuthController.login Error]:', error);

      const isDbConnError = error.message?.includes("Can't reach database") ||
                            error.code === 'P1001' ||
                            error.code === 'P1017' ||
                            error.code === 'ECONNRESET' ||
                            error.name === 'PrismaClientInitializationError';

      return res.status(isDbConnError ? 503 : 401).json({
        success: false,
        message: isDbConnError
          ? 'Service temporarily unavailable. Please try again later.'
          : error.message,
      });
    }
  }

  logout(req, res) {
    res.clearCookie(COOKIE_NAME, { path: '/' });
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  }
}

