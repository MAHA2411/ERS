// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import SuperAdmin from "../models/SuperAdmin.js";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // ✅ If no token, just mark user as not logged in and continue
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
    } else if (decoded.role === "ADMIN" || decoded.role === "SUB_ADMIN") {
      account = await Admin.findById(decoded.id).select("-password");
    } else if (decoded.role === "USER") {
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
      role: decoded.role === "SUB_ADMIN" ? "SUB_ADMIN" : decoded.role,
    };

    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    // Token invalid or expired → treat as not logged in
    req.user = null;
    next();
  }
};

// ====================== ROLE GUARDS ======================

// Only SUPER_ADMIN
export const verifySuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "SUPER_ADMIN") {
    return res.status(403).json({ message: "Super Admin access only" });
  }
  next();
};

// ADMIN or SUPER_ADMIN
export const verifyAdminOrSuperAdmin = (req, res, next) => {
  if (!req.user || !["ADMIN", "SUPER_ADMIN"].includes(req.user.role)) {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};
