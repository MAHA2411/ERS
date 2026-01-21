import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import SuperAdmin from "../models/SuperAdmin.js";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ message: "Authorization token missing" });

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let account;

    if (decoded.role === "SUPER_ADMIN") {
      account = await SuperAdmin.findById(decoded.id).select("-password");
    } else if (decoded.role === "ADMIN") {
      account = await Admin.findById(decoded.id).select("-password");
    } else if (decoded.role === "USER") {
      account = await User.findById(decoded.id).select("-password");
    }

    if (!account)
      return res.status(401).json({ message: "Account not found" });

    req.user = {
      _id: account._id,
      role: decoded.role,
      name: account.name,
      email: account.email,
    };

    next();
  } catch (err) {
    return res.status(401).json({
      message:
        err.name === "TokenExpiredError" ? "Token expired" : "Invalid token",
    });
  }
};

export const verifySuperAdmin = (req, res, next) => {
  if (req.user.role !== "SUPER_ADMIN")
    return res.status(403).json({ message: "Super Admin access only" });
  next();
};

export const verifyAdminOrSuperAdmin = (req, res, next) => {
  if (req.user.role === "ADMIN" || req.user.role === "SUPER_ADMIN") return next();
  return res.status(403).json({ message: "Admin access only" });
};
