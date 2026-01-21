import Event from "../models/Event.js";
import Registration from "../models/Registration.js";

/**
 * Create Event (Admin or SuperAdmin)
 * POST /api/events
 */
export const createEvent = async (req, res) => {
  try {
    const event = await Event.create({
      ...req.body,
      createdBy: req.user._id, // track creator
    });

    res.status(201).json({ message: "Event created", event });
  } catch (err) {
    console.error("Error creating event:", err);
    res.status(500).json({ message: "Failed to create event" });
  }
};

/**
 * Edit Event
 * PUT /api/events/:id
 */
export const editEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Admin can only edit their own events
    if (req.user.role !== "SuperAdmin" && event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    Object.assign(event, req.body); // update fields
    await event.save();

    res.json({ message: "Event updated", event });
  } catch (err) {
    console.error("Error updating event:", err);
    res.status(500).json({ message: "Failed to update event" });
  }
};

/**
 * Get Events (Role-based)
 * GET /api/events
 * SuperAdmin sees all, Admin sees only their events, Public sees all (optional)
 */
export const getEvents = async (req, res) => {
  try {
    let events;
    if (!req.user) {
      // Public browsing
      events = await Event.find().select("title description date venue fee");
    } else if (req.user.role === "SuperAdmin") {
      events = await Event.find();
    } else {
      events = await Event.find({ createdBy: req.user._id });
    }

    res.json(events);
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ message: "Failed to fetch events" });
  }
};

/**
 * Get Registrations (Role-based)
 * GET /api/events/registrations
 * SuperAdmin sees all, Admin sees only their event registrations
 */
export const getRegistrations = async (req, res) => {
  try {
    let registrations;

    // SuperAdmin sees all registrations
    if (req.user.role === "SuperAdmin") {
      registrations = await Registration.find().populate("eventId", "title date venue createdBy");
    } else {
      // Admin sees registrations only for their own events
      const allRegs = await Registration.find().populate("eventId", "title date venue createdBy");
      registrations = allRegs.filter(
        (reg) => reg.eventId && reg.eventId.createdBy.toString() === req.user._id.toString()
      );
    }

    res.json(registrations);
  } catch (err) {
    console.error("Error fetching registrations:", err);
    res.status(500).json({ message: "Failed to fetch registrations" });
  }
};
