import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import Admin from "../models/Admin.js";
import SuperAdmin from "../models/SuperAdmin.js";
import sendEmail from "../utils/sendEmail.js";

/**
 * Helper: generate token with role and rememberMe expiry
 */
const generateToken = (id, role, rememberMe = false) => {
  const expiresIn = rememberMe ? "30d" : "1d";
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn });
};

/* =================== USER ================ */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "All fields required" });

    const e = email.trim().toLowerCase();
    const exists = await User.findOne({ email: e });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email: e, password: hashed });
    res.status(201).json({ message: "User registered", user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error("registerUser:", err);
    res.status(500).json({ message: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });

    const e = email.trim().toLowerCase();
    const user = await User.findOne({ email: e });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user._id, "USER", rememberMe);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: "USER" } });
  } catch (err) {
    console.error("loginUser:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ================ ADMIN (created by SuperAdmin) =============== */
export const loginAdmin = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });

    const e = email.trim().toLowerCase();
    const admin = await Admin.findOne({ email: e });
    if (!admin) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(admin._id, "ADMIN", rememberMe);
    res.json({ token, admin: { id: admin._id, name: admin.name, email: admin.email, role: "Admin" } });
  } catch (err) {
    console.error("loginAdmin:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ================= SuperAdmin login (DB record created by seed) ================= */
export const loginSuperAdmin = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });

    const e = email.trim().toLowerCase();
    const sa = await SuperAdmin.findOne({ email: e });
    if (!sa) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, sa.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(sa._id, "SUPER_ADMIN", rememberMe);
    res.json({ token, superAdmin: { id: sa._id, name: sa.name, email: sa.email, role: "SuperAdmin" } });
  } catch (err) {
    console.error("loginSuperAdmin:", err);
    res.status(500).json({ message: err.message });
  }
};

/* =================== PASSWORD RESET (User & Admin) =================== */
/* Helper to generate raw token and save hashed token to model */
const setResetTokenOnDoc = (doc) => {
  const raw = crypto.randomBytes(32).toString("hex");
  const hashed = crypto.createHash("sha256").update(raw).digest("hex");
  doc.resetPasswordToken = hashed;
  doc.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
  return raw;
};

// Forgot password - User
export const forgotPasswordUser = async (req, res) => {
  try {
    const email = (req.body.email || "").trim().toLowerCase();
    if (!email) return res.status(400).json({ message: "Email required" });

    const user = await User.findOne({ email });
    if (user) {
      // Generate raw token and save hashed version
      const raw = setResetTokenOnDoc(user);
      await user.save();

      // Construct frontend URL dynamically
      const frontendBase = process.env.FRONTEND_URL || "http://localhost:3000";
      const resetUrl = `${frontendBase}/reset-password/user/${raw}`;

      const html = `
        <p>Hello ${user.name},</p>
        <p>You requested a password reset. Click the link below (valid 15 minutes):</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>If you did not request this, ignore this email.</p>
      `;

      await sendEmail(user.email, "Password Reset - User", html);
    }

    res.json({ message: "If that email exists, a reset link has been sent." });
  } catch (err) {
    console.error("forgotPasswordUser:", err);
    res.status(500).json({ message: err.message });
  }
};


// Reset password - User
export const resetPasswordUser = async (req, res) => {
  try {
    const token = req.params.token;
    const { password } = req.body;
    if (!password) return res.status(400).json({ message: "New password required" });

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });
    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("resetPasswordUser:", err);
    res.status(500).json({ message: err.message });
  }
};

// Forgot password - Admin
export const forgotPasswordAdmin = async (req, res) => {
  try {
    const email = (req.body.email || "").trim().toLowerCase();
    if (!email) return res.status(400).json({ message: "Email required" });

    const admin = await Admin.findOne({ email });
    if (admin) {
      const raw = setResetTokenOnDoc(admin);
      await admin.save();

      const frontendBase = process.env.FRONTEND_URL || "http://localhost:3000";
      const resetUrl = `${frontendBase}/reset-password/admin/${raw}`;

      const html = `
        <p>Hello ${admin.name},</p>
        <p>You requested a password reset (Admin). Click the link below (valid 15 minutes):</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>If you did not request this, ignore this email.</p>
      `;

      await sendEmail(admin.email, "Password Reset - Admin", html);
    }

    res.json({ message: "If that email exists, a reset link has been sent." });
  } catch (err) {
    console.error("forgotPasswordAdmin:", err);
    res.status(500).json({ message: err.message });
  }
};

// Reset password - Admin
export const resetPasswordAdmin = async (req, res) => {
  try {
    const token = req.params.token;
    const { password } = req.body;
    if (!password) return res.status(400).json({ message: "New password required" });

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const admin = await Admin.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });
    if (!admin) return res.status(400).json({ message: "Invalid or expired token" });

    admin.password = await bcrypt.hash(password, 10);
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpire = undefined;
    await admin.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("resetPasswordAdmin:", err);
    res.status(500).json({ message: err.message });
  }
};
