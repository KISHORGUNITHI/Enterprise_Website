import { RegisterService, LoginService } from "../services/authServices.js"

const registerService = new RegisterService();
const loginService    = new LoginService();

// Shared cookie options — httpOnly so JS can't touch it
const COOKIE_NAME = 'authToken';
const cookieOptions = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production', // HTTPS only in prod
  sameSite: 'strict',
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
      });
    } catch (error) {
      const isDbError = error.message?.includes("Can't reach database") ||
                        error.code === 'P1001' ||
                        error.constructor?.name?.startsWith('Prisma');
      if (isDbError) {
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
      });
    } catch (error) {
      const isDbError = error.message?.includes("Can't reach database") ||
                        error.code === 'P1001' ||
                        error.constructor?.name?.startsWith('Prisma');
      return res.status(isDbError ? 503 : 401).json({
        success: false,
        message: isDbError
          ? 'Service temporarily unavailable. Please try again later.'
          : error.message,
      });
    }
  }

  logout(req, res) {
    res.clearCookie(COOKIE_NAME, { path: '/' });
    return res.json({ success: true });
  }
}
