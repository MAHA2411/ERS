import express from "express";
import { protect, verifyAdminOrSuperAdmin } from "../middleware/authMiddleware.js";
import {
  listEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  listRegistrations
} from "../controllers/adminController.js";

const router = express.Router();

// Protect these routes - Admin or SuperAdmin
router.use(protect, verifyAdminOrSuperAdmin);

// Events
router.get("/events", listEvents);
router.post("/events", createEvent);
router.put("/events/:id", updateEvent);
router.delete("/events/:id", deleteEvent);

// Registrations (for admin: their events; for superadmin: all)
router.get("/registrations", listRegistrations);

export default router;
