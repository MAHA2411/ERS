import express from "express";
import {
  registerEvent,
  getMyRegisteredEvents,
  cancelRegistration
} from "../controllers/registerEventController.js";
import { protect, requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, requireAuth, registerEvent);
router.get("/mine", protect, requireAuth, getMyRegisteredEvents);
router.get("/user/registrations", protect, requireAuth, getMyRegisteredEvents);
router.put("/cancel/:registrationId", protect, requireAuth, cancelRegistration);

export default router;
