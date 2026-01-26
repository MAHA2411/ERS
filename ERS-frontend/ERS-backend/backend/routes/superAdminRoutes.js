import express from "express";
import {
  createEvent,
  updateEvent,
  deleteEvent,
  getAllEventsWithParticipants,
  getAllSubAdmins,
  createSubAdmin,
  updateSubAdmin,
  deleteSubAdmin,
  getEventParticipants,
  downloadParticipantsCSV,
  downloadParticipantsPDF,
  getAnalytics
} from "../controllers/superAdminController.js";

import { protect, protectSuperAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// ---------- SuperAdmin protected routes ----------
router.use(protect, protectSuperAdmin);

// Events
router.get("/events-with-participants", getAllEventsWithParticipants);
router.post("/event", createEvent);
router.put("/event/:id", updateEvent);
router.delete("/event/:id", deleteEvent);

// SubAdmins
router.get("/subadmins", getAllSubAdmins);
router.post("/subadmin", createSubAdmin);
router.put("/subadmin/:id", updateSubAdmin);
router.delete("/subadmin/:id", deleteSubAdmin);

// Event participants
router.get("/events/:id/participants", getEventParticipants);
router.get("/events/:id/download/csv", downloadParticipantsCSV);
router.get("/events/:id/download/pdf", downloadParticipantsPDF);

// Analytics
router.get("/analytics", getAnalytics);

export default router;
