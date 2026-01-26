import express from "express";
import { protect, verifyAdminOrSuperAdmin } from "../middleware/authMiddleware.js";
import {
  getAdminDashboard,
  listEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  listRegistrations,
  getEventParticipants,
  downloadParticipantsCSV,
  downloadParticipantsPDF,
  createSubAdmin,
  getMySubAdmins,
  updateSubAdmin,
  deleteSubAdmin
} from "../controllers/adminController.js";

const router = express.Router();

router.use(protect, verifyAdminOrSuperAdmin);

router.get("/dashboard", getAdminDashboard);

router.get("/events", listEvents);
router.post("/events", createEvent);
router.put("/events/:id", updateEvent);
router.delete("/events/:id", deleteEvent);

router.get("/registrations", listRegistrations);
router.get("/events/:eventId/participants", getEventParticipants);
router.get("/events/:eventId/download/csv", downloadParticipantsCSV);
router.get("/events/:eventId/download/pdf", downloadParticipantsPDF);

router.get("/subadmins", getMySubAdmins);
router.post("/subadmins", createSubAdmin);
router.put("/subadmins/:id", updateSubAdmin);
router.delete("/subadmins/:id", deleteSubAdmin);

export default router;
