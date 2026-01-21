import express from "express";
import {
  registerEvent,
  getMyRegisteredEvents
} from "../controllers/registerEventController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Register for an event
// POST /api/register-event
router.post("/", protect, registerEvent);

// ✅ Get logged-in user's registered events
// GET /api/register-event/mine
router.get("/mine", protect, getMyRegisteredEvents);

// (Optional extra endpoint)
router.get("/user/registrations", protect, getMyRegisteredEvents);

export default router;
