import express from "express";
import { protect, verifySubAdmin } from "../middleware/authMiddleware.js";
import {
  getSubAdminDashboard,
  getAssignedEvents,
  getEventParticipants,
  downloadParticipantsCSV,
  downloadParticipantsPDF
} from "../controllers/subAdminController.js";

const router = express.Router();

router.use(protect, verifySubAdmin);

router.get("/dashboard", getSubAdminDashboard);
router.get("/events", getAssignedEvents);
router.get("/events/:eventId/participants", getEventParticipants);
router.get("/events/:eventId/download/csv", downloadParticipantsCSV);
router.get("/events/:eventId/download/pdf", downloadParticipantsPDF);

export default router;
