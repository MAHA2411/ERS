import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createEvent,
  editEvent,
  getEvents,
  getRegistrations,
} from "../controllers/eventController.js";
import Registration from "../models/Registration.js";
import Event from "../models/Event.js";

const router = express.Router();

/* =======================
   PUBLIC ROUTES
======================= */

// ✅ Get all events
router.get("/", getEvents);

/* =======================
   PROTECTED ROUTES
======================= */

// ✅ Admin / SuperAdmin - get all registrations
// 🔥 MUST be before "/:eventId"
router.get("/registrations", protect, getRegistrations);

// ✅ Check if logged-in user registered for event
router.get("/:eventId/is-registered", protect, async (req, res) => {
  try {
    const exists = await Registration.findOne({
      eventId: req.params.eventId,
      user: req.user._id,
    });

    res.json({ registered: !!exists });
  } catch (error) {
    console.error("Error checking registration:", error);
    res.status(500).json({ message: "Failed to check registration" });
  }
});

// ✅ Get single event by ID
router.get("/:eventId", async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ message: "Failed to fetch event" });
  }
});

// ✅ Create event (Admin / SuperAdmin)
router.post("/", protect, createEvent);

// ✅ Edit event
router.put("/:id", protect, editEvent);

export default router;
