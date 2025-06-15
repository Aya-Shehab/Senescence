import jwt from "jsonwebtoken";
import User from "../models/user.js";

// Frontend auth middleware
export default function (allowedRoles) {
  allowedRoles = allowedRoles || [];

  return async function (req, res, next) {
    try {
      const token = req.cookies.token;

      if (!token) {
        if (req.originalUrl.startsWith('/api/')) {
          return res.status(401).json({ message: "No token provided" });
        }
        return res.status(404).render('404');
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (!user) {
        if (req.originalUrl.startsWith('/api/')) {
          return res.status(401).json({ message: "User not found" });
        }
        return res.status(404).render('404');
      }

      req.user = user; // Add user to request object

      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        if (req.originalUrl.startsWith('/api/')) {
          return res.status(403).json({ message: "Forbidden: Access denied" });
        }
        return res.status(404).render('404');
      }

      next();
    } catch (error) {
      console.error("Auth middleware error:", error);
      if (req.originalUrl.startsWith('/api/')) {
        return res.status(401).json({ message: "Invalid or expired token" });
      }
      return res.status(404).render('404');
    }
  };
}

// API auth middleware
export const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      if (req.originalUrl.startsWith('/api/')) {
        return res.status(401).json({ message: "No token provided" });
      }
      return res.status(404).render('404');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      if (req.originalUrl.startsWith('/api/')) {
        return res.status(401).json({ message: "User not found" });
      }
      return res.status(404).render('404');
    }

    req.user = user; // Add user to request object
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    if (req.originalUrl.startsWith('/api/')) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    return res.status(404).render('404');
  }
};

export const isAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      if (req.originalUrl.startsWith('/api/')) {
        return res.status(401).json({ message: "Authentication required" });
      }
      return res.status(404).render('404');
    }

    if (req.user.role !== 'admin') {
      if (req.originalUrl.startsWith('/api/')) {
        return res.status(403).json({ message: "Access denied. Admin only." });
      }
      return res.status(404).render('404');
    }

    next();
  } catch (error) {
    console.error("Admin check error:", error);
    if (req.originalUrl.startsWith('/api/')) {
      return res.status(403).json({ message: "Access denied" });
    }
    return res.status(404).render('404');
  }
};
