import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  registerUser,
  loginUser,
  forgotPasswordUser,
  resetPasswordUser,
  forgotPasswordAdmin,
  resetPasswordAdmin
} from "../controllers/authController.js";
import { loginAdminOrSuperAdmin } from "../controllers/adminAuthController.js";

const router = express.Router();

/* ================= USER ================= */
router.post("/user/register", registerUser);
router.post("/user/login", loginUser);
router.post("/user/forgot-password", forgotPasswordUser);
router.post("/user/reset-password/:token", resetPasswordUser);

/* ================= ADMIN + SUPERADMIN ================= */
router.post("/admin/login", loginAdminOrSuperAdmin);
router.post("/admin/forgot-password", forgotPasswordAdmin);
router.post("/admin/reset-password/:token", resetPasswordAdmin);

/* ================= COMMON PROFILE ================= */
// This will return the logged-in user's info regardless of role
router.get("/profile", protect, (req, res) => {
  res.json(req.user);
});

export default router;
