import jwt from "jsonwebtoken";

// Frontend auth middleware
export default function (allowedRoles) {
  allowedRoles = allowedRoles || [];

  return async function (req, res, next) {
    try {
      const token = req.cookies.token;

      if (!token) {
        // return res.status(401).json({ message: "No token provided" });
        return res.status(401).redirect("/")
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
        // return res.status(403).json({ message: "Forbidden: Access denied" });
        return res.status(403).redirect("/")
      }

      next();
    } catch (error) {
      return res.status(401).redirect("/")
      res
        .status(401)
        .json({ message: "Invalid or expired token", error: error.message });
    }
  };
}

// API auth middleware
export const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const isAdmin = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }
    next();
  } catch (error) {
    return res.status(403).json({ message: "Access denied" });
  }
};
