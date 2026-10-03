import jwt from "jsonwebtoken";
import "dotenv/config";

// Robust cookie parser — extracts a single cookie value by name
function getCookie(req, name) {
  const header = req.headers.cookie || '';
  const match  = header.split(';').map(c => c.trim()).find(c => c.startsWith(name + '='));
  if (!match) return null;
  let val = match.slice(name.length + 1);
  if (val.startsWith('"') && val.endsWith('"')) {
    val = val.slice(1, -1);
  }
  return decodeURIComponent(val);
}

const jwtAuthenticate = (req, res, next) => {
  try {
    let token = getCookie(req, 'authToken');
    let decoded = null;

    if (token) {
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (_) {
        decoded = null;
      }
    }

    // Also support Authorization header (Bearer <token>) if cookie wasn't valid
    if (!decoded && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && (parts[0] === 'Bearer' || parts[0] === 'bearer')) {
        try {
          decoded = jwt.verify(parts[1], process.env.JWT_SECRET);
          token = parts[1];
        } catch (_) {
          decoded = null;
        }
      }
    }

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Invalid or Token Expired"
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or Token Expired",
    });
  }
};

export default jwtAuthenticate;

