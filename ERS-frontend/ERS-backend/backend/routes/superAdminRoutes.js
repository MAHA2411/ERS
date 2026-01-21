import express from "express";
import { protect, verifySuperAdmin } from "../middleware/authMiddleware.js";
import Admin from "../models/Admin.js";
import Event from "../models/Event.js";
import User from "../models/User.js";
import Registration from "../models/Registration.js";

const router = express.Router();

/* ================================
   SUPERADMIN PROFILE & DASHBOARD
================================ */
import {
  getSuperAdminProfile,
  getSuperAdminDashboard
} from "../controllers/superAdminController.js";

router.get("/profile", protect, verifySuperAdmin, getSuperAdminProfile);
router.get("/dashboard", protect, verifySuperAdmin, getSuperAdminDashboard);

/* ================================
   MANAGE ADMINS
================================ */
// CREATE ADMIN
router.post("/admin", protect, verifySuperAdmin, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "Missing fields" });

    const existing = await Admin.findOne({ email });
    if (existing) return res.status(400).json({ message: "Admin already exists" });

    const admin = await Admin.create({ name, email, password });
    res.status(201).json({ success: true, admin });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET ALL ADMINS
router.get("/admins", protect, verifySuperAdmin, async (req, res) => {
  const admins = await Admin.find().select("-password");
  res.status(200).json({ success: true, admins });
});

// UPDATE ADMIN
router.put("/admin/:id", protect, verifySuperAdmin, async (req, res) => {
  const admin = await Admin.findById(req.params.id);
  if (!admin) return res.status(404).json({ message: "Admin not found" });

  Object.assign(admin, req.body);
  await admin.save();
  res.status(200).json({ success: true, admin });
});

// DELETE ADMIN
router.delete("/admin/:id", protect, verifySuperAdmin, async (req, res) => {
  const admin = await Admin.findById(req.params.id);
  if (!admin) return res.status(404).json({ message: "Admin not found" });

  await admin.remove();
  res.status(200).json({ success: true, message: "Admin deleted" });
});

/* ================================
   MANAGE EVENTS
================================ */
// CREATE EVENT
router.post("/event", protect, verifySuperAdmin, async (req, res) => {
  try {
    const { title, description, date, location, assignedAdmin } = req.body;
    if (!title || !date || !assignedAdmin) return res.status(400).json({ message: "Missing fields" });

    const admin = await Admin.findById(assignedAdmin);
    if (!admin) return res.status(404).json({ message: "Assigned admin not found" });

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
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET ALL EVENTS
router.get("/events", protect, verifySuperAdmin, async (req, res) => {
  const events = await Event.find().populate("assignedAdmin", "name email");
  res.status(200).json({ success: true, events });
});

// UPDATE EVENT
router.put("/event/:id", protect, verifySuperAdmin, async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: "Event not found" });

  Object.assign(event, req.body);
  await event.save();
  res.status(200).json({ success: true, event });
});

// DELETE EVENT
router.delete("/event/:id", protect, verifySuperAdmin, async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: "Event not found" });

  await event.remove();
  res.status(200).json({ success: true, message: "Event deleted" });
});

/* ================================
   VIEW REGISTRATIONS
================================ */
router.get("/registrations", protect, verifySuperAdmin, async (req, res) => {
  const registrations = await Registration.find()
    .populate("user", "name email")
    .populate("eventId", "title date location");
  res.status(200).json({ success: true, registrations });
});

export default router;
