import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createEvent, editEvent, getEvents, getRegistrations } from "../controllers/eventController.js";
import { getMyRegisteredEvents } from "../controllers/registerEventController.js";
import Registration from "../models/Registration.js";
import Event from "../models/Event.js";

const router = express.Router();

/* PUBLIC */
router.get("/", getEvents); // all events

/* PROTECTED */
// Admin / SuperAdmin - all registrations
router.get("/registrations", protect, getRegistrations);

// Logged-in user's registered events
router.get("/mine", protect, getMyRegisteredEvents);

// Check if user registered
router.get("/:eventId/is-registered", protect, async (req, res) => {
  try {
    const exists = await Registration.findOne({
      event: req.params.eventId,
      user: req.user._id,
    });
    res.json({ registered: !!exists });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to check registration" });
  }
});

// SINGLE EVENT - MUST BE LAST
router.get("/:eventId", async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch event" });
  }
});

// Create/Edit events
router.post("/", protect, createEvent);
router.put("/:id", protect, editEvent);

export default router;
