import jwt from "jsonwebtoken"
import "dotenv/config"

// Minimal cookie parser — extracts a single cookie value by name
function getCookie(req, name) {
  const header = req.headers.cookie || '';
  const match  = header.split(';').map(c => c.trim()).find(c => c.startsWith(name + '='));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

const jwtAuthenticate = (req, res, next) => {
  try {
    const token = getCookie(req, 'authToken');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access Denied!"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
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
