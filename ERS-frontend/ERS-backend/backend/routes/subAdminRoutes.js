import express from "express";
import {
  getAssignedEvents,
  getEventParticipants,
  downloadParticipantsCSV,
  downloadParticipantsPDF
} from "../controllers/subAdminController.js";

import { protect, protectSubAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// ---------- SubAdmin protected routes ----------
router.use(protect, protectSubAdmin);

// Only see events assigned to this SubAdmin
router.get("/my-events", getAssignedEvents);

// Participants for a specific event (only assigned events)
router.get("/events/:id/participants", getEventParticipants);
router.get("/events/:id/download/csv", downloadParticipantsCSV);
router.get("/events/:id/download/pdf", downloadParticipantsPDF);

export default router;
