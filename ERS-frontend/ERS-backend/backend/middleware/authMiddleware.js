import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import SuperAdmin from "../models/SuperAdmin.js";
import User from "../models/User.js";

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
    } else if (decoded.role === "ADMIN" || decoded.role === "SUB_ADMIN") {
      account = await Admin.findById(decoded.id).select("-password").populate("role", "name");
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
      role: decoded.role, // ✅ Keep role as ADMIN/SUB_ADMIN/SUPER_ADMIN
      category: account.category || "ALL",
      assignedEvents: account.assignedEvents || []
    };

    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    req.user = null;
    next();
  }
};

export const verifySuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "SUPER_ADMIN") {
    return res.status(403).json({ message: "Super Admin access only" });
  }
  next();
};

export const verifyAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};

export const verifySubAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "SUB_ADMIN") {
    return res.status(403).json({ message: "Sub Admin access only" });
  }
  next();
};

export const verifyAdminOrSuperAdmin = (req, res, next) => {
  if (!req.user || !["ADMIN", "SUPER_ADMIN"].includes(req.user.role)) {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};

export const verifyAnyAdmin = (req, res, next) => {
  if (!req.user || !["ADMIN", "SUB_ADMIN", "SUPER_ADMIN"].includes(req.user.role)) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

export const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
};
