// backend/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import SuperAdmin from "../models/SuperAdmin.js";
import User from "../models/User.js";

/**
 * Decode JWT and attach user info to req.user
 */
export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    req.user = null;
    return next();
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let account = null;

    if (decoded.role === "SUPER_ADMIN") {
      account = await SuperAdmin.findById(decoded.id).select("-password");
    } else if (decoded.role === "SUB_ADMIN") {
      account = await Admin.findById(decoded.id).select("-password");
    } else {
      // Default / User
      account = await User.findById(decoded.id).select("-password");
    }

    if (!account) {
      req.user = null;
      return next();
    }

    req.user = {
      _id: account._id,
      name: account.name,
      email: account.email,
      role: decoded.role, // SUPER_ADMIN / SUB_ADMIN
      assignedEvents: account.assignedEvents || [], // for SubAdmin
    };

    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    req.user = null;
    next();
  }
};

// SuperAdmin only
export const protectSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "SUPER_ADMIN") {
    return res.status(403).json({ message: "SuperAdmin access only" });
  }
  next();
};

// SubAdmin only
export const protectSubAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "SUB_ADMIN") {
    return res.status(403).json({ message: "SubAdmin access only" });
  }
  next();
};

// Require login (any authenticated user)
export const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
};
