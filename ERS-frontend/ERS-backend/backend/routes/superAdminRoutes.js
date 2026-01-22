import express from "express";
import { protect, verifySuperAdmin } from "../middleware/authMiddleware.js";

import Admin from "../models/Admin.js";
import Role from "../models/Role.js";
import Event from "../models/Event.js";
import Registration from "../models/Registration.js";

import {
  getSuperAdminProfile,
  getSuperAdminDashboard
} from "../controllers/superAdminController.js";

const router = express.Router();

/* ================= SUPERADMIN PROFILE & DASHBOARD ================= */
router.get("/profile", protect, verifySuperAdmin, getSuperAdminProfile);
router.get("/dashboard", protect, verifySuperAdmin, getSuperAdminDashboard);

/* ================= CREATE ADMIN / SUB-ADMIN ================= */
router.post("/admin", protect, verifySuperAdmin, async (req, res) => {
  try {
    const { name, email, password, roleName } = req.body;

    if (!name || !email || !password || !roleName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const role = await Role.findOne({ name: roleName });
    if (!role) return res.status(404).json({ message: "Invalid role" });

    const admin = await Admin.create({
      name,
      email,
      password,
      role: role._id,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: role.name
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ================= VIEW ADMINS ================= */
router.get("/admins", protect, verifySuperAdmin, async (req, res) => {
  try {
    const admins = await Admin.find()
      .populate("role", "name")
      .select("-password");

    res.json({ success: true, admins });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ================= UPDATE ADMIN ================= */
router.put("/admin/:id", protect, verifySuperAdmin, async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    if (req.body.roleName) {
      const role = await Role.findOne({ name: req.body.roleName });
      if (!role) return res.status(404).json({ message: "Role not found" });
      admin.role = role._id;
    }

    admin.name = req.body.name || admin.name;
    admin.email = req.body.email || admin.email;

    await admin.save();
    res.json({ success: true, admin });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ================= DELETE ADMIN ================= */
router.delete("/admin/:id", protect, verifySuperAdmin, async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    await admin.deleteOne();
    res.json({ success: true, message: "Admin deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ================= CREATE EVENT ================= */
router.post("/event", protect, verifySuperAdmin, async (req, res) => {
  try {
    const { title, description, date, location, assignedAdmin } = req.body;

    if (!title || !date || !assignedAdmin) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const event = await Event.create({
      title,
      description,
      date,
      location,
      createdBy: req.user._id,
      assignedAdmin
    });

    res.status(201).json({ success: true, event });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ================= VIEW EVENTS ================= */
router.get("/events", protect, verifySuperAdmin, async (req, res) => {
  try {
    const events = await Event.find().populate("assignedAdmin", "name email");
    res.json({ success: true, events });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ================= EVENTS WITH PARTICIPANTS ================= */
router.get(
  "/events-with-participants",
  protect,
  verifySuperAdmin,
  async (req, res) => {
    try {
      const events = await Event.find()
        .populate("assignedAdmin", "name email")
        .lean();

      for (let event of events) {
        const regs = await Registration.find({ eventId: event._id }).populate(
          "user",
          "name email"
        );

        event.participants = regs.map((r) => r.user);
        event.participantCount = event.participants.length;
      }

      res.json({ success: true, events });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

export default router;
